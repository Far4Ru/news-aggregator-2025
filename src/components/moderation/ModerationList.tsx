import React from 'react'
import { NewsSuggestion } from '@/types'
import { SuggestionItem } from './SuggestionItem'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ModerationListProps {
    suggestions: NewsSuggestion[]
    loading: boolean
    onApprove: (suggestionId: string) => void
    onReject: (suggestionId: string) => void
    onBlock: (ip: string) => void
}

export const ModerationList: React.FC<ModerationListProps> = ({
    suggestions,
    loading,
    onApprove,
    onReject,
    onBlock
}) => {
    if (loading) {
        return <LoadingSpinner />
    }

    if (suggestions.length === 0) {
        return (
            <div className="moderation-list__empty">
                <h3 className="moderation-list__empty-title">Предложения не найдены</h3>
                <p className="moderation-list__empty-text">Нет предложений, ожидающих модерации</p>
            </div>
        )
    }

    const pendingSuggestions = suggestions.filter(s => s.status === 'pending')
    const processedSuggestions = suggestions.filter(s => s.status !== 'pending')

    return (
        <div className="moderation-list">
            {pendingSuggestions.length > 0 && (
                <div className="moderation-list__section">
                    <h3 className="moderation-list__section-title">Ожидают модерации</h3>
                    {pendingSuggestions.map(suggestion => (
                        <SuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApprove={onApprove}
                            onReject={onReject}
                            onBlock={onBlock}
                        />
                    ))}
                </div>
            )}

            {processedSuggestions.length > 0 && (
                <div className="moderation-list__section">
                    <h3 className="moderation-list__section-title">Обработанные</h3>
                    {processedSuggestions.map(suggestion => (
                        <SuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            onApprove={onApprove}
                            onReject={onReject}
                            onBlock={onBlock}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}