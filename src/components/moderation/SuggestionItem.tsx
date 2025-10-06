import React from 'react'
import { Check, X, Ban, Calendar, Globe } from 'lucide-react'
import { NewsSuggestion } from '../../types/news'

interface SuggestionItemProps {
    suggestion: NewsSuggestion
    onApprove: (suggestionId: string) => void
    onReject: (suggestionId: string) => void
    onBlock: (ip: string) => void
}

export const SuggestionItem: React.FC<SuggestionItemProps> = ({
    suggestion,
    onApprove,
    onReject,
    onBlock
}) => {
    const isProcessed = suggestion.status !== 'pending'

    return (
        <div className={`suggestion-item ${isProcessed ? 'suggestion-item--processed' : ''}`}>
            <div className="suggestion-item__header">
                <h4 className="suggestion-item__title">
                    Предложение для новости #{suggestion.news_id}
                </h4>
                <div className="suggestion-item__meta">
                    <span className="suggestion-item__date">
                        <Calendar size={14} />
                        {new Date(suggestion.created_at).toLocaleDateString()}
                    </span>
                    {suggestion.status !== 'pending' && (
                        <span className={`suggestion-item__status suggestion-item__status--${suggestion.status}`}>
                            {suggestion.status === 'approved' ? 'Подтверждено' : 'Отклонено'}
                        </span>
                    )}
                </div>
            </div>

            <div className="suggestion-item__content">
                <div className="suggestion-item__original">
                    <h5 className="suggestion-item__subtitle">Оригинальный текст:</h5>
                    <p className="suggestion-item__text">{suggestion.original_content}</p>
                </div>

                <div className="suggestion-item__suggested">
                    <h5 className="suggestion-item__subtitle">Предложенный текст:</h5>
                    <p className="suggestion-item__text">{suggestion.suggested_content}</p>
                </div>
            </div>

            <div className="suggestion-item__footer">
                <div className="suggestion-item__ip">
                    <Globe size={14} />
                    IP: {suggestion.suggested_by_ip}
                </div>

                {!isProcessed && (
                    <div className="suggestion-item__actions">
                        <button
                            className="suggestion-item__button suggestion-item__button--block"
                            onClick={() => onBlock(suggestion.suggested_by_ip)}
                            title="Заблокировать IP"
                        >
                            <Ban size={16} />
                        </button>
                        <button
                            className="suggestion-item__button suggestion-item__button--reject"
                            onClick={() => onReject(suggestion.id)}
                        >
                            <X size={16} />
                            Отклонить
                        </button>
                        <button
                            className="suggestion-item__button suggestion-item__button--approve"
                            onClick={() => onApprove(suggestion.id)}
                        >
                            <Check size={16} />
                            Подтвердить
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}