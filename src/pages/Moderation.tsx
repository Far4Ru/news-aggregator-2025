import React from 'react'

export const Moderation: React.FC = () => (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Панель модерации</h1>
                <p className="page__subtitle">Управление контентом и предложениями</p>
            </div>

            <div className="page__content">
                <div className="moderation-dashboard">
                    <div className="moderation-dashboard__grid">
                        <a href="/suggestions" className="moderation-dashboard__card">
                            <h3>Предложения правок</h3>
                            <p>Модерация предложенных изменений новостей</p>
                        </a>

                        <a href="/new-news" className="moderation-dashboard__card">
                            <h3>Новые новости</h3>
                            <p>Проверка новых добавленных новостей</p>
                        </a>

                        <div className="moderation-dashboard__card">
                            <h3>Источники</h3>
                            <p>Управление источниками новостей</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )