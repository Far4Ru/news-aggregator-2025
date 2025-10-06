export interface NewsSource {
    id: string;
    name: string;
    description: string;
    url: string;
    type: 'telegram' | 'rss' | 'website' | 'other';
    activity_data: number[]; // daily news count for last 7 days
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    added_by?: string;
}

export interface SourceStats {
    daily_count: number;
    total_news: number;
    last_updated: string;
}