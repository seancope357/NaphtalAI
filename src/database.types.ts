export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: { 
          id: number
          feedback: string
          created_at: string
        }
        Insert: { 
          id?: number
          feedback: string
          created_at?: string
        }
        Update: { 
          id?: number
          feedback?: string
          created_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
