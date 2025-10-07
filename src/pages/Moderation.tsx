import React from 'react'
import { Link } from 'react-router-dom'

export const Moderation: React.FC = () => (
  <div className="page">
    <div className="page__header">
      <h1 className="page__title">Панель модерации</h1>
      <p className="page__subtitle">Управление контентом и предложениями</p>
    </div>

    <div className="page__content-block">
      <div className="moderation-dashboard">
        <div className="moderation-dashboard__grid">
          <Link
            to="/suggestions"
            className="moderation-dashboard__card"
          >
            <h3>Предложения правок</h3>
            <p>Модерация предложенных изменений новостей</p>
          </Link>

          <Link
            to="/new-news"
            className="moderation-dashboard__card"
          >
            <h3>Новые новости</h3>
            <p>Проверка новых добавленных новостей</p>
          </Link>

          <Link
            to="/sources"
            className="moderation-dashboard__card"
          >
            <h3>Источники</h3>
            <p>Управление источниками новостей</p>
          </Link>
        </div>
      </div>
    </div>
  </div>
)
