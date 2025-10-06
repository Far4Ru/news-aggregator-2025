import { createContext } from "react"
import type { User } from "../types"

interface AuthContextType {
    user: User | null
    role: 'user' | 'moderator'
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    loginWithToken: (token: string) => void
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)