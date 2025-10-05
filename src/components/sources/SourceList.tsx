import React from 'react'
import { NewsSource } from '@/types'
import { SourceCard } from './SourceCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface SourceListProps {
    sources: NewsSource[]
    loading: boolean
    userSources: string[]
    onAddSource: (sourceId: string) => void
    onRemoveSource: (sourceId: string) => void
}

export const SourceList: React.FC<SourceListProps> = ({
    sources,
    loading,
    userSources,
    onAddSource,
    onRemoveSource
}) => {
    if (loading) {
        return <LoadingSpinner />
    }

    if (sources.length === 0) {
        return (
            <div className="source-list__empty">
                <h3 className="source-list__empty-title">Источники не найдены</h3>
                <p className="source-list__empty-text">Попробуйте изменить параметры поиска</p>
            </div>
        )
    }

    return (
        <div className="source-list">
            {sources.map(source => (
                <SourceCard
                    key={source.id}
                    source={source}
                    isAdded={userSources.includes(source.id)}
                    onAdd={onAddSource}
                    onRemove={onRemoveSource}
                />
            ))}
        </div>
    )
}