import type { NewsFilters as NewsFiltersType } from '../../types/news';
import { SearchBar } from '../common/SearchBar';

import { DesktopNewsFilters } from './DesktopNewsFilters';
import { MobileNewsFilters } from './MobileNewsFilters';

interface NewsFiltersProps {
  filters: NewsFiltersType;
  onFiltersChange: (filters: NewsFiltersType) => void;
  sortBy: 'date' | 'rating';
  onSortChange: (sort: 'date' | 'rating') => void;
  availableSources: string[];
  availableTags: string[];
}

export const NewsFilters: React.FC<NewsFiltersProps> = (props) => {
  const {
    filters,
    onFiltersChange,
  } = props;

  return (
    <div className='news-filters'>
      {/* Поисковая строка - общая для всех версий */}
      <div className='news-filters__search'>
        <SearchBar
          value={filters.searchQuery}
          onChange={(value) => onFiltersChange({ ...filters, searchQuery: value })}
          placeholder='Поиск по новостям...'
        />
      </div>

      {/* Мобильная версия фильтров */}
      <div className='news-filters__mobile'>
        <MobileNewsFilters {...props} />
      </div>

      {/* Десктопная версия фильтров */}
      <div className='news-filters__desktop'>
        <DesktopNewsFilters {...props} />
      </div>
    </div>
  );
};
