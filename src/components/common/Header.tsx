import { Bell, Settings, Download, Upload } from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAppSettings } from '../../hooks/useLocalStorage'
import { useNotifications } from '../../hooks/useNotifications'

export const Header: React.FC = () => {
    const location = useLocation()
    const { settings, importSettings, exportSettings } = useAppSettings()
    const { isSupported, isSubscribed, subscribe, unsubscribe } = useNotifications()

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            importSettings(file)
        }
    }

    const handleExport = () => {
        const url = exportSettings()
        const a = document.createElement('a')
        a.href = url
        a.download = 'news-app-settings.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    const toggleNotifications = async () => {
        if (isSubscribed) {
            await unsubscribe()
        } else {
            await subscribe()
        }
    }

    return (
        <header className="navbar">
            <div className="navbar__container">
                <Link to="/" className="navbar__logo">
                    <img 
                        src="./logo.png" 
                        alt="Агрегатор новостей" 
                        className="navbar__logo-image"
                    />
                </Link>

                <nav className="navbar__nav">
                    <ul className="navbar__menu">
                        <li className="navbar__item">
                            <Link
                                to="/news"
                                className={`navbar__link ${location.pathname === '/news' ? 'navbar__link--active' : ''}`}
                            >
                                Новости
                            </Link>
                        </li>
                        <li className="navbar__item">
                            <Link
                                to="/sources"
                                className={`navbar__link ${location.pathname === '/sources' ? 'navbar__link--active' : ''}`}
                            >
                                Источники
                            </Link>
                        </li>
                        {(settings.userRole === 'moderator') && (
                            <>
                                <li className="navbar__item">
                                    <Link
                                        to="/moderation"
                                        className={`navbar__link ${location.pathname === '/moderation' ? 'navbar__link--active' : ''}`}
                                    >
                                        Модерация
                                    </Link>
                                </li>
                                <li className="navbar__item">
                                    <Link
                                        to="/suggestions"
                                        className={`navbar__link ${location.pathname === '/suggestions' ? 'navbar__link--active' : ''}`}
                                    >
                                        Предложения
                                    </Link>
                                </li>
                                <li className="navbar__item">
                                    <Link
                                        to="/new-news"
                                        className={`navbar__link ${location.pathname === '/new-news' ? 'navbar__link--active' : ''}`}
                                    >
                                        Новые новости
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                <div className="navbar__actions">
                    {isSupported && (
                        <button
                            className="navbar__button"
                            onClick={toggleNotifications}
                            title={isSubscribed ? 'Отключить уведомления' : 'Включить уведомления'}
                        >
                            <Bell size={20} className={isSubscribed ? 'navbar__icon--active' : ''} />
                        </button>
                    )}

                    <div className="navbar__dropdown">
                        <button className="navbar__button">
                            <Settings size={20} />
                        </button>
                        <div className="navbar__dropdown-content">
                            <button className="navbar__dropdown-item" onClick={handleExport}>
                                <Download size={16} />
                                Экспорт настроек
                            </button>
                            <label className="navbar__dropdown-item">
                                <Upload size={16} />
                                Импорт настроек
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}