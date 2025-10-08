import { createContext} from 'react';

export interface NotificationContextType {
    showCardNotification: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
