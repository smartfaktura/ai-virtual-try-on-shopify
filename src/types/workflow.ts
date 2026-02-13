// Workflow-specific types

export interface WorkflowVariationItem {
  label: string;
  instruction: string;
  aspect_ratio?: string;
  preview_url?: string;
  category?: string;
}

export interface WorkflowVariationStrategy {
  type: 'seasonal' | 'multi-ratio' | 'angle' | 'paired' | 'layout' | 'mood' | 'surface' | 'scene';
  variations: WorkflowVariationItem[];
}

export interface WorkflowFixedSettings {
  aspect_ratios?: string[];
  quality?: string;
  composition_rules?: string;
}

export interface WorkflowCustomSetting {
  type: string;
  label: string;
  options?: string[];
}

export interface WorkflowUIConfig {
  skip_template?: boolean;
  skip_mode?: boolean;
  lock_aspect_ratio?: boolean;
  show_model_picker?: boolean;
  show_pose_picker?: boolean;
  show_scene_picker?: boolean;
  custom_settings?: WorkflowCustomSetting[];
}

export interface WorkflowGenerationConfig {
  prompt_template: string;
  system_instructions: string;
  fixed_settings: WorkflowFixedSettings;
  variation_strategy: WorkflowVariationStrategy;
  ui_config: WorkflowUIConfig;
  negative_prompt_additions?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  default_image_count: number;
  required_inputs: string[];
  recommended_ratios: string[];
  uses_tryon: boolean;
  template_ids: string[];
  is_system: boolean;
  created_at: string;
  sort_order: number;
  preview_image_url: string | null;
  generation_config: WorkflowGenerationConfig | null;
}
