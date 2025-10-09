// components/News.tsx
import React, { useState, useEffect, useCallback } from 'react';

import { NewsFilters } from '../components/news/NewsFilters';
import { NewsList } from '../components/news/NewsList';
import { useCachedNews } from '../hooks/useCachedNews';
import { useAppSettings } from '../hooks/useLocalStorage';
import { useNotification } from '../hooks/useNotification';
import { useNotifications } from '../hooks/useNotifications';
import type { NewsFilters as NewsFiltersType, NewsItem } from '../types/news';

export const News: React.FC = () => {
  const { settings, setSettings } = useAppSettings();
  const { showCardNotification: showNotification } = useNotification();
  const { showNotification: showPushNotification, isSubscribed } = useNotifications();
  const {
    news,
    loading,
    lastUpdated,
    hasNewNews,
    loadNews,
    refreshNews
  } = useCachedNews();

  const [filters, setFilters] = useState<NewsFiltersType>(settings.filters);
  const [showNewNewsBadge, setShowNewNewsBadge] = useState(false);

  // Загрузка новостей при изменении фильтров
  useEffect(() => {
    loadNews(settings.selectedSources, filters, settings.sortBy);
  }, [filters, settings.sortBy, settings.selectedSources, loadNews]);

  // Уведомление о новых новостях
  useEffect(() => {
    if (hasNewNews && isSubscribed) {
      setShowNewNewsBadge(true);
      showPushNotification('Доступны новые новости!', {
        body: 'Нажмите для обновления',
        tag: 'new-news-available'
      });
    }
  }, [hasNewNews, isSubscribed, showPushNotification]);

  const handleRefresh = useCallback(() => {
    refreshNews(settings.selectedSources, filters, settings.sortBy);
    setShowNewNewsBadge(false);
  }, [refreshNews, settings.selectedSources, filters, settings.sortBy]);

  const handleRate = async (newsId: string, increment: number) => {
    try {
      // Здесь ваш существующий код для обновления рейтинга
      // Обновляем локальное состояние
      setNews(news.map(item =>
        item.id === newsId
          ? { ...item, rating: item.rating + increment }
          : item
      ));
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
      // Здесь ваш существующий код для предложения правок
      showNotification('Предложение отправлено на модерацию', 'success');
    } catch (error) {
      console.error('Error suggesting edit:', error);
      showNotification('Ошибка при отправке предложения', 'error');
    }
  };

  const availableSources = Array.from(new Set(news.map(item => item.source_id)));
  const availableTags = Array.from(new Set(news.flatMap(item => item.tags)));

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
          <div className='page__header-actions'>
            <button
              className='button button--secondary'
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Обновление...' : 'Обновить'}
            </button>
            {lastUpdated && (
              <span className='page__last-updated'>
                Обновлено: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
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
            availableSources={availableSources}
            availableTags={availableTags}
          />
        </div>

        <div className='page__main'>
          <NewsList
            news={news}
            loading={loading}
            onRate={handleRate}
            onShare={handleShare}
            onSuggestEdit={handleSuggestEdit}
          />
        </div>
      </div>
    </div>
  );
};
