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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          inquiry_type: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      creative_drops: {
        Row: {
          created_at: string
          credits_charged: number
          download_url: string | null
          generation_job_ids: string[]
          id: string
          images: Json
          run_date: string
          schedule_id: string | null
          status: string
          summary: Json
          total_images: number
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_charged?: number
          download_url?: string | null
          generation_job_ids?: string[]
          id?: string
          images?: Json
          run_date?: string
          schedule_id?: string | null
          status?: string
          summary?: Json
          total_images?: number
          user_id: string
        }
        Update: {
          created_at?: string
          credits_charged?: number
          download_url?: string | null
          generation_job_ids?: string[]
          id?: string
          images?: Json
          run_date?: string
          schedule_id?: string | null
          status?: string
          summary?: Json
          total_images?: number
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
          estimated_credits: number
          freestyle_prompts: string[]
          frequency: string
          id: string
          images_per_drop: number
          include_freestyle: boolean
          model_ids: string[]
          name: string
          next_run_at: string | null
          products_scope: string
          scene_config: Json
          selected_product_ids: string[]
          start_date: string
          theme: string
          theme_notes: string
          updated_at: string
          user_id: string
          workflow_ids: string[]
        }
        Insert: {
          active?: boolean
          brand_profile_id?: string | null
          created_at?: string
          estimated_credits?: number
          freestyle_prompts?: string[]
          frequency?: string
          id?: string
          images_per_drop?: number
          include_freestyle?: boolean
          model_ids?: string[]
          name: string
          next_run_at?: string | null
          products_scope?: string
          scene_config?: Json
          selected_product_ids?: string[]
          start_date?: string
          theme?: string
          theme_notes?: string
          updated_at?: string
          user_id: string
          workflow_ids?: string[]
        }
        Update: {
          active?: boolean
          brand_profile_id?: string | null
          created_at?: string
          estimated_credits?: number
          freestyle_prompts?: string[]
          frequency?: string
          id?: string
          images_per_drop?: number
          include_freestyle?: boolean
          model_ids?: string[]
          name?: string
          next_run_at?: string | null
          products_scope?: string
          scene_config?: Json
          selected_product_ids?: string[]
          start_date?: string
          theme?: string
          theme_notes?: string
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
      custom_models: {
        Row: {
          age_range: string
          body_type: string
          created_at: string
          created_by: string
          ethnicity: string
          gender: string
          id: string
          image_url: string
          is_active: boolean
          name: string
        }
        Insert: {
          age_range?: string
          body_type?: string
          created_at?: string
          created_by: string
          ethnicity?: string
          gender?: string
          id?: string
          image_url: string
          is_active?: boolean
          name: string
        }
        Update: {
          age_range?: string
          body_type?: string
          created_at?: string
          created_by?: string
          ethnicity?: string
          gender?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      custom_scenes: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          id: string
          image_url: string
          is_active: boolean
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string
          id?: string
          image_url: string
          is_active?: boolean
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      discover_item_views: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string | null
        }
        Relationships: []
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
      discover_submissions: {
        Row: {
          admin_note: string | null
          aspect_ratio: string
          category: string
          created_at: string
          id: string
          image_url: string
          prompt: string
          quality: string
          source_generation_id: string | null
          status: string
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          aspect_ratio?: string
          category?: string
          created_at?: string
          id?: string
          image_url: string
          prompt?: string
          quality?: string
          source_generation_id?: string | null
          status?: string
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          aspect_ratio?: string
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          quality?: string
          source_generation_id?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discover_submissions_source_generation_id_fkey"
            columns: ["source_generation_id"]
            isOneToOne: false
            referencedRelation: "freestyle_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_items: {
        Row: {
          created_at: string
          featured_by: string
          id: string
          item_id: string
          item_type: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          featured_by: string
          id?: string
          item_id: string
          item_type: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          featured_by?: string
          id?: string
          item_id?: string
          item_type?: string
          sort_order?: number
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
      generation_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_reserved: number
          error_message: string | null
          id: string
          is_first_generation: boolean
          job_type: string
          payload: Json
          priority_score: number
          result: Json | null
          started_at: string | null
          status: string
          timeout_at: string | null
          user_id: string
          user_plan: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_reserved?: number
          error_message?: string | null
          id?: string
          is_first_generation?: boolean
          job_type: string
          payload: Json
          priority_score?: number
          result?: Json | null
          started_at?: string | null
          status?: string
          timeout_at?: string | null
          user_id: string
          user_plan?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_reserved?: number
          error_message?: string | null
          id?: string
          is_first_generation?: boolean
          job_type?: string
          payload?: Json
          priority_score?: number
          result?: Json | null
          started_at?: string | null
          status?: string
          timeout_at?: string | null
          user_id?: string
          user_plan?: string
        }
        Relationships: []
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
          current_period_end: string | null
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
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_url?: string | null
          created_at?: string
          credits_balance?: number
          current_period_end?: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_url?: string | null
          created_at?: string
          credits_balance?: number
          current_period_end?: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
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
          dimensions: string | null
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
          dimensions?: string | null
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
          dimensions?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      add_purchased_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      change_user_plan: {
        Args: { p_new_credits: number; p_new_plan: string; p_user_id: string }
        Returns: Json
      }
      claim_next_job: { Args: never; Returns: Json }
      cleanup_stale_jobs: { Args: never; Returns: Json }
      deduct_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      enqueue_generation: {
        Args: {
          p_credits_cost: number
          p_job_type: string
          p_payload: Json
          p_user_id: string
        }
        Returns: Json
      }
      get_discover_view_count: {
        Args: { p_item_id: string; p_item_type: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refund_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
