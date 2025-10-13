import { Bell, Settings, Download, Upload, LogOut, BellOff, Menu, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useAppSettings } from '../../hooks/useLocalStorage';
import { useNotifications } from '../../hooks/useNotifications';

export const Header: React.FC = () => {
  const location = useLocation();
  const authContext = useAuth();
  const navigate = useNavigate();
  const settingsInputRef = useRef<HTMLInputElement>(null);
  const { importSettings, exportSettings } = useAppSettings();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = useNotifications();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleImport = () => {
    settingsInputRef.current?.click();
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      importSettings(file);
    }
  };

  const handleExport = () => {
    const url = exportSettings();
    const a = document.createElement('a');

    a.href = url;
    a.download = 'news-app-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const logout = () => {
    authContext.logout();
    navigate('/');
    closeMenu();
  };

  return (
    <header className='navbar'>
      <div className='navbar__container'>
        <Link to='/' className='navbar__logo' onClick={closeMenu}>
          <img
            src='./logo.png'
            alt='Агрегатор новостей'
            className='navbar__logo-image'
          />
        </Link>

        <nav className={`navbar__nav ${isMenuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className='navbar__menu'>
            <li className='navbar__item'>
              <Link
                to='/'
                className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
                onClick={closeMenu}
              >
                Новости
              </Link>
            </li>
            <li className='navbar__item'>
              <Link
                to='/sources'
                className={`navbar__link ${location.pathname === '/sources' ? 'navbar__link--active' : ''}`}
                onClick={closeMenu}
              >
                Источники
              </Link>
            </li>
            {(authContext.user?.role === 'moderator') && (
              <>
                <li className='navbar__item'>
                  <Link
                    to='/moderation'
                    className={`navbar__link ${location.pathname === '/moderation' ? 'navbar__link--active' : ''}`}
                    onClick={closeMenu}
                  >
                    Модерация
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className='navbar__actions'>
          {isSupported && (
            <button
              className='navbar__button'
              onClick={toggleNotifications}
              title={isSubscribed ? 'Отключить уведомления' : 'Включить уведомления'}
            >
              {isSubscribed && (
                <Bell size={20} className='navbar__icon--active' />
              )}
              {!isSubscribed && (
                <BellOff size={20} />
              )}
            </button>
          )}

          <div className='navbar__dropdown'>
            <button className='navbar__button'>
              <Settings size={20} />
            </button>
            <div className='navbar__dropdown-content'>
              <button className='navbar__dropdown-item' onClick={handleExport}>
                <Download size={16} />
                Экспорт настроек
              </button>
              <button className='navbar__dropdown-item' onClick={handleImport}>
                <Upload size={16} />
                Импорт настроек
                <input
                  ref={settingsInputRef}
                  type='file'
                  accept='.json'
                  onChange={handleImportChange}
                  style={{ display: 'none' }}
                />
              </button>
            </div>
          </div>

          {(authContext.user?.role === 'moderator') && (
            <button
              className='navbar__button'
              onClick={logout}
              title='Выйти из режима модерации'
            >
              <LogOut size={20} />
            </button>
          )}

          <button
            className='navbar__button navbar__burger'
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
