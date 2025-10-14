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

    const { data: news } = await supabase
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
      .eq('sources.status', 'approved'); // только активные источники

    const newsIds = (news as any).map((item: any) => item.id);

    const [tagsByNewsId, ratingsByNewsId] = await Promise.all([
      this.getTagsForMultipleNews(newsIds),
      this.getRatingsForMultipleNews(newsIds)
    ]);

    const newsWithDetails = (news as any).map((item: any) => ({
      ...item,
      tags: tagsByNewsId[item.id] || [],
      rating: ratingsByNewsId[item.id] || 0
    }));

    let filteredNews = [...newsWithDetails as any];

    filteredNews = filteredNews.filter(item =>
      selected.includes(item.source_id)
    );

    // Применение фильтров
    if (filters.searchQuery) {
      filteredNews = filteredNews.filter(item =>
        item.short_contents.content_text.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }
    if (filters.sources.length > 0) {
      filteredNews = filteredNews.filter(item =>
        filters.sources.includes(item.sources.name)
      );
    }
    if (filters.sourceTypes.length > 0) {
      filteredNews = filteredNews.filter(item =>
        filters.sourceTypes.includes(item.sources.type)
      );
    }

    if (filters.tags.length > 0) {
      filteredNews = filteredNews.filter(item =>
        filters.tags.some(tag => item.tags.includes(tag))
      );
    }

    if (filters.timeTag !== '') {
      const now = new Date();

      if (filters.timeTag === 'сегодня') {
        const todayStart = new Date(now);

        todayStart.setHours(0, 0, 0, 0);

        filteredNews = filteredNews.filter(item => {
          const itemDate = new Date(item.published_at);

          return itemDate >= todayStart && itemDate <= now;
        });
      } else if (filters.timeTag === 'за неделю') {
        const weekAgo = new Date(now);

        weekAgo.setDate(now.getDate() - 7);

        filteredNews = filteredNews.filter(item => {
          const itemDate = new Date(item.published_at);

          return itemDate >= weekAgo && itemDate <= now;
        });
      } else if (filters.timeTag === 'за месяц') {
        const monthAgo = new Date(now);

        monthAgo.setMonth(now.getMonth() - 1);

        filteredNews = filteredNews.filter(item => {
          const itemDate = new Date(item.published_at);

          return itemDate >= monthAgo && itemDate <= now;
        });
      }
    }

    // Сортировка
    if (sortBy === 'date') {
      filteredNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else {
      filteredNews.sort((a, b) => b.rating - a.rating);
    }

    console.log(from, to, filteredNews, filteredNews.slice(from, to + 1));

    return filteredNews.slice(from, to + 1);
  },
  async getAllNews(
    selected: string[],
  ) {

    const { data: news } = await supabase
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
      .eq('sources.status', 'approved'); // только активные источники

    const newsIds = (news as any).map((item: any) => item.id);

    const [tagsByNewsId, ratingsByNewsId] = await Promise.all([
      this.getTagsForMultipleNews(newsIds),
      this.getRatingsForMultipleNews(newsIds)
    ]);

    const newsWithDetails = (news as any).map((item: any) => ({
      ...item,
      tags: tagsByNewsId[item.id] || [],
      rating: ratingsByNewsId[item.id] || 0
    }));

    let filteredNews = [...newsWithDetails as any];

    filteredNews = filteredNews.filter(item =>
      selected.includes(item.source_id)
    );

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
          tag_name
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
        tagsByNewsId[item.news_id].push(item.tags.tag_name);
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

  async updateRating(newsId: string, userId: string, increment: number) {
    try {
      const { data: newRating } = await supabase
        .from('news_ratings')
        .insert([
          {
            news_id: newsId,
            user_id: userId,
            rating: increment, // +1 или -1
            created_at: new Date().toISOString()
          } as never
        ])
        .select()
        .single();

      return newRating;
    } catch (error) {
      return undefined;
    }
  },

  async checkUserRating(newsId: string, userId: string) {
    try {
      const { data: existingRating } = await supabase
        .from('news_ratings')
        .select('id')
        .eq('news_id', newsId)
        .eq('user_id', userId)
        .single();

      return existingRating;
    } catch (error) {
      return undefined;
    }
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
