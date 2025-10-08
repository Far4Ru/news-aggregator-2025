import { ThumbsUp, ThumbsDown, Share2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';

import type { NewsItem } from '../../types/news';

interface NewsCardProps {
    news: NewsItem
    onRate: (newsId: string, increment: number) => void
    onShare: (news: NewsItem) => void
    onSuggestEdit: (news: NewsItem, content: string) => void
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onRate,
  onShare,
  onSuggestEdit
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [suggestedContent, setSuggestedContent] = useState('');

  const handleRate = (increment: number) => {
    onRate(news.id, increment);
  };

  const handleShare = () => {
    onShare(news);
  };

  const handleSuggestEdit = () => {
    if (suggestedContent.trim()) {
      onSuggestEdit(news, suggestedContent);
      setShowEditModal(false);
      setSuggestedContent('');
    }
  };

  return (
    <div className='news-card'>
      <div className='news-card__header'>
        <div className='news-card__header-block'>
          <div className='news-card__title-image-block'>
            <img className='news-card__title-image' alt={news.source_type} src='logo.png' />
          </div>
          <div className='news-card__title-block'>
            <h3 className='news-card__title'>{news.sources.name}</h3>
            <span className='news-card__source'>{news.source_type}</span>
          </div>

          <button
            className='news-card__button news-card__button--up-right'
          >
            <ArrowUpRight size={24} />
          </button>
        </div>
        <div className='news-card__meta'>
          <button
            className='news-card__button news-card__button--edit'
            onClick={() => setShowEditModal(true)}
          >
            <AlertTriangle size={16} />
          </button>
        </div>
      </div>

      <div className='news-card__content'>
        <p className='news-card__text'>{news.short_content}</p>
      </div>

      <div className='news-card__footer'>
        <div className='news-card__tags'>
          <span className='news-card__date'>
            {new Date(news.published_at).toLocaleDateString()}
          </span>
          {news.tags.map(tag => (
            <span key={tag} className='news-card__tag'>{tag}</span>
          ))}
        </div>

        <div className='news-card__actions'>
          <div className='news-card__rating'>
            <button
              className='news-card__button news-card__button--up'
              onClick={() => handleRate(1)}
            >
              <ThumbsUp size={16} />
            </button>
            <span className='news-card__rating-value'>{news.rating}</span>
            <button
              className='news-card__button news-card__button--down'
              onClick={() => handleRate(-1)}
            >
              <ThumbsDown size={16} />
            </button>
          </div>

          <button
            className='news-card__button news-card__button--share'
            onClick={handleShare}
          >
            <Share2 size={16} />
          </button>

        </div>
      </div>

      {showEditModal && (
        <div className='modal modal--edit'>
          <div className='modal__content'>
            <h3 className='modal__title'>Предложить правку</h3>
            <textarea
              className='modal__textarea'
              value={suggestedContent}
              onChange={(e) => setSuggestedContent(e.target.value)}
              placeholder='Введите ваш вариант текста...'
              rows={4}
            />
            <div className='modal__actions'>
              <button
                className='button button--secondary'
                onClick={() => setShowEditModal(false)}
              >
                Отмена
              </button>
              <button
                className='button button--primary'
                onClick={handleSuggestEdit}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
