import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className='footer'>
    <div className='footer__container'>
      <div className='footer__content'>
        <p className='footer__text'>
          © 2025 Новостной агрегатор. Все права защищены.
        </p>
        <div className='footer__links'>
          <Link to='/about' className='footer__link'>О проекте</Link>
          <Link to='/about#help' className='footer__link'>Помощь</Link>
          <Link to='/about#contacts' className='footer__link'>Контакты</Link>
        </div>
      </div>
    </div>
  </footer>
);
