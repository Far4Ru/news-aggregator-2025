import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            return initialValue
        }
    })

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }

    return [storedValue, setValue] as const
}

export const useAppSettings = () => {
    const [settings, setSettings] = useLocalStorage('app-settings', {
        selectedSources: [],
        sortBy: 'date' as 'date' | 'rating',
        filters: {
            sources: [],
            sourceTypes: [],
            tags: [],
            searchQuery: ''
        },
        notificationsEnabled: true,
        userRole: 'user' as 'user' | 'moderator'
    })

    const exportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        return URL.createObjectURL(dataBlob)
    }

    const importSettings = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const importedSettings = JSON.parse(e.target?.result as string)
                setSettings(importedSettings)
            } catch (error) {
                console.error('Error importing settings:', error)
            }
        }
        reader.readAsText(file)
    }

    return {
        settings,
        setSettings,
        exportSettings,
        importSettings
    }
}