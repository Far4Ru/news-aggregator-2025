import React from 'react'
import type { NewsItem } from '../../types/news'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { NewsCard } from '../common/NewsCard'

interface NewsListProps {
    news: NewsItem[]
    loading: boolean
    onRate: (newsId: string, increment: number) => void
    onShare: (news: NewsItem) => void
    onSuggestEdit: (news: NewsItem, content: string) => void
}

export const NewsList: React.FC<NewsListProps> = ({
    news,
    loading,
    onRate,
    onShare,
    onSuggestEdit
}) => {
    if (loading) {
        return <LoadingSpinner />
    }

    if (news.length === 0) {
        return (
            <div className="news-list__empty">
                <h3 className="news-list__empty-title">Новости не найдены</h3>
                <p className="news-list__empty-text">Попробуйте изменить параметры фильтрации</p>
            </div>
        )
    }

    return (
        <div className="news-list">
            {news.map(item => (
                <NewsCard
                    key={item.id}
                    news={item}
                    onRate={onRate}
                    onShare={onShare}
                    onSuggestEdit={onSuggestEdit}
                />
            ))}
        </div>
    )
}