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
  product_visible: boolean;
  character_visible: boolean;
  scene_reference_id?: string;
  model_reference_id?: string;
  preservation_strength: 'low' | 'medium' | 'high';
  user_notes?: string;
}

export interface ShortFilmProject {
  film_type: FilmType;
  story_structure: StoryStructure;
  shots: ShotPlanItem[];
  script_mode: 'none' | 'manual' | 'generated';
  script_lines?: string[];
  tone: string;
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

export interface ShortFilmSettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  audioMode: 'silent' | 'ambient' | 'music' | 'voiceover' | 'full_mix';
  preservationLevel: 'low' | 'medium' | 'high';
  shotDuration: '5' | '10';
  quality: 'standard' | 'pro';
  tone?: string;
  musicPrompt?: string;
  voiceId?: string;
}

export interface AudioAssets {
  backgroundTrackUrl?: string;
  perShotAudio: { shotIndex: number; url: string; type: 'sfx' | 'voiceover' }[];
}

export type ShortFilmStep = 'film_type' | 'references' | 'story' | 'shot_plan' | 'settings' | 'review';
