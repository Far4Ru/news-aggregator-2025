import { useState, useEffect, useCallback } from "react"

import type { User } from "../types"

import { AuthContext } from "./AuthContext"


function isValidMd5Token(token: string): boolean {
    return /^[a-f0-9]{32}$/i.test(token)
}

function checkAuthToken (token: string): boolean {
    const expectedTokens = import.meta.env.VITE_AUTH_TOKENS?.split(',') || []
    return expectedTokens.includes(token)
}

function getTokenFromUrl (): string | null {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('token')
}

/**
 * Авторизация модератора:
 * /?token=<MD5-hash>
 * - сохранение auth_token в local
 * - сохранение ip в state
 * Авторизация пользователя:
 * - сохранение ip в state
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<'user' | 'moderator'>('user')
    const [isLoading, setIsLoading] = useState(true)
    const children = props.children

    const handleTokenAuth = (token: string) => {
        if (isValidMd5Token(token) && checkAuthToken(token)) {
            setUser({
                id: `token_user_${token.substring(0, 8)}`,
                role: 'user'
            })
            setRole('user')

            localStorage.setItem('auth_token', token)

            const url = new URL(window.location.href)
            url.searchParams.delete('token')
            window.history.replaceState({}, '', url.toString())
        }
    }

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
    
    const initializeAuth = useCallback(async () => {
        setIsLoading(true)

        const urlToken = getTokenFromUrl()
        if (urlToken) {
            handleTokenAuth(urlToken)
            setIsLoading(false)
            return
        }

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

        const moderatorKey = import.meta.env.VITE_SUPABASE_MODERATOR_KEY
        if (moderatorKey) {
            setRole('moderator')
            setUser({
                id: 'moderator',
                role: 'moderator'
            })
        }

        await checkAuth()
        setIsLoading(false)
    }, [])

    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    const logout = async () => {
        localStorage.removeItem('auth_token')
        // const { error } = await supabase.auth.signOut()
        // if (error) throw error
        setUser(null)
        setRole('user')
    }

    return (
        <AuthContext.Provider value={{
            user,
            role,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}