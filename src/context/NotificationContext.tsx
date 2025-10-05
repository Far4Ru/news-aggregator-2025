import React, { createContext, useContext, ReactNode } from 'react'

interface NotificationContextType {
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // В реальном приложении здесь была бы логика показа уведомлений
        console.log(`[${type.toUpperCase()}] ${message}`)

        // Простая реализация уведомления
        if (typeof window !== 'undefined') {
            alert(`${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'} ${message}`)
        }
    }

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}