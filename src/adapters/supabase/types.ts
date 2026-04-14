import type { SupabaseClient } from '@supabase/supabase-js'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      labels: {
        Row: {
          id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          role: 'owner' | 'admin' | 'pending'
          full_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          role?: 'owner' | 'admin' | 'pending'
          full_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'owner' | 'admin' | 'pending'
          full_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      work_items: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'active' | 'archived'
          is_priority: boolean
          label_ids: string[]
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'active' | 'archived'
          is_priority?: boolean
          label_ids?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'active' | 'archived'
          is_priority?: boolean
          label_ids?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'work_items_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string | null
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals['public']

export type Tables<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer Row
    }
    ? Row
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][PublicTableNameOrOptions] extends { Row: infer Row }
      ? Row
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer Insert
    }
    ? Insert
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][PublicTableNameOrOptions] extends { Insert: infer Insert }
      ? Insert
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer Update
    }
    ? Update
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][PublicTableNameOrOptions] extends { Update: infer Update }
      ? Update
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type SupabaseServerClient = SupabaseClient<Database>
