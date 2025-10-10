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
      users: {
        Row: {
          id: string
          user_status: 'new' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_status?: 'new' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_status?: 'new' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      ip_addresses: {
        Row: {
          id: string
          ip: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ip: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ip?: string
          user_id?: string | null
          created_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          name: string
          image_url: string | null
          description: string | null
          url: string
          parsing_url: string | null
          type: string
          status: 'pending' | 'approved' | 'rejected'
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          description?: string | null
          url: string
          parsing_url?: string | null
          type?: string
          status?: 'pending' | 'approved' | 'rejected'
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          description?: string | null
          url?: string
          parsing_url?: string | null
          type?: string
          status?: 'pending' | 'approved' | 'rejected'
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      short_contents: {
        Row: {
          id: string
          content_text: string
          created_at: string
        }
        Insert: {
          id?: string
          content_text: string
          created_at?: string
        }
        Update: {
          id?: string
          content_text?: string
          created_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          original_content: string
          source_id: string
          short_content_id: string | null
          published_at: string
          url: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          original_content: string
          source_id: string
          short_content_id?: string | null
          published_at: string
          url: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          original_content?: string
          source_id?: string
          short_content_id?: string | null
          published_at?: string
          url?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          tag_name: string
          created_at: string
        }
        Insert: {
          id?: string
          tag_name: string
          created_at?: string
        }
        Update: {
          id?: string
          tag_name?: string
          created_at?: string
        }
      }
      news_tags: {
        Row: {
          id: string
          tag_id: string
          news_id: string
          user_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          tag_id: string
          news_id: string
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          tag_id?: string
          news_id?: string
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      short_content_versions: {
        Row: {
          id: string
          short_content_id: string
          user_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          short_content_id: string
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          short_content_id?: string
          user_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          comment?: string | null
          created_at?: string
        }
      }
      news_ratings: {
        Row: {
          id: string
          news_id: string
          user_id: string | null
          rating: -1 | 1
          created_at: string
        }
        Insert: {
          id?: string
          news_id: string
          user_id?: string | null
          rating: -1 | 1
          created_at?: string
        }
        Update: {
          id?: string
          news_id?: string
          user_id?: string | null
          rating?: -1 | 1
          created_at?: string
        }
      }
      news_suggestions: {
        Row: {
          id: string
          news_id: string
          original_content: string
          suggested_content: string
          user_id: string | null
          user_agent: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          news_id: string
          original_content: string
          suggested_content: string
          user_id?: string | null
          user_agent?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          news_id?: string
          original_content?: string
          suggested_content?: string
          user_id?: string | null
          user_agent?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_news_rating: {
        Args: { news_id: string }
        Returns: number
      }
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
