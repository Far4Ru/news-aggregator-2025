// hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  loadMore: () => Promise<void>;
  threshold?: number;
}

export const useInfiniteScroll = ({
  hasMore,
  loadMore,
  threshold = 100
}: UseInfiniteScrollProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more news:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, loadMore]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, handleLoadMore]);

  return {
    isLoading,
    loadMoreRef,
    handleLoadMore
  };
};
