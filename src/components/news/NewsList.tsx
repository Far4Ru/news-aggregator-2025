import React from 'react';

import type { NewsItem } from '../../types/news';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { NewsCard } from '../common/NewsCard';
import { ScrollToTop } from '../common/ScrollToTop';

interface NewsListProps {
  news: NewsItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRate: (newsId: string, increment: number) => void;
  onShare: (news: NewsItem) => void;
  onSuggestEdit: (news: NewsItem, content: string) => void;
  loadMoreRef?: React.RefObject<HTMLDivElement>;
}

export const NewsList: React.FC<NewsListProps> = ({
  news,
  loading,
  hasMore,
  onLoadMore,
  onRate,
  onShare,
  onSuggestEdit,
  loadMoreRef
}) => {
  if (loading && news.length === 0) {
    return <LoadingSpinner />;
  }

  if (news.length === 0) {
    return (
      <div className='news-list__empty'>
        <h3 className='news-list__empty-title'>Новости не найдены</h3>
        <p className='news-list__empty-text'>Попробуйте изменить параметры фильтрации</p>
      </div>
    );
  }

  return (
    <div className='news-list'>
      {news.map(item => (
        <NewsCard
          key={item.id}
          news={item}
          onRate={onRate}
          onShare={onShare}
          onSuggestEdit={onSuggestEdit}
        />
      ))}

      {/* Элемент для автоматической подгрузки */}
      {hasMore && (
        <div ref={loadMoreRef} className='news-list__load-more-sentinel'>
          {loading && <LoadingSpinner />}
        </div>
      )}

      {/* Кнопка для ручной подгрузки */}
      {hasMore && !loading && (
        <div className='news-list__load-more-button'>
          <button
            className='button button--secondary'
            onClick={onLoadMore}
            disabled={loading}
          >
            Загрузить еще
          </button>
        </div>
      )}

      {/* Плавающая кнопка скролла наверх */}
      <ScrollToTop />
    </div>
  );
};
