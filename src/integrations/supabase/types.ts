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
  public: {
    Tables: {
      agent_logs: {
        Row: {
          action: string
          agent_name: string
          created_at: string
          details: Json | null
          id: string
          lead_id: string | null
        }
        Insert: {
          action: string
          agent_name: string
          created_at?: string
          details?: Json | null
          id?: string
          lead_id?: string | null
        }
        Update: {
          action?: string
          agent_name?: string
          created_at?: string
          details?: Json | null
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnoses: {
        Row: {
          channel: Database["public"]["Enums"]["outreach_channel"]
          cold_message: string
          created_at: string
          diagnosis_text: string
          hero_angle: string
          id: string
          lead_id: string
          score: number | null
          tone: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["outreach_channel"]
          cold_message: string
          created_at?: string
          diagnosis_text: string
          hero_angle: string
          id?: string
          lead_id: string
          score?: number | null
          tone: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["outreach_channel"]
          cold_message?: string
          created_at?: string
          diagnosis_text?: string
          hero_angle?: string
          id?: string
          lead_id?: string
          score?: number | null
          tone?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          color_scheme: string | null
          created_at: string
          html_content: string
          id: string
          lead_id: string
          screenshot_urls: Json | null
          sections: Json | null
          template_used: string
          video_url: string | null
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string
          html_content: string
          id?: string
          lead_id: string
          screenshot_urls?: Json | null
          sections?: Json | null
          template_used: string
          video_url?: string | null
        }
        Update: {
          color_scheme?: string | null
          created_at?: string
          html_content?: string
          id?: string
          lead_id?: string
          screenshot_urls?: Json | null
          sections?: Json | null
          template_used?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          business_name: string
          city: string
          created_at: string
          deal_value: number | null
          email: string | null
          google_maps_url: string | null
          id: string
          niche: string
          phone: string | null
          rating: number | null
          review_count: number | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          website_age: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          city: string
          created_at?: string
          deal_value?: number | null
          email?: string | null
          google_maps_url?: string | null
          id?: string
          niche: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          website_age?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          city?: string
          created_at?: string
          deal_value?: number | null
          email?: string | null
          google_maps_url?: string | null
          id?: string
          niche?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          website_age?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      outreach: {
        Row: {
          channel: Database["public"]["Enums"]["outreach_channel"]
          created_at: string
          eval_result: Json | null
          id: string
          lead_id: string
          message_content: string
          reply_at: string | null
          reply_text: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["outreach_status"]
        }
        Insert: {
          channel: Database["public"]["Enums"]["outreach_channel"]
          created_at?: string
          eval_result?: Json | null
          id?: string
          lead_id: string
          message_content: string
          reply_at?: string | null
          reply_text?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["outreach_status"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["outreach_channel"]
          created_at?: string
          eval_result?: Json | null
          id?: string
          lead_id?: string
          message_content?: string
          reply_at?: string | null
          reply_text?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["outreach_status"]
        }
        Relationships: [
          {
            foreignKeyName: "outreach_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_status:
        | "new"
        | "diagnosed"
        | "built"
        | "pitched"
        | "replied"
        | "booked"
        | "closed"
        | "rejected"
      outreach_channel: "email" | "sms" | "ig_dm" | "linkedin"
      outreach_status:
        | "pending_review"
        | "approved"
        | "sent"
        | "replied"
        | "positive"
        | "negative"
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
      lead_status: [
        "new",
        "diagnosed",
        "built",
        "pitched",
        "replied",
        "booked",
        "closed",
        "rejected",
      ],
      outreach_channel: ["email", "sms", "ig_dm", "linkedin"],
      outreach_status: [
        "pending_review",
        "approved",
        "sent",
        "replied",
        "positive",
        "negative",
      ],
    },
  },
} as const
