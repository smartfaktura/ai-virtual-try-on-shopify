import type { ComponentType } from 'react';

export type FilmType =
  | 'product_launch'
  | 'brand_story'
  | 'fashion_campaign'
  | 'beauty_film'
  | 'luxury_mood'
  | 'sports_campaign'
  | 'lifestyle_teaser'
  | 'custom';

export type StoryStructure =
  | 'hook_reveal_detail_closing'
  | 'intro_product_lifestyle_end'
  | 'atmosphere_focus_human_finish'
  | 'tease_build_highlight_resolve'
  | 'custom';

export interface ShotPlanItem {
  shot_index: number;
  role: string;
  purpose: string;
  scene_type: string;
  camera_motion: string;
  subject_motion: string;
  duration_sec: number;
  script_line?: string;
  sfx_prompt?: string;
  sfx_trigger_at?: number;
  vo_enabled?: boolean;
  sfx_enabled?: boolean;
  product_visible: boolean;
  character_visible: boolean;
  scene_reference_id?: string;
  model_reference_id?: string;
  preservation_strength: 'low' | 'medium' | 'high';
  user_notes?: string;

  // ── Commerce Video Engine extensions (Phase 3) ─────────────────────
  // All optional — legacy shots still work.
  clarity_first?: boolean;
  branding_accuracy_priority?: 'low' | 'medium' | 'high';
  material_accuracy_priority?: 'low' | 'medium' | 'high';
  shape_accuracy_priority?: 'low' | 'medium' | 'high';
  text_legibility_priority?: 'low' | 'medium' | 'high';
  continuity_lock?: {
    keepSameModel?: boolean;
    keepSameOutfit?: boolean;
    keepSameEnvironment?: boolean;
    keepSameLightingFamily?: boolean;
    keepSameProductState?: boolean;
  };
  reference_strategy?: string[];
}

export interface ShortFilmProject {
  film_type: FilmType;
  story_structure: StoryStructure;
  shots: ShotPlanItem[];
  script_mode: 'none' | 'manual' | 'generated';
  script_lines?: string[];
  tone: string;
  music_direction?: string;
}

export interface FilmTypeOption {
  value: FilmType;
  label: string;
  description: string;
  icon: string;
  lucideIcon?: ComponentType<{ className?: string }>;
  defaultStructure: StoryStructure;
  defaultTone: string;
  defaultShotCount: number;
}

export interface StoryStructureOption {
  value: StoryStructure;
  label: string;
  description: string;
  roles: string[];
}

export interface AudioLayers {
  music: boolean;
  sfx: boolean;
  voiceover: boolean;
}

export interface ShortFilmSettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  audioMode: 'silent' | 'ambient' | 'music' | 'voiceover' | 'full_mix';
  audioLayers?: AudioLayers;
  preservationLevel: 'low' | 'medium' | 'high';
  shotDuration: '5' | '10';
  quality: 'standard' | 'pro';
  tone?: string;
  musicPrompt?: string;
  musicPresetKey?: string;
  voiceId?: string;
}

export interface AudioAssets {
  backgroundTrackUrl?: string;
  perShotAudio: { shotIndex: number; url: string; type: 'sfx' | 'voiceover'; offset_sec?: number }[];
}

export type ShortFilmStep = 'film_type' | 'content_intent' | 'references' | 'story' | 'shot_plan' | 'settings' | 'review';

export type AudioPhase = 'idle' | 'music' | 'sfx' | 'voiceover' | 'done' | 'partial';
