import type { NewsFilters } from '../types/news'
import { mockNews } from '../utils/mockData'

import { supabase } from './supabase'

export const newsService = {
    async getNews(filters: NewsFilters, sortBy: 'date' | 'rating' = 'date') {
        const { data: news, error } = await supabase
            .from('news')
            .select('*')
        console.log(news, error)
        let filteredNews = [...mockNews, ...news as any]

        // Применение фильтров
        if (filters.searchQuery) {
            filteredNews = filteredNews.filter(item =>
                item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                item.content.toLowerCase().includes(filters.searchQuery.toLowerCase())
            )
        }

        if (filters.sources.length > 0) {
            filteredNews = filteredNews.filter(item =>
                filters.sources.includes(item.source_id)
            )
        }

        if (filters.tags.length > 0) {
            filteredNews = filteredNews.filter(item =>
                filters.tags.some(tag => item.tags.includes(tag))
            )
        }

        // Сортировка
        if (sortBy === 'date') {
            filteredNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        } else {
            filteredNews.sort((a, b) => b.rating - a.rating)
        }

        return filteredNews
    },

    async updateRating(_newsId: string, increment: number) {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 200))
        return { rating: increment }
    },

    async suggestEdit(_newsId: string, _suggestedContent: string, _ip: string) {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 200))
        return null
    },

    async getSuggestions() {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 500))
        return []
    },

    async moderateSuggestion(_suggestionId: string, _action: 'approve' | 'reject') {
        // Заглушка
        await new Promise(resolve => setTimeout(resolve, 200))
        return null
    }
}
