// components/news/MobileNewsFilters.tsx
import { Filter, X, ChevronDown, SortAsc, SortDesc } from 'lucide-react';
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
  const [activeFilterGroup, setActiveFilterGroup] = useState<string | null>(null);
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

  const getFilterGroup = (groupId: string) => {
    return filterGroups.find(group => group.id === groupId);
  };

  return (
    <div className='mobile-filters'>
      {/* Верхняя панель фильтров */}
      <div className='mobile-filters__top'>
        <div className='mobile-filters__actions'>
          <button
            className='mobile-filters__button'
            onClick={() => setShowSortModal(true)}
          >
            <SortAsc size={16} />
            {sortBy === 'date' ? 'По дате' : 'По рейтингу'}
            <ChevronDown size={14} />
          </button>

          <button
            className='mobile-filters__button'
            onClick={() => setShowFilterModal(true)}
          >
            <Filter size={16} />
            Фильтры
            {activeFilters.length > 0 && (
              <span className='mobile-filters__count'>{activeFilters.length}</span>
            )}
          </button>
        </div>

        {/* Активные фильтры */}
        {activeFilters.length > 0 && (
          <div className='mobile-filters__active'>
            <div className='mobile-filters__active-list' ref={scrollContainerRef}>
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
            </div>
            <button
              className='mobile-filters__clear-all'
              onClick={clearAllFilters}
            >
              Очистить
            </button>
          </div>
        )}

        {/* Горизонтальный список групп фильтров */}
        <div className='mobile-filters__groups'>
          {filterGroups.map(group => (
            <button
              key={group.id}
              className={`mobile-filters__group-button ${activeFilterGroup === group.id ? 'mobile-filters__group-button--active' : ''}`}
              onClick={() => setActiveFilterGroup(
                activeFilterGroup === group.id ? null : group.id
              )}
            >
              {group.label}
              {(filters[group.id as keyof NewsFilters]?.length ?? 0) > 0 && (
                <span className='mobile-filters__group-count'>
                  {(filters[group.id as keyof NewsFilters] as string[]).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Всплывающее меню сортировки */}
      {showSortModal && (
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
      )}

      {/* Всплывающее меню фильтров */}
      {showFilterModal && (
        <div className='mobile-modal'>
          <div className='mobile-modal__content'>
            <div className='mobile-modal__header'>
              <h3 className='mobile-modal__title'>Фильтры</h3>
              <div className='mobile-modal__header-actions'>
                <button
                  className='mobile-modal__clear'
                  onClick={clearAllFilters}
                >
                  Очистить
                </button>
                <button
                  className='mobile-modal__close'
                  onClick={() => setShowFilterModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className='mobile-modal__filter-groups'>
              {filterGroups.map(group => (
                <div key={group.id} className='mobile-modal__filter-group'>
                  <h4 className='mobile-modal__filter-group-title'>{group.label}</h4>
                  <div className='mobile-modal__filter-options'>
                    {group.options.map(option => {
                      const isChecked = (filters[group.id as keyof NewsFilters] ?? []).includes(option.value);

                      return (
                        <label key={option.id} className='mobile-modal__filter-option'>
                          <input
                            type='checkbox'
                            checked={isChecked}
                            onChange={(e) => updateFilter(group.id, option.value, e.target.checked)}
                            className='mobile-modal__checkbox'
                          />
                          <span className='mobile-modal__checkmark' />
                          <span className='mobile-modal__option-label'>{option.label}</span>
                          {option.count && (
                            <span className='mobile-modal__option-count'>{option.count}</span>
                          )}
                        </label>
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
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Всплывающий список опций для активной группы */}
      {activeFilterGroup && (
        <div className='mobile-filter-popover'>
          <div className='mobile-filter-popover__content'>
            <div className='mobile-filter-popover__header'>
              <h4 className='mobile-filter-popover__title'>
                {getFilterGroup(activeFilterGroup)?.label}
              </h4>
              <button
                className='mobile-filter-popover__close'
                onClick={() => setActiveFilterGroup(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className='mobile-filter-popover__options'>
              {getFilterGroup(activeFilterGroup)?.options.map(option => {
                const isChecked = (filters[activeFilterGroup as keyof NewsFilters] ?? []).includes(option.value);

                return (
                  <label key={option.id} className='mobile-filter-popover__option'>
                    <input
                      type='checkbox'
                      checked={isChecked}
                      onChange={(e) => updateFilter(activeFilterGroup, option.value, e.target.checked)}
                      className='mobile-filter-popover__checkbox'
                    />
                    <span className='mobile-filter-popover__checkmark' />
                    <span className='mobile-filter-popover__option-label'>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
