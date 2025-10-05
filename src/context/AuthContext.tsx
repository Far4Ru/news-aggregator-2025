import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'
import { supabase } from '@/services/supabase'

interface AuthContextType {
    user: User | null
    role: 'user' | 'moderator'
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<'user' | 'moderator'>('user')

    useEffect(() => {
        // Проверяем наличие токена модератора
        const moderatorKey = import.meta.env.VITE_SUPABASE_MODERATOR_KEY
        if (moderatorKey) {
            setRole('moderator')
            setUser({
                id: 'moderator',
                role: 'moderator'
            })
        }

        // В реальном приложении здесь была бы проверка аутентификации
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    role: role
                })
            }
        }

        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    role: role
                })
            } else {
                setUser(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}