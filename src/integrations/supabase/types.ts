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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "fk_broadcast_recipients_broadcast_id"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_campaigns: {
        Row: {
          content: string
          created_at: string
          failed_sends: number | null
          id: string
          name: string
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string | null
          successful_sends: number | null
          target_audience: Json | null
          total_recipients: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          failed_sends?: number | null
          id?: string
          name: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          successful_sends?: number | null
          target_audience?: Json | null
          total_recipients?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          failed_sends?: number | null
          id?: string
          name?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          successful_sends?: number | null
          target_audience?: Json | null
          total_recipients?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          template_type: string | null
          updated_at: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          template_type?: string | null
          updated_at?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          template_type?: string | null
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
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
          phone_number: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          invite_sent?: boolean | null
          invited_at?: string | null
          name: string
          phone_number?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          invite_sent?: boolean | null
          invited_at?: string | null
          name?: string
          phone_number?: string | null
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
      event_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          event_data: Json
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          event_data: Json
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          event_data?: Json
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          banner_image: string | null
          capacity: number | null
          created_at: string | null
          custom_fields: Json | null
          date: string
          description: string | null
          event_type: string | null
          host_id: string | null
          id: string
          is_private: boolean | null
          is_template: boolean | null
          location: string
          max_guests_per_rsvp: number | null
          meta: Json | null
          registration_deadline: string | null
          require_approval: boolean | null
          tags: string[] | null
          template_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_image?: string | null
          capacity?: number | null
          created_at?: string | null
          custom_fields?: Json | null
          date: string
          description?: string | null
          event_type?: string | null
          host_id?: string | null
          id?: string
          is_private?: boolean | null
          is_template?: boolean | null
          location: string
          max_guests_per_rsvp?: number | null
          meta?: Json | null
          registration_deadline?: string | null
          require_approval?: boolean | null
          tags?: string[] | null
          template_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_image?: string | null
          capacity?: number | null
          created_at?: string | null
          custom_fields?: Json | null
          date?: string
          description?: string | null
          event_type?: string | null
          host_id?: string | null
          id?: string
          is_private?: boolean | null
          is_template?: boolean | null
          location?: string
          max_guests_per_rsvp?: number | null
          meta?: Json | null
          registration_deadline?: string | null
          require_approval?: boolean | null
          tags?: string[] | null
          template_name?: string | null
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
          media_id: string | null
          template_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_id?: string | null
          template_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_id?: string | null
          template_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_media_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          event_id: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          amount_paid: number | null
          check_in_time: string | null
          checked_in: boolean | null
          comments: string | null
          created_at: string | null
          custom_responses: Json | null
          dietary_restrictions: string | null
          event_id: string | null
          guest_email: string
          guest_name: string
          id: string
          meal_choice: string | null
          needs_accommodation: boolean | null
          payment_status: string | null
          phone_number: string | null
          plus_one_count: number | null
          qr_code_data: string | null
          response_status: string
          ticket_code: string | null
        }
        Insert: {
          amount_paid?: number | null
          check_in_time?: string | null
          checked_in?: boolean | null
          comments?: string | null
          created_at?: string | null
          custom_responses?: Json | null
          dietary_restrictions?: string | null
          event_id?: string | null
          guest_email: string
          guest_name: string
          id?: string
          meal_choice?: string | null
          needs_accommodation?: boolean | null
          payment_status?: string | null
          phone_number?: string | null
          plus_one_count?: number | null
          qr_code_data?: string | null
          response_status: string
          ticket_code?: string | null
        }
        Update: {
          amount_paid?: number | null
          check_in_time?: string | null
          checked_in?: boolean | null
          comments?: string | null
          created_at?: string | null
          custom_responses?: Json | null
          dietary_restrictions?: string | null
          event_id?: string | null
          guest_email?: string
          guest_name?: string
          id?: string
          meal_choice?: string | null
          needs_accommodation?: boolean | null
          payment_status?: string | null
          phone_number?: string | null
          plus_one_count?: number | null
          qr_code_data?: string | null
          response_status?: string
          ticket_code?: string | null
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
      system_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string
        }
        Relationships: []
      }
      whatsapp_broadcasts: {
        Row: {
          created_at: string
          delivered_count: number | null
          event_id: string | null
          failed_count: number | null
          id: string
          media_id: string | null
          message_type: string | null
          name: string
          read_count: number | null
          scheduled_for: string | null
          sent_count: number | null
          status: string
          template_id: string | null
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
          media_id?: string | null
          message_type?: string | null
          name: string
          read_count?: number | null
          scheduled_for?: string | null
          sent_count?: number | null
          status?: string
          template_id?: string | null
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
          media_id?: string | null
          message_type?: string | null
          name?: string
          read_count?: number | null
          scheduled_for?: string | null
          sent_count?: number | null
          status?: string
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_whatsapp_broadcasts_event_id"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_whatsapp_broadcasts_template_id"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_broadcasts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_broadcasts_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_media_uploads"
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
      whatsapp_contacts: {
        Row: {
          created_at: string
          custom_fields: Json | null
          email: string | null
          id: string
          is_active: boolean
          last_message_at: string | null
          name: string
          phone_number: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          id?: string
          is_active?: boolean
          last_message_at?: string | null
          name: string
          phone_number: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          id?: string
          is_active?: boolean
          last_message_at?: string | null
          name?: string
          phone_number?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_delivery_status: {
        Row: {
          created_at: string
          id: string
          message_queue_id: string
          phone_number: string
          status: string
          timestamp: string
          webhook_data: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_queue_id: string
          phone_number: string
          status: string
          timestamp?: string
          webhook_data?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          message_queue_id?: string
          phone_number?: string
          status?: string
          timestamp?: string
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_delivery_status_message_queue_id_fkey"
            columns: ["message_queue_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_message_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_media_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          media_type: string
          mime_type: string
          updated_at: string
          upload_status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          media_type: string
          mime_type: string
          updated_at?: string
          upload_status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          media_type?: string
          mime_type?: string
          updated_at?: string
          upload_status?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_message_queue: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          id: string
          max_attempts: number
          media_id: string | null
          message_content: string
          personalization_data: Json | null
          recipient_phone: string
          scheduled_for: string | null
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          media_id?: string | null
          message_content: string
          personalization_data?: Json | null
          recipient_phone: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          media_id?: string | null
          message_content?: string
          personalization_data?: Json | null
          recipient_phone?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_message_queue_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_media_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          capabilities: string[] | null
          connection_attempts: number
          connection_type: string | null
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
          capabilities?: string[] | null
          connection_attempts?: number
          connection_type?: string | null
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
          capabilities?: string[] | null
          connection_attempts?: number
          connection_type?: string | null
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
      create_admin_user: {
        Args: { admin_email: string; admin_password: string }
        Returns: undefined
      }
      generate_ticket_code: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      log_admin_action: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_details?: Json
        }
        Returns: undefined
      }
      record_system_metric: {
        Args: {
          p_metric_name: string
          p_metric_value: number
          p_metric_unit?: string
        }
        Returns: undefined
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
