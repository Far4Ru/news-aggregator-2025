import { useCallback, useState, type ReactNode } from 'react';

import { NotificationCard } from '../components/common/NotificationCard';

import { NotificationContext } from './NotificationContext';

export interface NotificationItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showCardNotification = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' = 'info',
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationItem = { id, message, type, duration };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showCardNotification }}>
      {children}
      <div className='notification-container'>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            {...notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
