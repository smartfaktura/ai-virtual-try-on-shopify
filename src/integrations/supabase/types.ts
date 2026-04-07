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
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          page_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          page_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          page_url?: string | null
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
          optimized_image_url: string | null
          sort_order: number
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
          optimized_image_url?: string | null
          sort_order?: number
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
          optimized_image_url?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      custom_scenes: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          discover_categories: string[]
          id: string
          image_url: string
          is_active: boolean
          name: string
          optimized_image_url: string | null
          preview_image_url: string | null
          prompt_hint: string | null
          prompt_only: boolean | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string
          discover_categories?: string[]
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          optimized_image_url?: string | null
          preview_image_url?: string | null
          prompt_hint?: string | null
          prompt_only?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          discover_categories?: string[]
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          optimized_image_url?: string | null
          preview_image_url?: string | null
          prompt_hint?: string | null
          prompt_only?: boolean | null
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
          discover_categories: string[]
          id: string
          image_url: string
          is_featured: boolean
          model_image_url: string | null
          model_name: string | null
          product_image_url: string | null
          product_name: string | null
          prompt: string
          quality: string
          scene_image_url: string | null
          scene_name: string | null
          slug: string
          sort_order: number
          tags: string[] | null
          title: string
          workflow_name: string | null
          workflow_slug: string | null
        }
        Insert: {
          aspect_ratio?: string
          category?: string
          created_at?: string
          discover_categories?: string[]
          id?: string
          image_url: string
          is_featured?: boolean
          model_image_url?: string | null
          model_name?: string | null
          product_image_url?: string | null
          product_name?: string | null
          prompt: string
          quality?: string
          scene_image_url?: string | null
          scene_name?: string | null
          slug: string
          sort_order?: number
          tags?: string[] | null
          title: string
          workflow_name?: string | null
          workflow_slug?: string | null
        }
        Update: {
          aspect_ratio?: string
          category?: string
          created_at?: string
          discover_categories?: string[]
          id?: string
          image_url?: string
          is_featured?: boolean
          model_image_url?: string | null
          model_name?: string | null
          product_image_url?: string | null
          product_name?: string | null
          prompt?: string
          quality?: string
          scene_image_url?: string | null
          scene_name?: string | null
          slug?: string
          sort_order?: number
          tags?: string[] | null
          title?: string
          workflow_name?: string | null
          workflow_slug?: string | null
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
          product_image_url: string | null
          product_name: string | null
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
          product_image_url?: string | null
          product_name?: string | null
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
          product_image_url?: string | null
          product_name?: string | null
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
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
      feedback: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          page_url: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          page_url?: string | null
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          page_url?: string | null
          status?: string
          type?: string
          user_id?: string
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
          provider_used: string | null
          quality: string
          scene_id: string | null
          user_id: string
          user_prompt: string | null
          workflow_label: string | null
        }
        Insert: {
          aspect_ratio?: string
          created_at?: string
          id?: string
          image_url: string
          model_id?: string | null
          product_id?: string | null
          prompt: string
          provider_used?: string | null
          quality?: string
          scene_id?: string | null
          user_id: string
          user_prompt?: string | null
          workflow_label?: string | null
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          id?: string
          image_url?: string
          model_id?: string | null
          product_id?: string | null
          prompt?: string
          provider_used?: string | null
          quality?: string
          scene_id?: string | null
          user_id?: string
          user_prompt?: string | null
          workflow_label?: string | null
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
          camera_type: string | null
          cfg_scale: number | null
          completed_at: string | null
          created_at: string
          duration: string
          error_message: string | null
          id: string
          kling_task_id: string | null
          model_name: string
          negative_prompt: string | null
          preview_url: string | null
          project_id: string | null
          prompt: string
          source_image_url: string
          status: string
          user_id: string
          video_url: string | null
          workflow_type: string | null
        }
        Insert: {
          aspect_ratio?: string
          camera_type?: string | null
          cfg_scale?: number | null
          completed_at?: string | null
          created_at?: string
          duration?: string
          error_message?: string | null
          id?: string
          kling_task_id?: string | null
          model_name?: string
          negative_prompt?: string | null
          preview_url?: string | null
          project_id?: string | null
          prompt?: string
          source_image_url: string
          status?: string
          user_id: string
          video_url?: string | null
          workflow_type?: string | null
        }
        Update: {
          aspect_ratio?: string
          camera_type?: string | null
          cfg_scale?: number | null
          completed_at?: string | null
          created_at?: string
          duration?: string
          error_message?: string | null
          id?: string
          kling_task_id?: string | null
          model_name?: string
          negative_prompt?: string | null
          preview_url?: string | null
          project_id?: string | null
          prompt?: string
          source_image_url?: string
          status?: string
          user_id?: string
          video_url?: string | null
          workflow_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
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
          model_image_url: string | null
          model_name: string | null
          product_id: string | null
          product_image_url: string | null
          product_name: string | null
          prompt_final: string | null
          quality: string
          ratio: string
          requested_count: number
          results: Json | null
          scene_image_url: string | null
          scene_name: string | null
          status: string
          template_id: string | null
          user_id: string
          workflow_id: string | null
          workflow_slug: string | null
        }
        Insert: {
          brand_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          creative_drop_id?: string | null
          credits_used?: number
          error_message?: string | null
          id?: string
          model_image_url?: string | null
          model_name?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string | null
          prompt_final?: string | null
          quality?: string
          ratio?: string
          requested_count?: number
          results?: Json | null
          scene_image_url?: string | null
          scene_name?: string | null
          status?: string
          template_id?: string | null
          user_id: string
          workflow_id?: string | null
          workflow_slug?: string | null
        }
        Update: {
          brand_profile_id?: string | null
          completed_at?: string | null
          created_at?: string
          creative_drop_id?: string | null
          credits_used?: number
          error_message?: string | null
          id?: string
          model_image_url?: string | null
          model_name?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_name?: string | null
          prompt_final?: string | null
          quality?: string
          ratio?: string
          requested_count?: number
          results?: Json | null
          scene_image_url?: string | null
          scene_name?: string | null
          status?: string
          template_id?: string | null
          user_id?: string
          workflow_id?: string | null
          workflow_slug?: string | null
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
          retry_count: number
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
          retry_count?: number
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
          retry_count?: number
          started_at?: string | null
          status?: string
          timeout_at?: string | null
          user_id?: string
          user_plan?: string
        }
        Relationships: []
      }
      hidden_scenes: {
        Row: {
          created_at: string
          hidden_by: string
          id: string
          scene_id: string
        }
        Insert: {
          created_at?: string
          hidden_by: string
          id?: string
          scene_id: string
        }
        Update: {
          created_at?: string
          hidden_by?: string
          id?: string
          scene_id?: string
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
      model_sort_order: {
        Row: {
          created_at: string
          id: string
          model_id: string
          sort_order: number
          updated_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          sort_order?: number
          updated_by: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          sort_order?: number
          updated_by?: string
        }
        Relationships: []
      }
      post_notes: {
        Row: {
          background: string | null
          created_at: string
          crop: string | null
          id: string
          internal_note: string | null
          lighting: string | null
          mood: string | null
          palette: string | null
          premium_cue: string | null
          props: string | null
          styling_tone: string | null
          updated_at: string
          watch_post_id: string
        }
        Insert: {
          background?: string | null
          created_at?: string
          crop?: string | null
          id?: string
          internal_note?: string | null
          lighting?: string | null
          mood?: string | null
          palette?: string | null
          premium_cue?: string | null
          props?: string | null
          styling_tone?: string | null
          updated_at?: string
          watch_post_id: string
        }
        Update: {
          background?: string | null
          created_at?: string
          crop?: string | null
          id?: string
          internal_note?: string | null
          lighting?: string | null
          mood?: string | null
          palette?: string | null
          premium_cue?: string | null
          props?: string | null
          styling_tone?: string | null
          updated_at?: string
          watch_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_notes_watch_post_id_fkey"
            columns: ["watch_post_id"]
            isOneToOne: false
            referencedRelation: "watch_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_image_scenes: {
        Row: {
          category_collection: string | null
          category_sort_order: number | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          preview_image_url: string | null
          prompt_template: string
          scene_id: string
          scene_type: string
          sort_order: number
          sub_category: string | null
          title: string
          trigger_blocks: string[]
        }
        Insert: {
          category_collection?: string | null
          category_sort_order?: number | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          preview_image_url?: string | null
          prompt_template?: string
          scene_id: string
          scene_type?: string
          sort_order?: number
          sub_category?: string | null
          title: string
          trigger_blocks?: string[]
        }
        Update: {
          category_collection?: string | null
          category_sort_order?: number | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          preview_image_url?: string | null
          prompt_template?: string
          scene_id?: string
          scene_type?: string
          sort_order?: number
          sub_category?: string | null
          title?: string
          trigger_blocks?: string[]
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
          billing_interval: string | null
          company_url: string | null
          created_at: string
          credits_balance: number
          credits_renewed_at: string
          current_period_end: string | null
          display_name: string | null
          email: string
          feature_email_sent_at: string | null
          first_name: string | null
          id: string
          last_low_credits_email_at: string | null
          last_name: string | null
          marketing_emails_opted_in: boolean
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
          billing_interval?: string | null
          company_url?: string | null
          created_at?: string
          credits_balance?: number
          credits_renewed_at?: string
          current_period_end?: string | null
          display_name?: string | null
          email: string
          feature_email_sent_at?: string | null
          first_name?: string | null
          id?: string
          last_low_credits_email_at?: string | null
          last_name?: string | null
          marketing_emails_opted_in?: boolean
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
          billing_interval?: string | null
          company_url?: string | null
          created_at?: string
          credits_balance?: number
          credits_renewed_at?: string
          current_period_end?: string | null
          display_name?: string | null
          email?: string
          feature_email_sent_at?: string | null
          first_name?: string | null
          id?: string
          last_low_credits_email_at?: string | null
          last_name?: string | null
          marketing_emails_opted_in?: boolean
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
      prompt_outputs: {
        Row: {
          composition_prompt: string | null
          consistency_prompt: string | null
          created_at: string
          environment_prompt: string | null
          id: string
          lighting_prompt: string | null
          master_scene_prompt: string | null
          negative_prompt: string | null
          scene_recipe_id: string
          styling_prompt: string | null
          updated_at: string
        }
        Insert: {
          composition_prompt?: string | null
          consistency_prompt?: string | null
          created_at?: string
          environment_prompt?: string | null
          id?: string
          lighting_prompt?: string | null
          master_scene_prompt?: string | null
          negative_prompt?: string | null
          scene_recipe_id: string
          styling_prompt?: string | null
          updated_at?: string
        }
        Update: {
          composition_prompt?: string | null
          consistency_prompt?: string | null
          created_at?: string
          environment_prompt?: string | null
          id?: string
          lighting_prompt?: string | null
          master_scene_prompt?: string | null
          negative_prompt?: string | null
          scene_recipe_id?: string
          styling_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_outputs_scene_recipe_id_fkey"
            columns: ["scene_recipe_id"]
            isOneToOne: false
            referencedRelation: "scene_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_dispatch_lock: {
        Row: {
          id: number
          locked_at: string | null
          locked_by: string | null
        }
        Insert: {
          id?: number
          locked_at?: string | null
          locked_by?: string | null
        }
        Update: {
          id?: number
          locked_at?: string | null
          locked_by?: string | null
        }
        Relationships: []
      }
      reference_analyses: {
        Row: {
          avoid_terms: string[] | null
          background_detail: string | null
          background_type: string | null
          camera_angle: string | null
          category: string | null
          color_grading: string | null
          composition_logic: string | null
          contrast_level: string | null
          created_at: string
          crop_type: string | null
          depth_of_field: string | null
          dominant_colors: string[] | null
          environment_type: string | null
          framing_style: string | null
          has_hands: boolean | null
          has_model: boolean | null
          has_packaging: boolean | null
          id: string
          image_mode: string | null
          key_visual_elements: string[] | null
          light_direction: string | null
          lighting_type: string | null
          material_cues: string[] | null
          mood: string | null
          negative_space: string | null
          palette: string[] | null
          premium_cues: string[] | null
          product_placement: string | null
          props: string[] | null
          raw_analysis_json: Json | null
          realism_level: string | null
          recommended_aesthetic_family: string | null
          recommended_scene_name: string | null
          reflections: string | null
          saturation_level: string | null
          scene_type: string | null
          shadow_softness: string | null
          short_summary: string | null
          styling_tone: string | null
          subcategory: string | null
          surface_cues: string[] | null
          texture_detail: string | null
          updated_at: string
          watch_post_id: string
        }
        Insert: {
          avoid_terms?: string[] | null
          background_detail?: string | null
          background_type?: string | null
          camera_angle?: string | null
          category?: string | null
          color_grading?: string | null
          composition_logic?: string | null
          contrast_level?: string | null
          created_at?: string
          crop_type?: string | null
          depth_of_field?: string | null
          dominant_colors?: string[] | null
          environment_type?: string | null
          framing_style?: string | null
          has_hands?: boolean | null
          has_model?: boolean | null
          has_packaging?: boolean | null
          id?: string
          image_mode?: string | null
          key_visual_elements?: string[] | null
          light_direction?: string | null
          lighting_type?: string | null
          material_cues?: string[] | null
          mood?: string | null
          negative_space?: string | null
          palette?: string[] | null
          premium_cues?: string[] | null
          product_placement?: string | null
          props?: string[] | null
          raw_analysis_json?: Json | null
          realism_level?: string | null
          recommended_aesthetic_family?: string | null
          recommended_scene_name?: string | null
          reflections?: string | null
          saturation_level?: string | null
          scene_type?: string | null
          shadow_softness?: string | null
          short_summary?: string | null
          styling_tone?: string | null
          subcategory?: string | null
          surface_cues?: string[] | null
          texture_detail?: string | null
          updated_at?: string
          watch_post_id: string
        }
        Update: {
          avoid_terms?: string[] | null
          background_detail?: string | null
          background_type?: string | null
          camera_angle?: string | null
          category?: string | null
          color_grading?: string | null
          composition_logic?: string | null
          contrast_level?: string | null
          created_at?: string
          crop_type?: string | null
          depth_of_field?: string | null
          dominant_colors?: string[] | null
          environment_type?: string | null
          framing_style?: string | null
          has_hands?: boolean | null
          has_model?: boolean | null
          has_packaging?: boolean | null
          id?: string
          image_mode?: string | null
          key_visual_elements?: string[] | null
          light_direction?: string | null
          lighting_type?: string | null
          material_cues?: string[] | null
          mood?: string | null
          negative_space?: string | null
          palette?: string[] | null
          premium_cues?: string[] | null
          product_placement?: string | null
          props?: string[] | null
          raw_analysis_json?: Json | null
          realism_level?: string | null
          recommended_aesthetic_family?: string | null
          recommended_scene_name?: string | null
          reflections?: string | null
          saturation_level?: string | null
          scene_type?: string | null
          shadow_softness?: string | null
          short_summary?: string | null
          styling_tone?: string | null
          subcategory?: string | null
          surface_cues?: string[] | null
          texture_detail?: string | null
          updated_at?: string
          watch_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_analyses_watch_post_id_fkey"
            columns: ["watch_post_id"]
            isOneToOne: false
            referencedRelation: "watch_posts"
            referencedColumns: ["id"]
          },
        ]
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
      scene_categories: {
        Row: {
          created_at: string
          created_by: string
          id: string
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          label: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      scene_recipes: {
        Row: {
          aesthetic_family: string | null
          avoid_terms: string[] | null
          background: string | null
          camera_feel: string | null
          category: string | null
          composition: string | null
          created_at: string
          crop: string | null
          id: string
          lighting: string | null
          mood: string | null
          name: string
          palette: string[] | null
          premium_cues: string[] | null
          preview_image_url: string | null
          props: string[] | null
          recommended_use_cases: string[] | null
          scene_goal: string | null
          scene_type: string | null
          short_description: string | null
          source_reference_analysis_id: string | null
          source_type: string
          source_watch_post_id: string | null
          status: string
          styling_tone: string | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          aesthetic_family?: string | null
          avoid_terms?: string[] | null
          background?: string | null
          camera_feel?: string | null
          category?: string | null
          composition?: string | null
          created_at?: string
          crop?: string | null
          id?: string
          lighting?: string | null
          mood?: string | null
          name: string
          palette?: string[] | null
          premium_cues?: string[] | null
          preview_image_url?: string | null
          props?: string[] | null
          recommended_use_cases?: string[] | null
          scene_goal?: string | null
          scene_type?: string | null
          short_description?: string | null
          source_reference_analysis_id?: string | null
          source_type?: string
          source_watch_post_id?: string | null
          status?: string
          styling_tone?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          aesthetic_family?: string | null
          avoid_terms?: string[] | null
          background?: string | null
          camera_feel?: string | null
          category?: string | null
          composition?: string | null
          created_at?: string
          crop?: string | null
          id?: string
          lighting?: string | null
          mood?: string | null
          name?: string
          palette?: string[] | null
          premium_cues?: string[] | null
          preview_image_url?: string | null
          props?: string[] | null
          recommended_use_cases?: string[] | null
          scene_goal?: string | null
          scene_type?: string | null
          short_description?: string | null
          source_reference_analysis_id?: string | null
          source_type?: string
          source_watch_post_id?: string | null
          status?: string
          styling_tone?: string | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scene_recipes_source_reference_analysis_id_fkey"
            columns: ["source_reference_analysis_id"]
            isOneToOne: false
            referencedRelation: "reference_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scene_recipes_source_watch_post_id_fkey"
            columns: ["source_watch_post_id"]
            isOneToOne: false
            referencedRelation: "watch_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      scene_sort_order: {
        Row: {
          category_override: string | null
          created_at: string
          id: string
          scene_id: string
          sort_order: number
          updated_by: string
        }
        Insert: {
          category_override?: string | null
          created_at?: string
          id?: string
          scene_id: string
          sort_order?: number
          updated_by: string
        }
        Update: {
          category_override?: string | null
          created_at?: string
          id?: string
          scene_id?: string
          sort_order?: number
          updated_by?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      try_shot_sessions: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          ip_address: string
          results: Json | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          ip_address: string
          results?: Json | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          ip_address?: string
          results?: Json | null
        }
        Relationships: []
      }
      user_models: {
        Row: {
          age_range: string
          body_type: string
          created_at: string | null
          credits_used: number
          ethnicity: string
          gender: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          source_image_url: string
          user_id: string
        }
        Insert: {
          age_range?: string
          body_type?: string
          created_at?: string | null
          credits_used?: number
          ethnicity?: string
          gender?: string
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          source_image_url: string
          user_id: string
        }
        Update: {
          age_range?: string
          body_type?: string
          created_at?: string | null
          credits_used?: number
          ethnicity?: string
          gender?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          source_image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          analysis_json: Json | null
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
          analysis_json?: Json | null
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
          analysis_json?: Json | null
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
      user_saved_colors: {
        Row: {
          created_at: string | null
          gradient_from: string | null
          gradient_to: string | null
          hex: string | null
          id: string
          label: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          hex?: string | null
          id?: string
          label?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          hex?: string | null
          id?: string
          label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      video_inputs: {
        Row: {
          analysis_json: Json | null
          asset_url: string
          created_at: string
          id: string
          input_role: string
          project_id: string
          sort_order: number
          type: string
          validation_json: Json | null
        }
        Insert: {
          analysis_json?: Json | null
          asset_url: string
          created_at?: string
          id?: string
          input_role?: string
          project_id: string
          sort_order?: number
          type?: string
          validation_json?: Json | null
        }
        Update: {
          analysis_json?: Json | null
          asset_url?: string
          created_at?: string
          id?: string
          input_role?: string
          project_id?: string
          sort_order?: number
          type?: string
          validation_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "video_inputs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      video_projects: {
        Row: {
          analysis_status: string
          charged_credits: number
          cover_image_url: string | null
          created_at: string
          estimated_credits: number
          generation_mode: string
          id: string
          settings_json: Json
          status: string
          title: string
          updated_at: string
          user_id: string
          workflow_type: string
        }
        Insert: {
          analysis_status?: string
          charged_credits?: number
          cover_image_url?: string | null
          created_at?: string
          estimated_credits?: number
          generation_mode?: string
          id?: string
          settings_json?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id: string
          workflow_type?: string
        }
        Update: {
          analysis_status?: string
          charged_credits?: number
          cover_image_url?: string | null
          created_at?: string
          estimated_credits?: number
          generation_mode?: string
          id?: string
          settings_json?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          workflow_type?: string
        }
        Relationships: []
      }
      video_shots: {
        Row: {
          analysis_json: Json | null
          audio_mode: string
          created_at: string
          duration_sec: number
          id: string
          model_route: string
          project_id: string
          prompt_template_name: string | null
          prompt_text: string
          result_url: string | null
          shot_index: number
          shot_role: string | null
          source_input_id: string | null
          status: string
          strategy_json: Json | null
          transition_type: string | null
        }
        Insert: {
          analysis_json?: Json | null
          audio_mode?: string
          created_at?: string
          duration_sec?: number
          id?: string
          model_route?: string
          project_id: string
          prompt_template_name?: string | null
          prompt_text?: string
          result_url?: string | null
          shot_index?: number
          shot_role?: string | null
          source_input_id?: string | null
          status?: string
          strategy_json?: Json | null
          transition_type?: string | null
        }
        Update: {
          analysis_json?: Json | null
          audio_mode?: string
          created_at?: string
          duration_sec?: number
          id?: string
          model_route?: string
          project_id?: string
          prompt_template_name?: string | null
          prompt_text?: string
          result_url?: string | null
          shot_index?: number
          shot_role?: string | null
          source_input_id?: string | null
          status?: string
          strategy_json?: Json | null
          transition_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_shots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_shots_source_input_id_fkey"
            columns: ["source_input_id"]
            isOneToOne: false
            referencedRelation: "video_inputs"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_accounts: {
        Row: {
          category: string
          created_at: string
          display_name: string
          id: string
          instagram_account_id: string | null
          is_active: boolean
          last_sync_cursor: string | null
          last_synced_at: string | null
          priority_order: number
          profile_image_url: string | null
          source_mode: string
          sync_status: string
          updated_at: string
          username: string
        }
        Insert: {
          category?: string
          created_at?: string
          display_name: string
          id?: string
          instagram_account_id?: string | null
          is_active?: boolean
          last_sync_cursor?: string | null
          last_synced_at?: string | null
          priority_order?: number
          profile_image_url?: string | null
          source_mode?: string
          sync_status?: string
          updated_at?: string
          username: string
        }
        Update: {
          category?: string
          created_at?: string
          display_name?: string
          id?: string
          instagram_account_id?: string | null
          is_active?: boolean
          last_sync_cursor?: string | null
          last_synced_at?: string | null
          priority_order?: number
          profile_image_url?: string | null
          source_mode?: string
          sync_status?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      watch_posts: {
        Row: {
          caption: string | null
          comment_count: number | null
          created_at: string
          fetched_at: string | null
          id: string
          instagram_post_id: string | null
          is_favorite: boolean
          is_worth_aesthetic: boolean
          like_count: number | null
          media_type: string
          media_url: string | null
          permalink: string | null
          posted_at: string | null
          thumbnail_url: string | null
          watch_account_id: string
        }
        Insert: {
          caption?: string | null
          comment_count?: number | null
          created_at?: string
          fetched_at?: string | null
          id?: string
          instagram_post_id?: string | null
          is_favorite?: boolean
          is_worth_aesthetic?: boolean
          like_count?: number | null
          media_type?: string
          media_url?: string | null
          permalink?: string | null
          posted_at?: string | null
          thumbnail_url?: string | null
          watch_account_id: string
        }
        Update: {
          caption?: string | null
          comment_count?: number | null
          created_at?: string
          fetched_at?: string | null
          id?: string
          instagram_post_id?: string | null
          is_favorite?: boolean
          is_worth_aesthetic?: boolean
          like_count?: number | null
          media_type?: string
          media_url?: string | null
          permalink?: string | null
          posted_at?: string | null
          thumbnail_url?: string | null
          watch_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_posts_watch_account_id_fkey"
            columns: ["watch_account_id"]
            isOneToOne: false
            referencedRelation: "watch_accounts"
            referencedColumns: ["id"]
          },
        ]
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
          slug: string
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
          slug: string
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
          slug?: string
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
      admin_generation_stats: { Args: { p_hours: number }; Returns: Json }
      admin_model_usage_stats: { Args: never; Returns: Json }
      admin_platform_stats: { Args: never; Returns: Json }
      cancel_queue_job: { Args: { p_job_id: string }; Returns: boolean }
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
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
      get_hidden_scene_ids: {
        Args: never
        Returns: {
          scene_id: string
        }[]
      }
      get_public_custom_scenes: {
        Args: never
        Returns: {
          category: string
          created_at: string
          description: string
          discover_categories: string[]
          id: string
          image_url: string
          is_active: boolean
          name: string
          optimized_image_url: string
          preview_image_url: string
          prompt_hint: string
          prompt_only: boolean
        }[]
      }
      get_public_featured_items: {
        Args: never
        Returns: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          sort_order: number
        }[]
      }
      get_user_emails_for_admin: {
        Args: { p_user_ids: string[] }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      refund_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      release_dispatch_lock: { Args: never; Returns: undefined }
      reset_plan_credits: {
        Args: { p_plan_credits: number; p_user_id: string }
        Returns: Json
      }
      try_acquire_dispatch_lock: {
        Args: { p_locked_by?: string }
        Returns: boolean
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
