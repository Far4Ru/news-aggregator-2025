import type { NewsItem, NewsFilters } from '../types/news';

import { supabase } from './supabase';

export class CachedNewsService {
  private static instance: CachedNewsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 минут

  static getInstance(): CachedNewsService {
    if (!CachedNewsService.instance) {
      CachedNewsService.instance = new CachedNewsService();
    }

    return CachedNewsService.instance;
  }

  // Получение новостей с кэшированием
  async getNews(
    selectedSources: string[] = [],
    filters: NewsFilters,
    sortBy: 'date' | 'rating' = 'date'
  ): Promise<NewsItem[]> {
    const cacheKey = this.generateCacheKey(selectedSources, filters, sortBy);

    // Проверяем кэш в памяти
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Пытаемся получить данные из сети
      let query = supabase
        .from('news')
        .select(`
          *,
          sources (*)
        `)
        .eq('status', 'approved');

      // Применяем фильтры
      if (selectedSources.length > 0) {
        query = query.in('source_id', selectedSources);
      }

      if (filters.sourceTypes.length > 0) {
        query = query.in('source_type', filters.sourceTypes);
      }

      if (filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,short_content.ilike.%${filters.searchQuery}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('published_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('published_at', filters.dateTo);
      }

      // Сортировка
      if (sortBy === 'date') {
        query = query.order('published_at', { ascending: false });
      } else {
        query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Сохраняем в кэш
      this.cache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now()
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching news from Supabase:', error);

      // Пытаемся получить данные из Service Worker кэша
      try {
        const response = await fetch('/api/fallback-news');

        if (response.ok) {
          const cachedNews = await response.json();

          return cachedNews;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }

      return [];
    }
  }

  // Принудительное обновление кэша
  async refreshCache(
    selectedSources: string[],
    filters: NewsFilters,
    sortBy: 'date' | 'rating'
  ): Promise<NewsItem[]> {
    const cacheKey = this.generateCacheKey(selectedSources, filters, sortBy);

    this.cache.delete(cacheKey);

    return this.getNews(selectedSources, filters, sortBy);
  }

  // Проверка новых новостей
  async checkForNewNews(): Promise<{ hasNew: boolean; count?: number }> {
    try {
      const latestNews = await supabase
        .from('news')
        .select('id, published_at')
        .eq('status', 'approved')
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (latestNews.error) throw latestNews.error;

      const lastStoredUpdate = localStorage.getItem('last-known-news-date');

      if (!lastStoredUpdate) {
        localStorage.setItem('last-known-news-date', latestNews.data.published_at);

        return { hasNew: false };
      }

      const hasNew = new Date(latestNews.data.published_at) > new Date(lastStoredUpdate);

      if (hasNew) {
        localStorage.setItem('last-known-news-date', latestNews.data.published_at);

        return { hasNew: true };
      }

      return { hasNew: false };
    } catch (error) {
      console.error('Error checking for new news:', error);

      return { hasNew: false };
    }
  }

  private generateCacheKey(
    selectedSources: string[],
    filters: NewsFilters,
    sortBy: string
  ): string {
    return JSON.stringify({
      sources: selectedSources.sort(),
      filters: {
        ...filters,
        sources: filters.sources?.sort(),
        sourceTypes: filters.sourceTypes?.sort(),
        tags: filters.tags?.sort()
      },
      sortBy
    });
  }

  // Очистка старого кэша
  cleanupOldCache(): void {
    const now = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

export const cachedNewsService = CachedNewsService.getInstance();
