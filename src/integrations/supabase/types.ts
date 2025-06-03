export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          phone_number: string
          read_at: string | null
          recipient_data: Json
          retry_count: number
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          broadcast_id: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          phone_number: string
          read_at?: string | null
          recipient_data: Json
          retry_count?: number
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          broadcast_id?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          phone_number?: string
          read_at?: string | null
          recipient_data?: Json
          retry_count?: number
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_guests: {
        Row: {
          created_at: string | null
          email: string
          event_id: string
          id: string
          invite_sent: boolean | null
          invited_at: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          invite_sent?: boolean | null
          invited_at?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          invite_sent?: boolean | null
          invited_at?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_image: string | null
          capacity: number | null
          created_at: string | null
          date: string
          description: string | null
          host_id: string | null
          id: string
          location: string
          meta: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_image?: string | null
          capacity?: number | null
          created_at?: string | null
          date: string
          description?: string | null
          host_id?: string | null
          id?: string
          location: string
          meta?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_image?: string | null
          capacity?: number | null
          created_at?: string | null
          date?: string
          description?: string | null
          host_id?: string | null
          id?: string
          location?: string
          meta?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          check_in_time: string | null
          checked_in: boolean | null
          comments: string | null
          created_at: string | null
          event_id: string | null
          guest_email: string
          guest_name: string
          id: string
          response_status: string
        }
        Insert: {
          check_in_time?: string | null
          checked_in?: boolean | null
          comments?: string | null
          created_at?: string | null
          event_id?: string | null
          guest_email: string
          guest_name: string
          id?: string
          response_status: string
        }
        Update: {
          check_in_time?: string | null
          checked_in?: boolean | null
          comments?: string | null
          created_at?: string | null
          event_id?: string | null
          guest_email?: string
          guest_name?: string
          id?: string
          response_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_broadcasts: {
        Row: {
          created_at: string
          delivered_count: number | null
          event_id: string | null
          failed_count: number | null
          id: string
          name: string
          read_count: number | null
          scheduled_for: string | null
          sent_count: number | null
          status: string
          template_id: string
          total_recipients: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_count?: number | null
          event_id?: string | null
          failed_count?: number | null
          id?: string
          name: string
          read_count?: number | null
          scheduled_for?: string | null
          sent_count?: number | null
          status?: string
          template_id: string
          total_recipients?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_count?: number | null
          event_id?: string | null
          failed_count?: number | null
          id?: string
          name?: string
          read_count?: number | null
          scheduled_for?: string | null
          sent_count?: number | null
          status?: string
          template_id?: string
          total_recipients?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_broadcasts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_broadcasts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          connection_attempts: number
          created_at: string
          display_name: string | null
          encrypted_session_key: string
          id: string
          last_connected_at: string | null
          phone_number: string | null
          session_data: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_attempts?: number
          created_at?: string
          display_name?: string | null
          encrypted_session_key: string
          id?: string
          last_connected_at?: string | null
          phone_number?: string | null
          session_data: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_attempts?: number
          created_at?: string
          display_name?: string | null
          encrypted_session_key?: string
          id?: string
          last_connected_at?: string | null
          phone_number?: string | null
          session_data?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_rsvp_checkin_columns: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_column_info: {
        Args: { target_table: string; target_column: string }
        Returns: {
          column_name: string
          data_type: string
        }[]
      }
      get_event_guests: {
        Args: { p_event_id: string }
        Returns: {
          id: string
          name: string
          email: string
          invited_at: string
          invite_sent: boolean
        }[]
      }
    }
    Enums: {
      user_role: "admin" | "host" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "host", "user"],
    },
  },
} as const
