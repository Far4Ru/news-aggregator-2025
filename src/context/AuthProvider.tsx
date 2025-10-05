import { useState, useEffect } from "react"
import type { User } from "../types"
import { AuthContext } from "./AuthContext"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = (props) => {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<'user' | 'moderator'>('user')
    const children = props.children

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

        // Проверка аутентификации
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

        checkAuth()

        // const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event_, session) => {
        //     if (session?.user) {
        //         setUser({
        //             id: session.user.id,
        //             email: session.user.email,
        //             role: role
        //         })
        //     } else {
        //         setUser(null)
        //     }
        // })

        // return () => subscription.unsubscribe()
    }, [role])

    const login = async (email: string, password: string) => {
        console.log(email, password)
        // const { error } = await supabase.auth.signInWithPassword({
        //     email,
        //     password
        // })
        // if (error) throw error
    }

    const logout = async () => {
        // const { error } = await supabase.auth.signOut()
        // if (error) throw error
        // setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}