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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      brand_profiles: {
        Row: {
          background_style: string
          brand_description: string
          brand_keywords: string[]
          color_palette: string[]
          color_temperature: string
          composition_bias: string
          created_at: string
          do_not_rules: string[]
          id: string
          lighting_style: string
          name: string
          photography_reference: string
          preferred_scenes: string[]
          target_audience: string
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_style?: string
          brand_description?: string
          brand_keywords?: string[]
          color_palette?: string[]
          color_temperature?: string
          composition_bias?: string
          created_at?: string
          do_not_rules?: string[]
          id?: string
          lighting_style?: string
          name: string
          photography_reference?: string
          preferred_scenes?: string[]
          target_audience?: string
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_style?: string
          brand_description?: string
          brand_keywords?: string[]
          color_palette?: string[]
          color_temperature?: string
          composition_bias?: string
          created_at?: string
          do_not_rules?: string[]
          id?: string
          lighting_style?: string
          name?: string
          photography_reference?: string
          preferred_scenes?: string[]
          target_audience?: string
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creative_drops: {
        Row: {
          created_at: string
          generation_job_ids: string[]
          id: string
          run_date: string
          schedule_id: string | null
          status: string
          summary: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_job_ids?: string[]
          id?: string
          run_date?: string
          schedule_id?: string | null
          status?: string
          summary?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          generation_job_ids?: string[]
          id?: string
          run_date?: string
          schedule_id?: string | null
          status?: string
          summary?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_drops_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "creative_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_schedules: {
        Row: {
          active: boolean
          brand_profile_id: string | null
          created_at: string
          frequency: string
          id: string
          name: string
          next_run_at: string | null
          products_scope: string
          selected_product_ids: string[]
          updated_at: string
          user_id: string
          workflow_ids: string[]
        }
        Insert: {
          active?: boolean
          brand_profile_id?: string | null
          created_at?: string
          frequency?: string
          id?: string
          name: string
          next_run_at?: string | null
          products_scope?: string
          selected_product_ids?: string[]
          updated_at?: string
          user_id: string
          workflow_ids?: string[]
        }
        Update: {
          active?: boolean
          brand_profile_id?: string | null
          created_at?: string
          frequency?: string
          id?: string
          name?: string
          next_run_at?: string | null
          products_scope?: string
          selected_product_ids?: string[]
          updated_at?: string
          user_id?: string
          workflow_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "creative_schedules_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discover_presets: {
        Row: {
          aspect_ratio: string
          category: string
          created_at: string
          id: string
          image_url: string
          is_featured: boolean
          model_name: string | null
          prompt: string
          quality: string
          scene_name: string | null
          sort_order: number
          tags: string[] | null
          title: string
        }
        Insert: {
          aspect_ratio?: string
          category?: string
          created_at?: string
          id?: string
          image_url: string
          is_featured?: boolean
          model_name?: string | null
          prompt: string
          quality?: string
          scene_name?: string | null
          sort_order?: number
          tags?: string[] | null
          title: string
        }
        Update: {
          aspect_ratio?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          is_featured?: boolean
          model_name?: string | null
          prompt?: string
          quality?: string
          scene_name?: string | null
          sort_order?: number
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      freestyle_generations: {
        Row: {
          aspect_ratio: string
          created_at: string
          id: string
          image_url: string
          model_id: string | null
          product_id: string | null
          prompt: string
          quality: string
          scene_id: string | null
          user_id: string
        }
        Insert: {
          aspect_ratio?: string
          created_at?: string
          id?: string
          image_url: string
          model_id?: string | null
          product_id?: string | null
          prompt: string
          quality?: string
          scene_id?: string | null
          user_id: string
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          id?: string
          image_url?: string
          model_id?: string | null
          product_id?: string | null
          prompt?: string
          quality?: string
          scene_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freestyle_generations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_videos: {
        Row: {
          aspect_ratio: string
          completed_at: string | null
          created_at: string
          duration: string
          error_message: string | null
          id: string
          kling_task_id: string | null
          model_name: string
          prompt: string
          source_image_url: string
          status: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string
          completed_at?: string | null
          created_at?: string
          duration?: string
          error_message?: string | null
          id?: string
          kling_task_id?: string | null
          model_name?: string
          prompt?: string
          source_image_url: string
          status?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string
          completed_at?: string | null
          created_at?: string
          duration?: string
          error_message?: string | null
          id?: string
          kling_task_id?: string | null
          model_name?: string
          prompt?: string
          source_image_url?: string
          status?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      generation_jobs: {
        Row: {
          brand_profile_id: string | null
          completed_at: string | null
          created_at: string
          creative_drop_id: string | null
          credits_used: number
          error_message: string | null
          id: string
          product_id: string | null
          prompt_final: string | null
          quality: string
          ratio: string
          requested_count: number
          results: Json | null
          status: string
          template_id: string | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          brand_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          creative_drop_id?: string | null
          credits_used?: number
          error_message?: string | null
          id?: string
          product_id?: string | null
          prompt_final?: string | null
          quality?: string
          ratio?: string
          requested_count?: number
          results?: Json | null
          status?: string
          template_id?: string | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          brand_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          creative_drop_id?: string | null
          credits_used?: number
          error_message?: string | null
          id?: string
          product_id?: string | null
          prompt_final?: string | null
          quality?: string
          ratio?: string
          requested_count?: number
          results?: Json | null
          status?: string
          template_id?: string | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_jobs_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_creative_drop_id_fkey"
            columns: ["creative_drop_id"]
            isOneToOne: false
            referencedRelation: "creative_drops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generation_jobs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_upload_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          image_url: string | null
          session_token: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          image_url?: string | null
          session_token: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          session_token?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          position: number
          product_id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          position?: number
          product_id: string
          storage_path?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          product_id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_url: string | null
          created_at: string
          credits_balance: number
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          plan: string
          product_categories: string[]
          referral_source: string | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_url?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          plan?: string
          product_categories?: string[]
          referral_source?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_url?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          plan?: string
          product_categories?: string[]
          referral_source?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_discover_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string
          product_type: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image_url: string
          product_type?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          product_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string
          default_image_count: number
          description: string
          generation_config: Json | null
          id: string
          is_system: boolean
          name: string
          preview_image_url: string | null
          recommended_ratios: string[]
          required_inputs: string[]
          sort_order: number
          template_ids: string[]
          uses_tryon: boolean
        }
        Insert: {
          created_at?: string
          default_image_count?: number
          description?: string
          generation_config?: Json | null
          id?: string
          is_system?: boolean
          name: string
          preview_image_url?: string | null
          recommended_ratios?: string[]
          required_inputs?: string[]
          sort_order?: number
          template_ids?: string[]
          uses_tryon?: boolean
        }
        Update: {
          created_at?: string
          default_image_count?: number
          description?: string
          generation_config?: Json | null
          id?: string
          is_system?: boolean
          name?: string
          preview_image_url?: string | null
          recommended_ratios?: string[]
          required_inputs?: string[]
          sort_order?: number
          template_ids?: string[]
          uses_tryon?: boolean
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
