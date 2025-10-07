export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            sources: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    url: string
                    type: string
                    activity_data: number[]
                    status: string
                    added_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    url: string
                    type: string
                    activity_data?: number[]
                    status?: string
                    added_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    url?: string
                    type?: string
                    activity_data?: number[]
                    status?: string
                    added_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            news: {
                Row: {
                    id: string
                    title: string
                    content: string
                    short_content: string
                    source_id: string
                    source_type: string
                    published_at: string
                    rating: number
                    tags: string[]
                    url: string | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    short_content: string
                    source_id: string
                    source_type: string
                    published_at: string
                    rating?: number
                    tags?: string[]
                    url?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    short_content?: string
                    source_id?: string
                    source_type?: string
                    published_at?: string
                    rating?: number
                    tags?: string[]
                    url?: string | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            news_suggestions: {
                Row: {
                    id: string
                    news_id: string
                    original_content: string
                    suggested_content: string
                    suggested_by_ip: string
                    user_agent: string | null
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    news_id: string
                    original_content: string
                    suggested_content: string
                    suggested_by_ip: string
                    user_agent?: string | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    news_id?: string
                    original_content?: string
                    suggested_content?: string
                    suggested_by_ip?: string
                    user_agent?: string | null
                    status?: string
                    created_at?: string
                }
            }
        }
    }
}
