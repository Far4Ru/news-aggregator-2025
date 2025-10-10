import React, { useState, useEffect, useCallback } from 'react';

import { useNotification } from '../hooks/useNotification';
import { moderationService } from '../services/moderationService';
import { sourcesService } from '../services/sourcesService';
import { NewsSource } from '../types/sources';

export const NewSources: React.FC = () => {
  const { showCardNotification: showNotification } = useNotification();
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNewSources = useCallback(async () => {
    try {
      const data = await sourcesService.getSources();

      setSources(data);
    } catch (error) {
      console.error('Error loading new sources:', error);
      showNotification('Ошибка при загрузке новых источников', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadNewSources();
  }, [loadNewSources]);

  const handleApprove = async (sourceId: string) => {
    try {
      await moderationService.moderateSources(sourceId, 'approved');
      showNotification('Источник подтвержден', 'success');
      loadNewSources(); // Перезагружаем список
    } catch (error) {
      console.error('Error approving source:', error);
      showNotification('Ошибка при подтверждении источника', 'error');
    }
  };

  const handleReject = async (sourceId: string) => {
    try {
      await moderationService.moderateSources(sourceId, 'rejected');
      showNotification('Новость отклонена', 'success');
      loadNewSources(); // Перезагружаем список
    } catch (error) {
      console.error('Error rejecting source:', error);
      showNotification('Ошибка при отклонении источника', 'error');
    }
  };

  return (
    <div className='page'>
      <div className='page__header'>
        <h1 className='page__title'>Источники</h1>
        <p className='page__subtitle'>Модерация источников</p>
      </div>

      <div className='page__content-block'>
        {loading ? (
          <div className='loading'>Загрузка...</div>
        ) : sources.length === 0 ? (
          <div className='empty-state'>
            <h3>Нет источников для модерации</h3>
          </div>
        ) : (
          <div className='moderation-news'>
            {sources.map(item => (
              <div key={item.id} className='moderation-news-item'>
                <div className='moderation-news-item__content'>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className='moderation-news-item__meta'>
                    {/* <span>Источник: {item.}</span> */}
                    <span>Дата: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {item.status === 'pending' && (
                  <div className='moderation-news-item__actions'>
                    <button
                      className='button button--success'
                      onClick={() => handleApprove(item.id)}
                    >
                      Подтвердить
                    </button>
                    <button
                      className='button button--danger'
                      onClick={() => handleReject(item.id)}
                    >
                      Отклонить
                    </button>
                  </div>
                )}
                {item.status === 'approved' && (
                  <div>Подтверждено</div>
                )}
                {item.status === 'rejected' && (
                  <div>Отклонено</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
