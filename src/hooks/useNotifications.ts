import { useState, useEffect, useCallback } from 'react';

import { useNotification } from './useNotification';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPeriodicSyncSupported, setIsPeriodicSyncSupported] = useState(false);
  const { showCardNotification } = useNotification();

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      // Проверяем поддержку периодической синхронизации
      if ('periodicSync' in registration) {
        setIsPeriodicSyncSupported(true);

        // Регистрируем периодическую синхронизацию
        try {
          await (registration as any).periodicSync.register('news-update', {
            minInterval: 60000 // 1 минута
          });
        } catch (error) {
          console.log('Periodic sync not supported:', error);
        }
      }

      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, [isSupported]);

  useEffect(() => {
    const supported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      typeof Notification !== 'undefined';

    setIsSupported(supported);
    checkSubscription();
  }, [checkSubscription]);

  const subscribe = async () => {
    if (!isSupported) {
      console.warn('Уведомления не поддерживаются');

      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        showCardNotification('Разрешение на уведомления не получено', 'error');

        return;
      }

      // Регистрируем фоновую синхронизацию
      const registration = await navigator.serviceWorker.ready;

      if ('sync' in registration) {
        await (registration as any).sync.register('news-sync');
      }

      setIsSubscribed(true);
      showCardNotification('Уведомления включены', 'success');
    } catch (error) {
      console.error('Ошибка подписки на уведомления:', error);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;

    try {
      // Отменяем периодическую синхронизацию
      if (isPeriodicSyncSupported) {
        const registration = await navigator.serviceWorker.ready;

        await (registration as any).periodicSync.unregister('news-update');
      }

      showCardNotification('Уведомления выключены', 'success');
      setIsSubscribed(false);
    } catch (error) {
      console.error('Ошибка отписки от уведомлений:', error);
    }
  };

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isSupported || !isSubscribed) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options
      });
    }
  }, [isSupported, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    isPeriodicSyncSupported,
    subscribe,
    unsubscribe,
    showNotification
  };
};
