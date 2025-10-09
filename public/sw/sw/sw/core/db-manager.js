import { generateHash } from '../../utils/helpers.js';
import { STORAGE_KEYS } from '../../utils/constants.js';

class DBManager {
    constructor() {
        this.dbName = 'NewsDatabase';
        this.version = 1;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createStores(db);
            };
        });
    }

    createStores(db) {
        if (!db.objectStoreNames.contains('news')) {
            const store = db.createObjectStore('news', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp');
            store.createIndex('published_at', 'published_at');
        }
        if (!db.objectStoreNames.contains('sources')) {
            db.createObjectStore('sources', { keyPath: 'id' });
        }
    }

    async storeNewsData(newsData) {
        try {
            const db = await this.openDB();
            const transaction = db.transaction(['news'], 'readwrite');
            const store = transaction.objectStore('news');

            await store.clear();

            for (const item of newsData) {
                store.put({
                    ...item,
                    cached_at: Date.now()
                });
            }

            const hash = await generateHash(JSON.stringify(newsData));
            localStorage.setItem(STORAGE_KEYS.NEWS_HASH, hash);
            localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now().toString());

            return true;
        } catch (error) {
            console.error('Error storing news data:', error);
            return false;
        }
    }

    async getStoredNews() {
        try {
            const db = await this.openDB();
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
    }
}

export const dbManager = new DBManager();