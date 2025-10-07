import React from 'react'

export const Footer: React.FC = () => (
        <footer className="footer">
            <div className="footer__container">
                <div className="footer__content">
                    <p className="footer__text">
                        © 2025 Новостной агрегатор. Все права защищены.
                    </p>
                    <div className="footer__links">
                        <a href="/" className="footer__link">О проекте</a>
                        <a href="/" className="footer__link">Помощь</a>
                        <a href="/" className="footer__link">Контакты</a>
                    </div>
                </div>
            </div>
        </footer>
    )