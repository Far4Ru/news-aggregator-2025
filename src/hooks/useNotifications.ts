import { useState, useEffect, useCallback } from 'react';

import { useNotification } from './useNotification';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showCardNotification } = useNotification();

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

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
    // setIsSupported('Notification' in window && 'serviceWorker' in navigator);
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
      setIsSubscribed(true);
      showCardNotification('Уведомления включены', 'success');
    } catch (error) {
      console.error('Ошибка подписки на уведомления:', error);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;

    try {
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
        ...options
      });
    }
  }, [isSupported, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    showNotification
  };
};
