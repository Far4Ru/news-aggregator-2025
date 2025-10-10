// services/newsService.ts
import type { NewsFilters } from '../types/news';

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
      .eq('status', 'approved') // только approved новости
      .eq('sources.status', 'approved') // только активные источники
      .range(from, to);

    const newsIds = (news as any).map((item: any) => item.id);

    // 2. Параллельно получаем теги и рейтинги
    const [tagsByNewsId, ratingsByNewsId] = await Promise.all([
      this.getTagsForMultipleNews(newsIds),
      this.getRatingsForMultipleNews(newsIds)
    ]);

    // 3. Объединяем данные
    const newsWithDetails = (news as any).map((item: any) => ({
      ...item,
      tags: tagsByNewsId[item.id] || [],
      rating: ratingsByNewsId[item.id] || 0
    }));

    console.log(newsWithDetails, error);
    let filteredNews = [...newsWithDetails as any];

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

  async getTagsForMultipleNews(newsIds: string) {
    try {
      const { data: newsTags } = await supabase
        .from('news_tags')
        .select(`
        news_id,
        status,
        tags (
          id,
          name
        )
      `)
        .in('news_id', newsIds as any)
        .eq('status', 'approved');

      // Группируем теги по ID новости
      const tagsByNewsId: any = {};

      newsTags?.forEach((item: any) => {
        if (!tagsByNewsId[item.news_id]) {
          tagsByNewsId[item.news_id] = [];
        }
        tagsByNewsId[item.news_id].push(item.tags);
      });

      return tagsByNewsId;
    } catch (error) {
      return {};
    }
  },

  async getRatingsForMultipleNews(newsIds: string) {
    const { data: ratings, error } = await supabase
      .from('news_ratings')
      .select('news_id, rating')
      .in('news_id', newsIds as any);

    if (error) throw error;

    // Группируем рейтинги по ID новости
    const ratingsByNewsId: any = {};

    ratings?.forEach((item: any) => {
      if (!ratingsByNewsId[item.news_id]) {
        ratingsByNewsId[item.news_id] = 0;
      }
      ratingsByNewsId[item.news_id] += item.rating;
    });

    return ratingsByNewsId;
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
