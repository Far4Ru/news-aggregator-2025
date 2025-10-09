// sw.js - Service Worker для Supabase
const CACHE_NAME = 'news-cache-v1';
const API_CACHE_NAME = 'news-api-cache-v1';

// Ключи для хранения метаданных
const LAST_UPDATE_KEY = 'last-update';
const NEWS_HASH_KEY = 'news-hash';
const LAST_NEWS_CHECK_KEY = 'last-news-check';

self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    event.waitUntil(self.clients.claim());
});

// IndexedDB для хранения новостей
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NewsDatabase', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('news')) {
                const store = db.createObjectStore('news', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp');
                store.createIndex('published_at', 'published_at');
            }
            if (!db.objectStoreNames.contains('sources')) {
                db.createObjectStore('sources', { keyPath: 'id' });
            }
        };
    });
};

const storeNewsData = async (newsData) => {
    try {
        const db = await openDB();
        const transaction = db.transaction(['news'], 'readwrite');
        const store = transaction.objectStore('news');

        // Очищаем старые данные
        await store.clear();

        // Сохраняем новые данные
        for (const item of newsData) {
            store.put({
                ...item,
                cached_at: Date.now()
            });
        }

        // Сохраняем хэш и время обновления
        const hash = await generateHash(JSON.stringify(newsData));
        localStorage.setItem(NEWS_HASH_KEY, hash);
        localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString());

        return true;
    } catch (error) {
        console.error('Error storing news data:', error);
        return false;
    }
};

const getStoredNews = async () => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['news'], 'readonly');
            const store = transaction.objectStore('news');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting stored news:', error);
        return [];
    }
};

const generateHash = async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Проверка новых новостей
const checkForNewNews = async () => {
    try {
        const lastCheck = localStorage.getItem(LAST_NEWS_CHECK_KEY);
        const now = Date.now();

        // Проверяем не чаще чем раз в 30 секунд
        if (lastCheck && (now - parseInt(lastCheck)) < 30000) {
            return;
        }

        localStorage.setItem(LAST_NEWS_CHECK_KEY, now.toString());

        // Получаем последние новости из Supabase
        const lastStoredNews = await getStoredNews();
        const lastNewsDate = lastStoredNews.length > 0
            ? Math.max(...lastStoredNews.map(n => new Date(n.published_at).getTime()))
            : 0;

        // Здесь будет запрос к Supabase - имитируем его
        const newNews = await fetchLatestNewsFromSupabase(lastNewsDate);

        if (newNews && newNews.length > 0) {
            // Сохраняем новые новости
            const allNews = [...lastStoredNews, ...newNews]
                .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
                .slice(0, 1000); // Ограничиваем общее количество

            await storeNewsData(allNews);

            // Показываем уведомление
            await self.registration.showNotification('Новые новости!', {
                body: `Появилось ${newNews.length} новых статей`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: 'news-update',
                actions: [
                    { action: 'open', title: 'Открыть' },
                    { action: 'dismiss', title: 'Закрыть' }
                ],
                data: {
                    url: '/news',
                    newsCount: newNews.length
                }
            });
        }
    } catch (error) {
        console.error('Error checking for new news:', error);
    }
};

// Имитация запроса к Supabase
const fetchLatestNewsFromSupabase = async (sinceTimestamp) => {
    // В реальном приложении здесь будет запрос к Supabase
    // Например: supabase.from('news').select('*').gt('published_at', new Date(sinceTimestamp))

    // Для демонстрации возвращаем пустой массив
    return [];
};

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === 'news-sync') {
        event.waitUntil(checkForNewNews());
    }
});

// Периодическая синхронизация
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'news-update') {
        event.waitUntil(checkForNewNews());
    }
});

// Перехват запросов к Supabase
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // Кэшируем запросы новостей
    if (url.includes('/rest/v1/news') || url.includes('/rest/v1/sources')) {
        event.respondWith(
            handleSupabaseRequest(event.request)
        );
    }
});

const handleSupabaseRequest = async (request) => {
    const cache = await caches.open(API_CACHE_NAME);

    try {
        // Пытаемся получить свежие данные
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();

            // Сохраняем в кэш
            cache.put(request, responseClone);

            // Если это запрос новостей, сохраняем в IndexedDB
            if (request.url.includes('/rest/v1/news')) {
                const newsData = await responseClone.json();
                await storeNewsData(newsData);
            }

            return networkResponse;
        }

        throw new Error('Network response not ok');
    } catch (error) {
        // Если сеть недоступна, используем кэш
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Если в кэше нет данных, возвращаем данные из IndexedDB
        if (request.url.includes('/rest/v1/news')) {
            const storedNews = await getStoredNews();
            return new Response(JSON.stringify(storedNews), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Encoding': 'gzip'
                }
            });
        }

        // Для других запросов возвращаем ошибку
        return new Response(JSON.stringify({ error: 'Network unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open' || event.action === '') {
        event.waitUntil(
            self.clients.matchAll().then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return self.clients.openWindow('/news');
            })
        );
    }
});