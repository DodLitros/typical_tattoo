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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointment: {
        Row: {
          "24h_reminder": boolean | null
          "2h_reminder": boolean | null
          appointment_date: string | null
          cancelled_at: string | null
          client_id: string
          client_notes: string | null
          confirmed_at: string | null
          duration_minutes: number | null
          id: string
          internal_notes: string | null
          quote_request_id: string
          sent_at: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["appointment status"] | null
        }
        Insert: {
          "24h_reminder"?: boolean | null
          "2h_reminder"?: boolean | null
          appointment_date?: string | null
          cancelled_at?: string | null
          client_id: string
          client_notes?: string | null
          confirmed_at?: string | null
          duration_minutes?: number | null
          id?: string
          internal_notes?: string | null
          quote_request_id: string
          sent_at?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment status"] | null
        }
        Update: {
          "24h_reminder"?: boolean | null
          "2h_reminder"?: boolean | null
          appointment_date?: string | null
          cancelled_at?: string | null
          client_id?: string
          client_notes?: string | null
          confirmed_at?: string | null
          duration_minutes?: number | null
          id?: string
          internal_notes?: string | null
          quote_request_id?: string
          sent_at?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_request"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_block: {
        Row: {
          block_date: string
          block_type: string | null
          created_at: string | null
          end_time: string | null
          id: string
          is_recurring: boolean | null
          reason: string | null
          recurrence_rule: string | null
          start_time: string | null
        }
        Insert: {
          block_date: string
          block_type?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          reason?: string | null
          recurrence_rule?: string | null
          start_time?: string | null
        }
        Update: {
          block_date?: string
          block_type?: string | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          reason?: string | null
          recurrence_rule?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      client: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      design: {
        Row: {
          appointment_id: string | null
          id: number
          quote_request_id: string | null
          sent_to_client_at: string | null
          status: Database["public"]["Enums"]["design status"] | null
          storage_url: string | null
          thumbnail_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          id?: number
          quote_request_id?: string | null
          sent_to_client_at?: string | null
          status?: Database["public"]["Enums"]["design status"] | null
          storage_url?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          id?: number
          quote_request_id?: string | null
          sent_to_client_at?: string | null
          status?: Database["public"]["Enums"]["design status"] | null
          storage_url?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string | null
        }
Relationships: [
          {
            foreignKeyName: "design_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_request"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_portfolio_post_id_fkey"
            columns: ["portfolio_post_id"]
            isOneToOne: false
            referencedRelation: "portfolio_post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      needles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          size: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          size?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          size?: string | null
          type?: string | null
        }
        Relationships: []
      }
      appointment_needle: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          needle_id: string
          notes: string | null
          quantity_used: number | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          needle_id: string
          notes?: string | null
          quantity_used?: number | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          needle_id?: string
          notes?: string | null
          quantity_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_needle_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_needle_needle_id_fkey"
            columns: ["needle_id"]
            isOneToOne: false
            referencedRelation: "needles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_template: {
        Row: {
          body_template: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string | null
          uploaded_at: string
        }
        Insert: {
          body_template?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event?: string | null
          uploaded_at: string
        }
        Update: {
          body_template?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string | null
          uploaded_at?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          appintment_id: string
          channel: string | null
          client_id: string | null
          id: string
          redered_body: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
        }
        Insert: {
          appintment_id: string
          channel?: string | null
          client_id?: string | null
          id?: string
          redered_body?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
        }
        Update: {
          appintment_id?: string
          channel?: string | null
          client_id?: string | null
          id?: string
          redered_body?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_appintment_id_fkey"
            columns: ["appintment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_template"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_post: {
        Row: {
          cover_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          quote_request_id: string | null
          title: string
          view_count: number | null
        }
        Insert: {
          cover_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          quote_request_id?: string | null
          title: string
          view_count?: number | null
        }
        Update: {
          cover_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          quote_request_id?: string | null
          title?: string
          view_count?: number | null
        }
        Relationships: []
      }
      post_media: {
        Row: {
          id: string
          media_role: Database["public"]["Enums"]["post media role"] | null
          media_type: Database["public"]["Enums"]["media type"] | null
          post_id: string
          sort_order: number | null
          storage_url: string | null
          thumbnail_url: string | null
        }
        Insert: {
          id?: string
          media_role?: Database["public"]["Enums"]["post media role"] | null
          media_type?: Database["public"]["Enums"]["media type"] | null
          post_id: string
          sort_order?: number | null
          storage_url?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          id?: string
          media_role?: Database["public"]["Enums"]["post media role"] | null
          media_type?: Database["public"]["Enums"]["media type"] | null
          post_id?: string
          sort_order?: number | null
          storage_url?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "portfolio_post"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tag: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tag_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "portfolio_post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_media: {
        Row: {
          id: string
          media_type: Database["public"]["Enums"]["media type"] | null
          quote_request_id: string
          sort_order: number | null
          storage_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          id?: string
          media_type?: Database["public"]["Enums"]["media type"] | null
          quote_request_id?: string
          sort_order?: number | null
          storage_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          id?: string
          media_type?: Database["public"]["Enums"]["media type"] | null
          quote_request_id?: string
          sort_order?: number | null
          storage_url?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_media_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_request"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_request: {
        Row: {
          body_placement: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          preferred_date: string | null
          preferred_time_slot: string | null
          referenced_post_id: string | null
          size_hint: string | null
          status: Database["public"]["Enums"]["quote status"]
          wants_appointment: boolean
        }
        Insert: {
          body_placement?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          preferred_date?: string | null
          preferred_time_slot?: string | null
          referenced_post_id?: string | null
          size_hint?: string | null
          status?: Database["public"]["Enums"]["quote status"]
          wants_appointment?: boolean
        }
        Update: {
          body_placement?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          preferred_date?: string | null
          preferred_time_slot?: string | null
          referenced_post_id?: string | null
          size_hint?: string | null
          status?: Database["public"]["Enums"]["quote status"]
          wants_appointment?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "quote_request_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_response: {
        Row: {
          completed_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          price: number | null
          quote_request_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["quote status"] | null
        }
        Insert: {
          completed_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          price?: number | null
          quote_request_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote status"] | null
        }
        Update: {
          completed_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          price?: number | null
          quote_request_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_response_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_request"
            referencedColumns: ["id"]
          },
        ]
      }
      tag: {
        Row: {
          color_hex: string | null
          id: string
          name: string
          slug: string | null
          usage_count: number | null
        }
        Insert: {
          color_hex?: string | null
          id?: string
          name: string
          slug?: string | null
          usage_count?: number | null
        }
        Update: {
          color_hex?: string | null
          id?: string
          name?: string
          slug?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_tentative_appointment: {
        Args: { p_quote_request_id: string }
        Returns: string
      }
      delete_appointment_if_quote_request_rejected: {
        Args: { p_quote_request_id: string }
        Returns: undefined
      }
      set_quote_request_status: {
        Args: {
          p_quote_request_id: string
          p_status: Database["public"]["Enums"]["quote status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      "appointment status":
        | "tentative"
        | "confirmed"
        | "completed"
        | "cancelled"
      "design status": "draft" | "sent"
      "media type": "image" | "audio"
      "post media role": "reference" | "design" | "final"
      "quote status": "draft" | "sent" | "accepted" | "rejected" | "completed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      "appointment status": [
        "tentative",
        "confirmed",
        "completed",
        "cancelled",
      ],
      "design status": ["draft", "sent"],
      "media type": ["image", "audio"],
      "post media role": ["reference", "design", "final"],
      "quote status": ["draft", "sent", "accepted", "rejected", "completed"],
    },
  },
} as const
