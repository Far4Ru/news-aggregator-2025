import type { NewsFilters } from "./news";

export interface User {
    id: string;
    ip?: string;
    email?: string;
    role: 'guest' | 'moderator';
}

export interface AppSettings {
    selectedSources: string[];
    sortBy: 'date' | 'rating';
    filters: NewsFilters;
    notificationsEnabled: boolean;
}

export type NotificationType = 'new_news' | 'moderation' | 'system';
