import { RefreshCcw } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { NewsFilters } from '../components/news/NewsFilters';
import { NewsList } from '../components/news/NewsList';
import { useAuth } from '../hooks/useAuth';
import { useCachedNews } from '../hooks/useCachedNews';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { useAppSettings } from '../hooks/useLocalStorage';
import { useNewsList } from '../hooks/useNewsList';
import { useNotification } from '../hooks/useNotification';
import { newsService } from '../services/newsService';
import { sourcesService } from '../services/sourcesService';
import type { NewsFilters as NewsFiltersType, NewsItem } from '../types/news';

export const News: React.FC = () => {
  const { settings, setSettings } = useAppSettings();
  const { showCardNotification: showNotification } = useNotification();

  const [filters, setFilters] = useState<NewsFiltersType>(settings.filters);
  const [showNewNewsBadge, setShowNewNewsBadge] = useState(false);
  const { user } = useAuth();

  const [allNews, setAllNews] = useState<any>([]);

  // Функция для загрузки дополнительных новостей
  const loadMoreNews = useCallback(async (page: number, currentFilters: NewsFiltersType) => {
    return await newsService.getNews(settings.selectedSources, currentFilters, settings.sortBy, page);
  }, [settings.selectedSources, settings.sortBy]);

  // Загрузка первой страницы новостей
  const { news: initialNews,
    lastUpdated, loading: _initialLoading } = useCachedNews();

  // Управление списком новостей с пагинацией
  const {
    news,
    loading,
    hasMore,
    loadMore,
    refresh
  } = useNewsList({
    initialNews,
    loadMoreNews,
    filters,
    settings,
  });

  useEffect(() => {
    const loadSources = async () => {
      if (filters.sources.length === 0) {
        const sources = await sourcesService.getSources();

        if (sources) {
          const newSelectedSources = sources.map(source => source.id);

          setSettings({
            ...settings,
            selectedSources: newSelectedSources as any
          });
        }

      }
    };
    const loadAllNews = async () => {
      setAllNews(await newsService.getAllNews(settings.selectedSources));
    };

    loadSources();
    loadAllNews();
  }, [filters]);

  const handleLoadMores = useCallback(async () => {
    await loadMore();
  }, [loadMore]);

  // Настройка бесконечного скролла
  const {
    isLoading: infiniteLoading,
    loadMoreRef,
    handleLoadMore
  } = useInfiniteScroll({
    hasMore,
    loadMore: handleLoadMores
  });

  // Обновление новостей при изменении фильтров
  useEffect(() => {
    refresh();
  }, [filters, settings.sortBy, settings.selectedSources]);

  // Уведомление о новых новостях
  // useEffect(() => {
  //   if (hasNewNews && isSubscribed) {
  //     setShowNewNewsBadge(true);
  //     showPushNotification('Доступны новые новости!', {
  //       body: 'Нажмите для обновления',
  //       tag: 'new-news-available'
  //     });
  //   }
  // }, [hasNewNews, isSubscribed, showPushNotification]);

  const handleRefresh = useCallback(() => {
    refresh();
    setShowNewNewsBadge(false);
  }, [refresh]);

  const handleRate = async (newsId: string, increment: number) => {
    try {
      const result = await newsService.updateRating(newsId, user?.id ?? '', increment);

      if (result) {
        refresh();
        news.forEach(item => {
          if (item.id === newsId) {
            item.rating = item.rating + increment;
          }
        }
        );
        showNotification('Новость успешно оценена', 'success');
      } else {
        showNotification('Новость уже была оценена', 'error');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      showNotification('Ошибка при оценке новости', 'error');
    }
  };

  const handleShare = (newsItem: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.short_content,
        url: newsItem.url || window.location.href
      });
    } else {
      navigator.clipboard.writeText(newsItem.url || window.location.href);
      showNotification('Ссылка скопирована в буфер обмена', 'success');
    }
  };

  const handleSuggestEdit = async (newsItem: NewsItem, content: string) => {
    try {
      console.log(newsItem, content);
      showNotification('Предложение отправлено на модерацию', 'success');
    } catch (error) {
      console.error('Error suggesting edit:', error);
      showNotification('Ошибка при отправке предложения', 'error');
    }
  };

  const availableSources = Array.from(new Set(allNews.map((item: any) => item.sources.name)));
  const availableTags: string[] = Array.from(new Set(allNews.flatMap((item: any) => item.tags ?? [])));

  const isListLoading = loading || infiniteLoading;

  return (
    <div className='page'>
      <div className='page__header'>
        <div className='page__header-top'>
          <h1 className='page__title'>
            Новости
            {showNewNewsBadge && (
              <span className='badge badge--new'>Новые!</span>
            )}
          </h1>
          <button
            className='page__header-top--button'
            onClick={handleRefresh}
            disabled={isListLoading}
          >
            {isListLoading ? 'Обновление...' : (<RefreshCcw size={24} />)}
          </button>
          {lastUpdated && (
            <span className='page__header-top--time'>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className='page__subtitle'>Свежие новости из ваших источников</p>
      </div>

      <div className='page__content'>
        <div className='page__sidebar'>
          <NewsFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={settings.sortBy}
            onSortChange={(sortBy) => setSettings({ ...settings, sortBy })}
            availableSources={availableSources as any}
            availableTags={availableTags}
          />
        </div>

        <div className='page__main'>
          <NewsList
            news={news}
            loading={isListLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRate={handleRate}
            onShare={handleShare}
            onSuggestEdit={handleSuggestEdit}
            loadMoreRef={loadMoreRef}
          />
        </div>
      </div>
    </div>
  );
};
