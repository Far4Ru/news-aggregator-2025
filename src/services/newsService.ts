// services/newsService.ts
import type { NewsFilters } from '../types/news';
import { mockNews } from '../utils/mockData';

import { supabase } from './supabase';

const PAGE_SIZE = 10;

export const newsService = {
  async getNews(
    selected: string[],
    filters: NewsFilters,
    sortBy: 'date' | 'rating' = 'date',
    page = 1
  ) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: news, error } = await supabase
      .from('news')
      .select(`
        *,
        sources (
          id,
          name,
          description,
          url,
          type,
          status
        ),
        short_contents (
          id,
          content_text
        )
      `)
      .range(from, to);

    console.log(error);
    let filteredNews = [...mockNews, ...news as any];

    filteredNews = filteredNews.filter(item =>
      selected.includes(item.source_id)
    );

    // Применение фильтров
    if (filters.searchQuery) {
      filteredNews = filteredNews.filter(item =>
        item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    if (filters.sources.length > 0) {
      filteredNews = filteredNews.filter(item =>
        filters.sources.includes(item.source_id)
      );
    }

    if (filters.tags.length > 0) {
      filteredNews = filteredNews.filter(item =>
        filters.tags.some(tag => item.tags.includes(tag))
      );
    }

    // Сортировка
    if (sortBy === 'date') {
      filteredNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else {
      filteredNews.sort((a, b) => b.rating - a.rating);
    }

    return filteredNews;
  },

  async updateRating(_newsId: string, increment: number) {
    // Заглушка
    await new Promise(resolve => setTimeout(resolve, 200));

    return { rating: increment };
  },

  async suggestEdit(_newsId: string, _suggestedContent: string, _ip: string) {
    // Заглушка
    await new Promise(resolve => setTimeout(resolve, 200));

    return null;
  },

  async getSuggestions() {
    // Заглушка
    await new Promise(resolve => setTimeout(resolve, 500));

    return [];
  },

  async moderateSuggestion(_suggestionId: string, _action: 'approve' | 'reject') {
    // Заглушка
    await new Promise(resolve => setTimeout(resolve, 200));

    return null;
  }
};
