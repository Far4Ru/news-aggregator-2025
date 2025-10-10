import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const iconMap = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
};

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

  const IconComponent = iconMap[type];

  return (
    <div className={`notification notification--${type} ${isClosing ? 'notification--closing' : ''}`}>
      <div className='notification__content'>
        <IconComponent size={20} />
        <span className='notification__message'>{message}</span>
      </div>
    </div>
  );
};
