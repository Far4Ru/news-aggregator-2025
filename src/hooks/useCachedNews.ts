import { useState, useEffect, useCallback } from 'react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export const useCachedNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Загрузка данных из кэша
  const loadCachedNews = useCallback(async () => {
    try {
      setLoading(true);

      // Сначала пытаемся получить свежие данные
      const response = await fetch('/api/news');

      if (response.ok) {
        const freshNews = await response.json();

        setNews(freshNews);
        setLastUpdated(new Date());

        return;
      }
    } catch (error) {
      console.log('Network unavailable, using cache');
    }

    // Если сеть недоступна, используем Service Worker
    try {
      const response = await fetch('/api/news');
      const cachedNews = await response.json();

      setNews(cachedNews);

      const lastUpdate = localStorage.getItem('last-update');

      if (lastUpdate) {
        setLastUpdated(new Date(parseInt(lastUpdate)));
      }
    } catch (error) {
      console.error('Error loading cached news:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Принудительное обновление
  const refreshNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news?forceRefresh=true');
      const freshNews = await response.json();

      setNews(freshNews);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCachedNews();

    // Периодическое обновление каждую минуту
    const interval = setInterval(() => {
      refreshNews();
    }, 60000); // 60 секунд

    return () => clearInterval(interval);
  }, [loadCachedNews, refreshNews]);

  return {
    news,
    loading,
    lastUpdated,
    refreshNews,
    loadCachedNews
  };
};
