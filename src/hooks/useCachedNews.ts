// hooks/useCachedNews.ts
import { useState, useEffect, useCallback } from 'react';

import { cachedNewsService } from '../services/cachedNewsService';
import type { NewsItem, NewsFilters } from '../types/news';

export const useCachedNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasNewNews, setHasNewNews] = useState(false);

  const loadNews = useCallback(async (
    selectedSources: string[] = [],
    filters: NewsFilters,
    sortBy: 'date' | 'rating' = 'date'
  ) => {
    setLoading(true);
    try {
      const newsData = await cachedNewsService.getNews(selectedSources, filters, sortBy);

      setNews(newsData);
      setLastUpdated(new Date());

      // Проверяем наличие новых новостей
      const newNewsCheck = await cachedNewsService.checkForNewNews();

      setHasNewNews(newNewsCheck.hasNew);
    } catch (error) {
      console.error('Error loading cached news:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNews = useCallback(async (
    selectedSources: string[],
    filters: NewsFilters,
    sortBy: 'date' | 'rating'
  ) => {
    setLoading(true);
    try {
      const newsData = await cachedNewsService.refreshCache(selectedSources, filters, sortBy);

      setNews(newsData);
      setLastUpdated(new Date());
      setHasNewNews(false);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Периодическая проверка новых новостей
  useEffect(() => {
    const interval = setInterval(async () => {
      const newNewsCheck = await cachedNewsService.checkForNewNews();

      setHasNewNews(newNewsCheck.hasNew);
    }, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, []);

  return {
    news,
    loading,
    lastUpdated,
    hasNewNews,
    loadNews,
    refreshNews
  };
};
