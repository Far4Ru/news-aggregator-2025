import { dbManager } from '../core/db-manager.js';
import { STORAGE_KEYS } from '../utils/constants.js';

class NewsSync {
    constructor() {
        this.checkInterval = 30000;
    }

    async checkForNewNews() {
        try {
            const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_NEWS_CHECK);
            const now = Date.now();

            if (lastCheck && (now - parseInt(lastCheck)) < this.checkInterval) {
                return;
            }

            localStorage.setItem(STORAGE_KEYS.LAST_NEWS_CHECK, now.toString());

            const lastStoredNews = await dbManager.getStoredNews();
            const lastNewsDate = lastStoredNews.length > 0
                ? Math.max(...lastStoredNews.map(n => new Date(n.published_at).getTime()))
                : 0;

            const newNews = await this.fetchLatestNewsFromSupabase(lastNewsDate);

            if (newNews && newNews.length > 0) {
                const allNews = [...lastStoredNews, ...newNews]
                    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
                    .slice(0, 1000);

                await dbManager.storeNewsData(allNews);
                return newNews;
            }
        } catch (error) {
            console.error('Error checking for new news:', error);
        }
    }

    async fetchLatestNewsFromSupabase(sinceTimestamp) {
        // Реальная реализация запроса к Supabase
        return [];
    }
}

export const newsSync = new NewsSync();