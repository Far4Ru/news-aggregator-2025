import { CACHE_NAMES } from '../utils/constants.js';
import { isCacheableRequest } from '../utils/helpers.js';
import { dbManager } from './db-manager.js';

class CacheHandler {
    constructor() {
        this.apiCacheName = CACHE_NAMES.API;
    }

    async handleSupabaseRequest(request) {
        const cache = await caches.open(this.apiCacheName);

        try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                cache.put(request, responseClone);

                if (request.url.includes('/rest/v1/news')) {
                    const newsData = await responseClone.json();
                    await dbManager.storeNewsData(newsData);
                }

                return networkResponse;
            }

            throw new Error('Network response not ok');
        } catch (error) {
            const cachedResponse = await cache.match(request);

            if (cachedResponse) {
                return cachedResponse;
            }

            if (request.url.includes('/rest/v1/news')) {
                const storedNews = await dbManager.getStoredNews();
                return new Response(JSON.stringify(storedNews), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Encoding': 'gzip'
                    }
                });
            }

            return new Response(JSON.stringify({ error: 'Network unavailable' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    async handleFetch(event) {
        const url = event.request.url;

        if (isCacheableRequest(url)) {
            event.respondWith(this.handleSupabaseRequest(event.request));
        }
    }
}

export const cacheHandler = new CacheHandler();