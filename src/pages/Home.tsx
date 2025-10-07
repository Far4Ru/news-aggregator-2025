import { Newspaper, Rss, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => (
  <div className='home'>
    <section className='home__hero'>
      <div className='home__hero-content'>
        <h1 className='home__title'>Агрегатор новостей</h1>
        <p className='home__subtitle'>
          Все важные новости из проверенных источников в одном месте
        </p>
        <div className='home__actions'>
          <Link to='/news' className='button button--primary home__button'>
            Читать новости
          </Link>
          <Link to='/sources' className='button button--secondary home__button'>
            Управлять источниками
          </Link>
        </div>
      </div>
    </section>

    <section className='home__features'>
      <div className='home__features-grid'>
        <div className='home__feature'>
          <Newspaper className='home__feature-icon' />
          <h3 className='home__feature-title'>Актуальные новости</h3>
          <p className='home__feature-text'>
            Свежие новости из различных источников с автоматическим обновлением
          </p>
        </div>

        <div className='home__feature'>
          <Rss className='home__feature-icon' />
          <h3 className='home__feature-title'>Персональные источники</h3>
          <p className='home__feature-text'>
            Выбирайте только те источники, которые вам интересны
          </p>
        </div>

        <div className='home__feature'>
          <Users className='home__feature-icon' />
          <h3 className='home__feature-title'>Сообщество</h3>
          <p className='home__feature-text'>
            Предлагайте правки и улучшайте качество контента вместе с другими
          </p>
        </div>
      </div>
    </section>
  </div>
);
