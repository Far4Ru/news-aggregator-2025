import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseModeratorKey = import.meta.env.VITE_SUPABASE_MODERATOR_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
export const supabaseModerator = createClient<Database>(supabaseUrl, supabaseModeratorKey)