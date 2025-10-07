import React from 'react'

export const LoadingSpinner: React.FC = () => (
  <div className="loading-spinner">
    <div className="loading-spinner__animation" />
    <p className="loading-spinner__text">Загрузка...</p>
  </div>
)
