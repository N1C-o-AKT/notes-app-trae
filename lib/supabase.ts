import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Database types
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          color: string
          parent_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          parent_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          parent_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          tags: string[]
          category_id: string | null
          is_favorite: boolean
          is_archived: boolean
          is_protected: boolean
          password_hash: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          content?: string
          tags?: string[]
          category_id?: string | null
          is_favorite?: boolean
          is_archived?: boolean
          is_protected?: boolean
          password_hash?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          tags?: string[]
          category_id?: string | null
          is_favorite?: boolean
          is_archived?: boolean
          is_protected?: boolean
          password_hash?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          note_id: string
          name: string
          type: string
          size: number
          url: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          name: string
          type: string
          size: number
          url: string
          user_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          name?: string
          type?: string
          size?: number
          url?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Types pour la base de données (utilisant les types générés)
export type DatabaseCategory = Database['public']['Tables']['categories']['Row']
export type DatabaseCategoryInsert = Database['public']['Tables']['categories']['Insert']
export type DatabaseCategoryUpdate = Database['public']['Tables']['categories']['Update']

export type DatabaseNote = Database['public']['Tables']['notes']['Row']
export type DatabaseNoteInsert = Database['public']['Tables']['notes']['Insert']
export type DatabaseNoteUpdate = Database['public']['Tables']['notes']['Update']

export type DatabaseAttachment = Database['public']['Tables']['attachments']['Row']
export type DatabaseAttachmentInsert = Database['public']['Tables']['attachments']['Insert']
export type DatabaseAttachmentUpdate = Database['public']['Tables']['attachments']['Update']

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']