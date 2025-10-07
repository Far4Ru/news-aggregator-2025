import type { NewsFilters } from "./news";

export interface User {
    id: string;
    email?: string;
    role: 'user' | 'moderator';
}

export interface AppSettings {
    selectedSources: string[];
    sortBy: 'date' | 'rating';
    filters: NewsFilters;
    notificationsEnabled: boolean;
    userRole: 'user' | 'moderator';
}

export type NotificationType = 'new_news' | 'moderation' | 'system';
