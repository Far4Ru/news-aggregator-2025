import React, { useState, useEffect } from 'react'
import { NewsSuggestion } from '@/types'
import { ModerationList } from '@/components/moderation/ModerationList'
import { newsService } from '@/services/newsService'
import { moderationService } from '@/services/moderationService'
import { useNotification } from '@/context/NotificationContext'

export const Suggestions: React.FC = () => {
    const { showNotification } = useNotification()
    const [suggestions, setSuggestions] = useState<NewsSuggestion[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSuggestions()
    }, [])

    const loadSuggestions = async () => {
        setLoading(true)
        try {
            const data = await newsService.getSuggestions()
            setSuggestions(data || [])
        } catch (error) {
            console.error('Error loading suggestions:', error)
            showNotification('Ошибка при загрузке предложений', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (suggestionId: string) => {
        try {
            await newsService.moderateSuggestion(suggestionId, 'approve')
            showNotification('Предложение подтверждено', 'success')
            loadSuggestions() // Перезагружаем список
        } catch (error) {
            console.error('Error approving suggestion:', error)
            showNotification('Ошибка при подтверждении предложения', 'error')
        }
    }

    const handleReject = async (suggestionId: string) => {
        try {
            await newsService.moderateSuggestion(suggestionId, 'reject')
            showNotification('Предложение отклонено', 'success')
            loadSuggestions() // Перезагружаем список
        } catch (error) {
            console.error('Error rejecting suggestion:', error)
            showNotification('Ошибка при отклонении предложения', 'error')
        }
    }

    const handleBlock = async (ip: string) => {
        try {
            await moderationService.blockIp(ip)
            showNotification(`IP ${ip} заблокирован`, 'success')
        } catch (error) {
            console.error('Error blocking IP:', error)
            showNotification('Ошибка при блокировке IP', 'error')
        }
    }

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Предложения правок</h1>
                <p className="page__subtitle">Модерация предложенных изменений новостей</p>
            </div>

            <div className="page__content">
                <ModerationList
                    suggestions={suggestions}
                    loading={loading}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onBlock={handleBlock}
                />
            </div>
        </div>
    )
}