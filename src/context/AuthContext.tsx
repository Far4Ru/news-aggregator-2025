import { createContext } from "react"

import type { User } from "../types"

export interface AuthContextType {
    user: User | null
    role: 'user' | 'moderator'
    logout: () => Promise<void>
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)
