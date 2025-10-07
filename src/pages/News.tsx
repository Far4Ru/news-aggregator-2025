import React, { useState, useEffect, useCallback } from 'react'

import { NewsFilters } from '../components/news/NewsFilters'
import { NewsList } from '../components/news/NewsList'
import { useAppSettings } from '../hooks/useLocalStorage'
import { useNotification } from '../hooks/useNotification'
import { newsService } from '../services/newsService'
import type { NewsFilters as NewsFiltersType, NewsItem } from '../types/news'

const getPublicIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching public IP:', error);
    return null;
  }
};

export const News: React.FC = () => {
  const { settings, setSettings } = useAppSettings()
  const { showNotification } = useNotification()

  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [ip, setIp] = useState('')
  const [filters, setFilters] = useState<NewsFiltersType>(settings.filters)

  const loadNews = useCallback(async () => {
    setLoading(true)
    try {
      const data = await newsService.getNews(filters, settings.sortBy)
      setNews(data)
    } catch (error) {
      console.error('Error loading news:', error)
      showNotification('Ошибка при загрузке новостей', 'error' )
    } finally {
      setLoading(false)
    }
  }, [filters, settings.sortBy, showNotification])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  useEffect(() => {
    // Сохраняем фильтры в настройках
    setSettings({
      ...settings,
      filters: filters as any
    })
  }, [filters])

  useEffect(() => {
    getPublicIP().then(ip => {
      setIp(ip);
    });
  }, []);

  const handleRate = async (newsId: string, increment: number) => {
    try {
      await newsService.updateRating(newsId, increment)
      // Обновляем локальное состояние
      setNews(news.map(item =>
        item.id === newsId
          ? { ...item, rating: item.rating + increment }
          : item
      ))
    } catch (error) {
      console.error('Error updating rating:', error)
      showNotification('Ошибка при оценке новости', 'error')
    }
  }

  const handleShare = (newsItem: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.short_content,
        url: newsItem.url || window.location.href
      })
    } else {
      navigator.clipboard.writeText(newsItem.url || window.location.href)
      showNotification('Ссылка скопирована в буфер обмена', 'success' )
    }
  }

  const handleSuggestEdit = async (newsItem: NewsItem, content: string) => {
    try {
      console.log(ip)
      await newsService.suggestEdit(newsItem.id, content, ip)
      showNotification('Предложение отправлено на модерацию', 'success' )
    } catch (error) {
      console.error('Error suggesting edit:', error)
      showNotification('Ошибка при отправке предложения', 'error')
    }
  }

  const availableSources = Array.from(new Set(news.map(item => item.source_id)))
  const availableTags = Array.from(new Set(news.flatMap(item => item.tags)))

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Новости</h1>
        <p className="page__subtitle">Свежие новости из ваших источников</p>
      </div>

      <div className="page__content">
        <div className="page__sidebar">
          <NewsFilters
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={settings.sortBy}
            onSortChange={(sortBy) => setSettings({ ...settings, sortBy })}
            availableSources={availableSources}
            availableTags={availableTags}
          />
        </div>

        <div className="page__main">
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
  )
}
