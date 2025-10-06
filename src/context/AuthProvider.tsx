import { useState, useEffect } from "react"
import type { User } from "../types"
import { AuthContext } from "./AuthContext"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<'user' | 'moderator'>('user')
    const [isLoading, setIsLoading] = useState(true)
    const children = props.children

    // Функция для проверки валидности MD5 токена
    const isValidMd5Token = (token: string): boolean => {
        return /^[a-f0-9]{32}$/i.test(token)
    }

    // Функция для проверки токена авторизации
    const checkAuthToken = (token: string): boolean => {
        // Здесь можно добавить логику проверки токена
        // Например, сравнение с ожидаемыми токенами из env переменных
        const expectedTokens = import.meta.env.VITE_AUTH_TOKENS?.split(',') || []
        return expectedTokens.includes(token)
    }

    // Функция для извлечения токена из URL
    const getTokenFromUrl = (): string | null => {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get('token')
    }

    // Функция для обработки авторизации по токену
    const handleTokenAuth = (token: string) => {
        if (isValidMd5Token(token) && checkAuthToken(token)) {
            // Токен валиден, устанавливаем пользователя
            setUser({
                id: `token_user_${token.substring(0, 8)}`,
                role: 'user'
            })
            setRole('user')

            // Опционально: сохраняем токен в localStorage для автоматического входа при перезагрузке
            localStorage.setItem('auth_token', token)

            // Опционально: очищаем token из URL для безопасности
            const url = new URL(window.location.href)
            url.searchParams.delete('token')
            window.history.replaceState({}, '', url.toString())
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true)

            // 1. Проверяем токен из URL (приоритет)
            const urlToken = getTokenFromUrl()
            if (urlToken) {
                handleTokenAuth(urlToken)
                setIsLoading(false)
                return
            }

            // 2. Проверяем сохраненный токен в localStorage
            const savedToken = localStorage.getItem('auth_token')
            if (savedToken && isValidMd5Token(savedToken) && checkAuthToken(savedToken)) {
                setUser({
                    id: `token_user_${savedToken.substring(0, 8)}`,
                    role: 'user'
                })
                setRole('user')
                setIsLoading(false)
                return
            }

            // 3. Проверяем наличие токена модератора из env
            const moderatorKey = import.meta.env.VITE_SUPABASE_MODERATOR_KEY
            if (moderatorKey) {
                setRole('moderator')
                setUser({
                    id: 'moderator',
                    role: 'moderator'
                })
            }

            // 4. Стандартная проверка аутентификации (ваш существующий код)
            const checkAuth = async () => {
                // const { data: { session } } = await supabase.auth.getSession()
                // if (session?.user) {
                //     setUser({
                //         id: session.user.id,
                //         email: session.user.email,
                //         role: role
                //     })
                // }
            }

            await checkAuth()
            setIsLoading(false)
        }

        initializeAuth()

        // Слушатель изменений URL для обработки токена при навигации
        const handleUrlChange = () => {
            const urlToken = getTokenFromUrl()
            if (urlToken && (!user || user.id.startsWith('token_user_'))) {
                handleTokenAuth(urlToken)
            }
        }

        window.addEventListener('popstate', handleUrlChange)

        return () => {
            window.removeEventListener('popstate', handleUrlChange)
            // return () => subscription.unsubscribe() // раскомментируйте когда будете использовать supabase
        }
    }, [role, user])

    const login = async (email: string, password: string) => {
        console.log(email, password)
        // const { error } = await supabase.auth.signInWithPassword({
        //     email,
        //     password
        // })
        // if (error) throw error
    }

    const logout = async () => {
        // Очищаем токен из localStorage при выходе
        localStorage.removeItem('auth_token')

        // const { error } = await supabase.auth.signOut()
        // if (error) throw error
        setUser(null)
        setRole('user')
    }

    // Функция для ручной авторизации по токену
    const loginWithToken = (token: string) => {
        handleTokenAuth(token)
    }

    return (
        <AuthContext.Provider value={{
            user,
            role,
            login,
            logout,
            loginWithToken,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}