const CACHE_NAME = 'news-cache-v1';
const API_CACHE_NAME = 'news-api-cache-v1';

// Ключи для хранения метаданных
const LAST_UPDATE_KEY = 'last-update';
const NEWS_HASH_KEY = 'news-hash';

self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    event.waitUntil(self.clients.claim());
});

// Функция для хранения данных в IndexedDB
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
                timestamp: Date.now()
            });
        }

        // Сохраняем хэш для быстрой проверки изменений
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

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === 'news-sync') {
        event.waitUntil(checkForNewNews());
    }
});

// Периодическая синхронизация (каждую минуту)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'news-update') {
        event.waitUntil(checkForNewNews());
    }
});

const checkForNewNews = async () => {
    try {
        // Здесь должен быть ваш API endpoint для получения новостей
        const response = await fetch('/api/news/latest');
        const newNews = await response.json();

        const oldHash = localStorage.getItem(NEWS_HASH_KEY);
        const newHash = await generateHash(JSON.stringify(newNews));

        if (oldHash !== newHash) {
            // Новые новости обнаружены
            await storeNewsData(newNews);

            // Показываем уведомление
            await self.registration.showNotification('Новые новости!', {
                body: `Появилось ${newNews.length} новых статей`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
                tag: 'news-update',
                actions: [
                    { action: 'open', title: 'Открыть' },
                    { action: 'dismiss', title: 'Закрыть' }
                ]
            });
        }
    } catch (error) {
        console.error('Error checking for new news:', error);
    }
};

self.addEventListener('fetch', (event) => {
    // Кэширование API запросов
    if (event.request.url.includes('/api/news')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(async (cache) => {
                try {
                    // Пытаемся получить свежие данные
                    const networkResponse = await fetch(event.request);
                    if (networkResponse.ok) {
                        await cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }
                    throw new Error('Network response not ok');
                } catch (error) {
                    // Если сеть недоступна, используем кэш
                    const cachedResponse = await cache.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Если в кэше нет данных, возвращаем данные из IndexedDB
                    const storedNews = await getStoredNews();
                    return new Response(JSON.stringify(storedNews), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            })
        );
    }
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            self.clients.matchAll().then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return self.clients.openWindow('/');
            })
        );
    }
});