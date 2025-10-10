// components/news/MobileNewsFilters.tsx
import { X, SortAsc, SortDesc, ArrowUpDown, Settings2 } from 'lucide-react';
import React, { useState, useRef } from 'react';

import type { NewsFilters, FilterGroup, ActiveFilter } from '../../types/news';

interface MobileNewsFiltersProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
  sortBy: 'date' | 'rating';
  onSortChange: (sort: 'date' | 'rating') => void;
  availableSources: string[];
  availableTags: string[];
}

export const MobileNewsFilters: React.FC<MobileNewsFiltersProps> = ({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  availableSources,
  availableTags
}) => {
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sourceTypes = [
    { id: 'telegram', label: 'Telegram', value: 'telegram' },
    { id: 'rss', label: 'RSS', value: 'rss' },
    { id: 'website', label: 'Website', value: 'website' },
    { id: 'other', label: 'Other', value: 'other' }
  ];

  const filterGroups: FilterGroup[] = [
    {
      id: 'sources',
      label: 'Источники',
      type: 'checkbox',
      options: availableSources.map(source => ({
        id: source,
        label: source,
        value: source
      }))
    },
    {
      id: 'sourceTypes',
      label: 'Типы источников',
      type: 'checkbox',
      options: sourceTypes
    },
    {
      id: 'tags',
      label: 'Теги',
      type: 'checkbox',
      options: availableTags.map(tag => ({
        id: tag,
        label: tag,
        value: tag
      }))
    }
  ];

  const activeFilters: ActiveFilter[] = [
    ...filters.sources.map(source => ({
      groupId: 'sources',
      label: source,
      value: source
    })),
    ...filters.sourceTypes.map(type => ({
      groupId: 'sourceTypes',
      label: type,
      value: type
    })),
    ...filters.tags.map(tag => ({
      groupId: 'tags',
      label: tag,
      value: tag
    }))
  ];

  const updateFilter = (groupId: string, value: string, checked: boolean) => {
    const filterKey = groupId as keyof NewsFilters;

    if (Array.isArray(filters[filterKey])) {
      const currentValues = filters[filterKey] as string[];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value);

      onFiltersChange({
        ...filters,
        [filterKey]: newValues
      });
    }
  };

  const removeFilter = (filter: ActiveFilter) => {
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

  const isFilterSelected = (groupId: string, value: string) => {
    return (filters[groupId as keyof NewsFilters] ?? []).includes(value);
  };

  return (
    <div className='mobile-filters'>
      {/* Верхняя панель фильтров */}
      <div className='mobile-filters__top'>
        <div className='mobile-filters__active'>
          <div className='mobile-filters__active-list' ref={scrollContainerRef}>
            <button
              className='mobile-filters__button'
              onClick={() => setShowSortModal(true)}
            >
              <ArrowUpDown size={16} />
            </button>

            <button
              className='mobile-filters__button'
              onClick={() => setShowFilterModal(true)}
            >
              <Settings2 size={16} />
              {activeFilters.length > 0 && (
                <span className='mobile-filters__count'>{activeFilters.length}</span>
              )}
            </button>

            {/* Активные фильтры */}
            {activeFilters.length > 0 && (
              <>
                {activeFilters.map(filter => (
                  <div key={`${filter.groupId}-${filter.value}`} className='mobile-filters__active-item'>
                    <span className='mobile-filters__active-label'>{filter.label}</span>
                    <button
                      className='mobile-filters__active-remove'
                      onClick={() => removeFilter(filter)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {/* <button
                className='mobile-filters__clear-all'
                onClick={clearAllFilters}
              >
                Очистить
              </button> */}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Всплывающее меню сортировки */}
      {
        showSortModal && (
          <div className='mobile-modal'>
            <div className='mobile-modal__content'>
              <div className='mobile-modal__header'>
                <h3 className='mobile-modal__title'>Сортировка</h3>
                <button
                  className='mobile-modal__close'
                  onClick={() => setShowSortModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className='mobile-modal__options'>
                <button
                  className={`mobile-modal__option ${sortBy === 'date' ? 'mobile-modal__option--active' : ''}`}
                  onClick={() => {
                    onSortChange('date');
                    setShowSortModal(false);
                  }}
                >
                  <SortDesc size={16} />
                  По дате
                </button>
                <button
                  className={`mobile-modal__option ${sortBy === 'rating' ? 'mobile-modal__option--active' : ''}`}
                  onClick={() => {
                    onSortChange('rating');
                    setShowSortModal(false);
                  }}
                >
                  <SortAsc size={16} />
                  По рейтингу
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Всплывающее меню фильтров в виде chips */}
      {
        showFilterModal && (
          <div className='mobile-modal'>
            <div className='mobile-modal__content'>
              <div className='mobile-modal__header'>
                <h3 className='mobile-modal__title'>Фильтры</h3>
                <div className='mobile-modal__header-actions'>
                  <button
                    className='mobile-modal__clear'
                    onClick={clearAllFilters}
                  >
                    Очистить все
                  </button>
                  <button
                    className='mobile-modal__close'
                    onClick={() => setShowFilterModal(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className='mobile-modal__chips-content'>
                {filterGroups.map(group => (
                  <div key={group.id} className='mobile-modal__chips-group'>
                    <h4 className='mobile-modal__chips-group-title'>{group.label}</h4>
                    <div className='mobile-modal__chips-list'>
                      {group.options.map(option => {
                        const isSelected = isFilterSelected(group.id, option.value);

                        return (
                          <button
                            key={option.id}
                            className={`mobile-modal__chip ${isSelected ? 'mobile-modal__chip--active' : ''}`}
                            onClick={() => updateFilter(group.id, option.value, !isSelected)}
                          >
                            {option.label}
                            {option.count && (
                              <span className='mobile-modal__chip-count'>{option.count}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className='mobile-modal__footer'>
                <button
                  className='button button--primary mobile-modal__apply'
                  onClick={() => setShowFilterModal(false)}
                >
                  Показать результаты
                  {activeFilters.length > 0 && (
                    <span className='mobile-modal__apply-count'>({activeFilters.length})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};
