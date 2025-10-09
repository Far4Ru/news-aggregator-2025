import { cacheHandler } from './core/cache-handler.js';
import { newsSync } from './modules/news-sync.js';
import { notificationManager } from './modules/notification-manager.js';
import { SYNC_TAGS } from './utils/constants.js';

// Инициализация Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating');
    event.waitUntil(self.clients.claim());
});

// Обработка сетевых запросов
self.addEventListener('fetch', (event) => {
    cacheHandler.handleFetch(event);
});

// Фоновая синхронизация
self.addEventListener('sync', (event) => {
    if (event.tag === SYNC_TAGS.NEWS_SYNC) {
        event.waitUntil(newsSync.checkForNewNews());
    }
});

// Периодическая синхронизация
self.addEventListener('periodicsync', (event) => {
    if (event.tag === SYNC_TAGS.NEWS_UPDATE) {
        event.waitUntil(newsSync.checkForNewNews());
    }
});

// Уведомления
self.addEventListener('notificationclick', (event) => {
    notificationManager.handleNotificationClick(event);
});

// Экспорты для тестирования (необязательно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cacheHandler,
        newsSync,
        notificationManager
    };
}