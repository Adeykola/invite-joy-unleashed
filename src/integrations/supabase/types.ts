export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      communication_logs: {
        Row: {
          content: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          event_id: string | null
          id: string
          message_type: string
          metadata: Json | null
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
          subject: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_id?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
          category: string | null
          created_at: string | null
          dietary_restrictions: string | null
          email: string
          event_id: string
          id: string
          invite_sent: boolean | null
          invited_at: string | null
          is_vip: boolean | null
          name: string
          notes: string | null
          phone_number: string | null
          plus_one_allowed: boolean | null
          plus_one_name: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          email: string
          event_id: string
          id?: string
          invite_sent?: boolean | null
          invited_at?: string | null
          is_vip?: boolean | null
          name: string
          notes?: string | null
          phone_number?: string | null
          plus_one_allowed?: boolean | null
          plus_one_name?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          dietary_restrictions?: string | null
          email?: string
          event_id?: string
          id?: string
          invite_sent?: boolean | null
          invited_at?: string | null
          is_vip?: boolean | null
          name?: string
          notes?: string | null
          phone_number?: string | null
          plus_one_allowed?: boolean | null
          plus_one_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_performance"
            referencedColumns: ["id"]
          },
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
          completion_checklist: Json | null
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
          status: string | null
          tags: string[] | null
          template_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          banner_image?: string | null
          capacity?: number | null
          completion_checklist?: Json | null
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
          status?: string | null
          tags?: string[] | null
          template_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          banner_image?: string | null
          capacity?: number | null
          completion_checklist?: Json | null
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
          status?: string | null
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
            referencedRelation: "event_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          event_id: string
          id: string
          metadata: Json | null
          payment_method: string | null
          rsvp_id: string | null
          status: string
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          event_id: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          rsvp_id?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          event_id?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          rsvp_id?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "rsvps"
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
            referencedRelation: "event_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          rsvp_id: string
          seat_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          rsvp_id: string
          seat_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          rsvp_id?: string
          seat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_assignments_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: true
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_assignments_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: true
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      seating_charts: {
        Row: {
          created_at: string
          event_id: string
          id: string
          layout_data: Json
          name: string
          updated_at: string
          venue_height: number | null
          venue_width: number | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          layout_data?: Json
          name?: string
          updated_at?: string
          venue_height?: number | null
          venue_width?: number | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          layout_data?: Json
          name?: string
          updated_at?: string
          venue_height?: number | null
          venue_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seating_charts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_performance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seating_charts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          position_x: number
          position_y: number
          seat_number: string
          seat_type: string
          seating_chart_id: string
          table_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          position_x: number
          position_y: number
          seat_number: string
          seat_type?: string
          seating_chart_id: string
          table_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          position_x?: number
          position_y?: number
          seat_number?: string
          seat_type?: string
          seating_chart_id?: string
          table_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seats_seating_chart_id_fkey"
            columns: ["seating_chart_id"]
            isOneToOne: false
            referencedRelation: "seating_charts"
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
            referencedRelation: "event_performance"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "event_performance"
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
      event_performance: {
        Row: {
          capacity: number | null
          checked_in_count: number | null
          confirmed_rsvps: number | null
          date: string | null
          declined_rsvps: number | null
          fill_rate: number | null
          id: string | null
          pending_rsvps: number | null
          response_rate: number | null
          title: string | null
          total_rsvps: number | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          active_hosts: number | null
          past_events: number | null
          total_checked_in: number | null
          total_confirmed_rsvps: number | null
          total_events: number | null
          total_users: number | null
          upcoming_events: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_rsvp_checkin_columns: { Args: never; Returns: boolean }
      bulk_check_in: {
        Args: { p_event_id: string; p_ticket_codes: string[] }
        Returns: {
          guest_name: string
          message: string
          status: string
          ticket_code: string
        }[]
      }
      bulk_invite_guests: {
        Args: { p_event_id: string; p_guest_emails: string[] }
        Returns: {
          email: string
          message: string
          status: string
        }[]
      }
      create_admin_user: {
        Args: { admin_email: string; admin_password: string }
        Returns: undefined
      }
      generate_ticket_code: { Args: never; Returns: string }
      get_available_seats: {
        Args: { p_event_id: string }
        Returns: {
          seat_id: string
          seat_number: string
          seat_type: string
          table_number: string
        }[]
      }
      get_column_info: {
        Args: { target_column: string; target_table: string }
        Returns: {
          column_name: string
          data_type: string
        }[]
      }
      get_event_check_in_stats: {
        Args: { p_event_id: string }
        Returns: {
          check_in_rate: number
          checked_in_count: number
          confirmed_rsvps: number
          total_rsvps: number
        }[]
      }
      get_event_guest_stats: {
        Args: { p_event_id: string }
        Returns: {
          checked_in_guests: number
          invited_guests: number
          pending_invites: number
          rsvp_confirmed: number
          rsvp_declined: number
          rsvp_pending: number
          total_guests: number
          vip_guests: number
        }[]
      }
      get_event_guests: {
        Args: { p_event_id: string }
        Returns: {
          email: string
          id: string
          invite_sent: boolean
          invited_at: string
          name: string
        }[]
      }
      get_event_guests_detailed: {
        Args: { p_event_id: string }
        Returns: {
          category: string
          checked_in: boolean
          dietary_restrictions: string
          email: string
          id: string
          invite_sent: boolean
          invited_at: string
          is_vip: boolean
          name: string
          notes: string
          payment_status: string
          phone_number: string
          plus_one_allowed: boolean
          plus_one_name: string
          rsvp_date: string
          rsvp_status: string
          ticket_code: string
        }[]
      }
      get_seating_chart_details: {
        Args: { p_event_id: string }
        Returns: {
          assigned_rsvp_id: string
          chart_id: string
          chart_name: string
          guest_email: string
          guest_name: string
          layout_data: Json
          position_x: number
          position_y: number
          seat_id: string
          seat_notes: string
          seat_number: string
          seat_type: string
          table_number: string
          venue_height: number
          venue_width: number
        }[]
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: undefined
      }
      record_system_metric: {
        Args: {
          p_metric_name: string
          p_metric_unit?: string
          p_metric_value: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
