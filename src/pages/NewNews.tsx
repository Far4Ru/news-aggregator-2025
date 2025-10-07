import React, { useState, useEffect } from 'react'

import { useNotification } from '../hooks/useNotificatiom'
import { moderationService } from '../services/moderationService'
import type { NewsItem } from '../types/news'

export const NewNews: React.FC = () => {
  const { showNotification } = useNotification()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNewNews()
  })

  const loadNewNews = async () => {
    setLoading(true)
    try {
      const data = await moderationService.getNewNews()
      setNews(data)
    } catch (error) {
      console.error('Error loading new news:', error)
      showNotification('Ошибка при загрузке новых новостей', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (newsId: string) => {
    try {
      await moderationService.moderateNews(newsId, 'approve')
      showNotification('Новость подтверждена', 'success')
      loadNewNews() // Перезагружаем список
    } catch (error) {
      console.error('Error approving news:', error)
      showNotification('Ошибка при подтверждении новости', 'error')
    }
  }

  const handleReject = async (newsId: string) => {
    try {
      await moderationService.moderateNews(newsId, 'reject')
      showNotification('Новость отклонена', 'success')
      loadNewNews() // Перезагружаем список
    } catch (error) {
      console.error('Error rejecting news:', error)
      showNotification('Ошибка при отклонении новости', 'error')
    }
  }

  // Заглушки для NewsList
  // const handleRate = () => { }
  // const handleShare = () => { }
  // const handleSuggestEdit = () => { }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Новые новости</h1>
        <p className="page__subtitle">Модерация новых добавленных новостей</p>
      </div>

      <div className="page__content">
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : news.length === 0 ? (
          <div className="empty-state">
            <h3>Нет новых новостей для модерации</h3>
          </div>
        ) : (
          <div className="moderation-news">
            {news.map(item => (
              <div key={item.id} className="moderation-news-item">
                <div className="moderation-news-item__content">
                  <h3>{item.title}</h3>
                  <p>{item.short_content}</p>
                  <div className="moderation-news-item__meta">
                    <span>Источник: {item.source_id}</span>
                    <span>Дата: {new Date(item.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="moderation-news-item__actions">
                  <button
                    className="button button--success"
                    onClick={() => handleApprove(item.id)}
                  >
                    Подтвердить
                  </button>
                  <button
                    className="button button--danger"
                    onClick={() => handleReject(item.id)}
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
