import React from 'react'
import { NewsFilters } from '@/types'
import { Filter, X } from 'lucide-react'

interface FilterPanelProps {
    filters: NewsFilters
    onFiltersChange: (filters: NewsFilters) => void
    availableSources: string[]
    availableTags: string[]
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    onFiltersChange,
    availableSources,
    availableTags
}) => {
    const sourceTypes = ['telegram', 'rss', 'website', 'other']

    const updateFilter = (key: keyof NewsFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value
        })
    }

    const clearFilters = () => {
        onFiltersChange({
            sources: [],
            sourceTypes: [],
            tags: [],
            searchQuery: '',
            dateFrom: '',
            dateTo: ''
        })
    }

    const hasActiveFilters =
        filters.sources.length > 0 ||
        filters.sourceTypes.length > 0 ||
        filters.tags.length > 0 ||
        filters.searchQuery ||
        filters.dateFrom ||
        filters.dateTo

    return (
        <div className="filter-panel">
            <div className="filter-panel__header">
                <h3 className="filter-panel__title">
                    <Filter size={20} />
                    Фильтры
                </h3>
                {hasActiveFilters && (
                    <button className="filter-panel__clear" onClick={clearFilters}>
                        <X size={16} />
                        Очистить
                    </button>
                )}
            </div>

            <div className="filter-panel__section">
                <label className="filter-panel__label">Дата от</label>
                <input
                    type="date"
                    className="filter-panel__input"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
            </div>

            <div className="filter-panel__section">
                <label className="filter-panel__label">Дата до</label>
                <input
                    type="date"
                    className="filter-panel__input"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
            </div>

            <div className="filter-panel__section">
                <label className="filter-panel__label">Источники</label>
                <div className="filter-panel__chips">
                    {availableSources.map(source => (
                        <button
                            key={source}
                            className={`filter-panel__chip ${filters.sources.includes(source) ? 'filter-panel__chip--active' : ''}`}
                            onClick={() => {
                                const newSources = filters.sources.includes(source)
                                    ? filters.sources.filter(s => s !== source)
                                    : [...filters.sources, source]
                                updateFilter('sources', newSources)
                            }}
                        >
                            {source}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-panel__section">
                <label className="filter-panel__label">Типы источников</label>
                <div className="filter-panel__chips">
                    {sourceTypes.map(type => (
                        <button
                            key={type}
                            className={`filter-panel__chip ${filters.sourceTypes.includes(type) ? 'filter-panel__chip--active' : ''}`}
                            onClick={() => {
                                const newTypes = filters.sourceTypes.includes(type)
                                    ? filters.sourceTypes.filter(t => t !== type)
                                    : [...filters.sourceTypes, type]
                                updateFilter('sourceTypes', newTypes)
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="filter-panel__section">
                <label className="filter-panel__label">Теги</label>
                <div className="filter-panel__chips">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            className={`filter-panel__chip ${filters.tags.includes(tag) ? 'filter-panel__chip--active' : ''}`}
                            onClick={() => {
                                const newTags = filters.tags.includes(tag)
                                    ? filters.tags.filter(t => t !== tag)
                                    : [...filters.tags, tag]
                                updateFilter('tags', newTags)
                            }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}