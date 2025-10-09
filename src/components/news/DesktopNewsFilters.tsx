// components/news/DesktopNewsFilters.tsx
import { Filter, X } from 'lucide-react';
import React from 'react';

import type { NewsFilters } from '../../types/news';
import { FilterPanel } from '../common/FilterPanel';

interface DesktopNewsFiltersProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
  sortBy: 'date' | 'rating';
  onSortChange: (sort: 'date' | 'rating') => void;
  availableSources: string[];
  availableTags: string[];
}

export const DesktopNewsFilters: React.FC<DesktopNewsFiltersProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  availableSources,
  availableTags
}) => {
  const activeFilters = [
    ...filters.sources.map(source => ({ groupId: 'sources', label: source, value: source })),
    ...filters.sourceTypes.map(type => ({ groupId: 'sourceTypes', label: type, value: type })),
    ...filters.tags.map(tag => ({ groupId: 'tags', label: tag, value: tag }))
  ];

  const removeFilter = (filter: { groupId: string; value: string }) => {
    const filterKey = filter.groupId as keyof NewsFilters;

    if (Array.isArray(filters[filterKey])) {
      const newValues = (filters[filterKey] as string[]).filter(v => v !== filter.value);

      onFiltersChange({
        ...filters,
        [filterKey]: newValues
      });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      sources: [],
      sourceTypes: [],
      tags: []
    });
  };

  return (
    <div className='desktop-filters'>
      {/* Активные фильтры сверху */}
      {activeFilters.length > 0 && (
        <div className='desktop-filters__active'>
          <div className='desktop-filters__active-header'>
            <h4 className='desktop-filters__active-title'>Активные фильтры</h4>
            <button
              className='desktop-filters__clear-all'
              onClick={clearAllFilters}
            >
              Очистить все
            </button>
          </div>
          <div className='desktop-filters__active-list'>
            {activeFilters.map(filter => (
              <div key={`${filter.groupId}-${filter.value}`} className='desktop-filters__active-item'>
                <span className='desktop-filters__active-label'>{filter.label}</span>
                <button
                  className='desktop-filters__active-remove'
                  onClick={() => removeFilter(filter)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Панель фильтров */}
      <FilterPanel
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableSources={availableSources}
        availableTags={availableTags}
      />
    </div>
  );
};
