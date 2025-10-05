import React from 'react'

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="loading-spinner">
            <div className="loading-spinner__animation"></div>
            <p className="loading-spinner__text">Загрузка...</p>
        </div>
    )
}