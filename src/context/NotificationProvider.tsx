import type { ReactNode } from "react"

import { NotificationContext } from "./NotificationContext"

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
