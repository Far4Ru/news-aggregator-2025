export interface NewsItem {
    id: string;
    title: string;
    content: string;
    short_content: string;
    source_id: string;
    source_type: 'telegram' | 'rss' | 'website' | 'other';
    status: string;
    published_at: string;
    rating: number;
    tags: string[];
    url: string;
    sources: any;
    created_at: string;
    updated_at: string;
}

export interface NewsSuggestion {
    id: string;
    news_id: string;
    original_content: string;
    suggested_content: string;
    suggested_by_ip: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user_agent?: string;
}

export interface NewsFilters {
    dateFrom?: string;
    dateTo?: string;
    sources: string[];
    sourceTypes: string[];
    tags: string[];
    searchQuery: string;
}

export interface FilterOption {
    id: string;
    label: string;
    value: string;
    count?: number;
}

export interface FilterGroup {
    id: string;
    label: string;
    type: 'checkbox' | 'radio';
    options: FilterOption[];
}

export interface ActiveFilter {
    groupId: string;
    label: string;
    value: string;
}
