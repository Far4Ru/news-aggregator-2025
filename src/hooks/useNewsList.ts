import { useState, useCallback } from 'react';

import type { NewsItem, NewsFilters } from '../types/news';

interface UseNewsListProps {
  initialNews: NewsItem[];
  loadMoreNews: (page: number, filters: NewsFilters) => Promise<NewsItem[]>;
  filters: NewsFilters;
  pageSize?: number;
  settings: any;
}

export const useNewsList = ({
  initialNews,
  loadMoreNews,
  filters,
  settings,
  pageSize = 10
}: UseNewsListProps) => {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialNews.length >= pageSize);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const newNews = await loadMoreNews(page + 1, filters);

      if (newNews.length > 0) {
        setNews(prev => [...prev, ...newNews]);
        setPage(prev => prev + 1);
        setHasMore(newNews.length >= pageSize);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more news:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, settings.sortBy]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const firstPageNews = await loadMoreNews(1, filters);

      setNews(firstPageNews);
      setPage(1);
      setHasMore(firstPageNews.length >= pageSize);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, settings.sortBy]);

  return {
    news,
    loading,
    hasMore,
    loadMore,
    refresh
  };
};
