// components/common/Notification.tsx
import { useEffect, useState } from 'react';

export interface NotificationProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose: (id: string) => void
}

export const NotificationCard: React.FC<NotificationProps> = ({
  id,
  message,
  type,
  duration = 1000,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'info':
      return 'ℹ️';
    default:
      return 'ℹ️';
    }
  };

  return (
    <div className={`notification notification--${type} ${isClosing ? 'notification--closing' : ''}`}>
      <div className='notification__content'>
        <span className='notification__icon'>{getIcon()}</span>
        <span className='notification__message'>{message}</span>
      </div>
    </div>
  );
};
