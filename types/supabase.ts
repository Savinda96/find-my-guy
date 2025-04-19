// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cvs: {
        Row: {
          id: string
          user_id: string
          name: string
          file_path: string
          public_url: string
          processed: boolean
          processed_at: string | null
          tags: string[] | null
          created_at: string
          file_size: number
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          file_path: string
          public_url: string
          processed?: boolean
          processed_at?: string | null
          tags?: string[] | null
          created_at?: string
          file_size: number
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          file_path?: string
          public_url?: string
          processed?: boolean
          processed_at?: string | null
          tags?: string[] | null
          created_at?: string
          file_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "cvs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          company: string | null
          job_title: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          company?: string | null
          job_title?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          company?: string | null
          job_title?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cv_profiles: {
        Row: {
          id: string
          cv_id: string
          full_name: string | null
          email: string | null
          phone: string | null
          title: string | null
          location: string | null
          summary: string | null
          highlights: string[] | null
          years_experience: number | null
          linkedin: string | null
          skills: string[] | null
          experience: Json[] | null
          education: Json[] | null
          projects: Json[] | null
          tech_stack: Json | null
          urls: Json[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          cv_id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          title?: string | null
          location?: string | null
          summary?: string | null
          highlights?: string[] | null
          years_experience?: number | null
          linkedin?: string | null
          skills?: string[] | null
          experience?: Json[] | null
          education?: Json[] | null
          projects?: Json[] | null
          tech_stack?: Json | null
          urls?: Json[] | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          cv_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          title?: string | null
          location?: string | null
          summary?: string | null
          highlights?: string[] | null
          years_experience?: number | null
          linkedin?: string | null
          skills?: string[] | null
          experience?: Json[] | null
          education?: Json[] | null
          projects?: Json[] | null
          tech_stack?: Json | null
          urls?: Json[] | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_profiles_cv_id_fkey"
            columns: ["cv_id"]
            referencedRelation: "cvs"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}