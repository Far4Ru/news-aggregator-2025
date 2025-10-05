import React from 'react'
import { NewsFilters as NewsFiltersType } from '@/types'
import { FilterPanel } from '@/components/common/FilterPanel'
import { SearchBar } from '@/components/common/SearchBar'
import { SortAsc, SortDesc } from 'lucide-react'

interface NewsFiltersProps {
    filters: NewsFiltersType
    onFiltersChange: (filters: NewsFiltersType) => void
    sortBy: 'date' | 'rating'
    onSortChange: (sort: 'date' | 'rating') => void
    availableSources: string[]
    availableTags: string[]
}

export const NewsFilters: React.FC<NewsFiltersProps> = ({
    filters,
    onFiltersChange,
    sortBy,
    onSortChange,
    availableSources,
    availableTags
}) => {
    return (
        <div className="news-filters">
            <div className="news-filters__top">
                <div className="news-filters__search">
                    <SearchBar
                        value={filters.searchQuery}
                        onChange={(value) => onFiltersChange({ ...filters, searchQuery: value })}
                        placeholder="Поиск по новостям..."
                    />
                </div>

                <div className="news-filters__sort">
                    <button
                        className={`news-filters__sort-button ${sortBy === 'date' ? 'news-filters__sort-button--active' : ''}`}
                        onClick={() => onSortChange('date')}
                    >
                        <SortDesc size={16} />
                        По дате
                    </button>
                    <button
                        className={`news-filters__sort-button ${sortBy === 'rating' ? 'news-filters__sort-button--active' : ''}`}
                        onClick={() => onSortChange('rating')}
                    >
                        <SortAsc size={16} />
                        По рейтингу
                    </button>
                </div>
            </div>

            <FilterPanel
                filters={filters}
                onFiltersChange={onFiltersChange}
                availableSources={availableSources}
                availableTags={availableTags}
            />
        </div>
    )
}