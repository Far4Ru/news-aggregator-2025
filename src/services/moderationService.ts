import { supabaseModerator } from './supabase'
import { NewsItem } from '../types'
import { mockNews } from '../utils/mockData'

export const moderationService = {
    async getNewNews() {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockNews.filter(news => news.id === '1') // Только одна новость для примера
    },

    async moderateNews(newsId: string, action: 'approve' | 'reject') {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 200))
        return null
    },

    async blockIp(ip: string) {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 200))
        return { success: true }
    }
}