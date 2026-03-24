import React from 'react';
import { cn } from '@/lib/utils';
import { mockModels, mockTryOnPoses } from '@/data/mockData';
import type { ModelProfile, TryOnPose } from '@/types';

export interface QuickPreset {
  id: string;
  label: string;
  subtitle: string;
  modelId: string;
  poseId: string;
  prompt: string;
  thumbnail: string;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'preset_lifestyle',
    label: 'Lifestyle Scene',
    subtitle: 'Freya · Urban Walking',
    modelId: 'model_029',
    poseId: 'pose_003',
    prompt: 'Lifestyle street style photoshoot, golden hour, natural movement',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_003')?.previewUrl || '',
  },
  {
    id: 'preset_studio',
    label: 'Studio Clean',
    subtitle: 'Zara · Studio Front',
    modelId: 'model_031',
    poseId: 'pose_001',
    prompt: 'Clean studio product photography, white backdrop, professional lighting',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_001')?.previewUrl || '',
  },
  {
    id: 'preset_editorial',
    label: 'Editorial Moody',
    subtitle: 'Sienna · Dramatic Light',
    modelId: 'model_033',
    poseId: 'pose_019',
    prompt: 'Moody editorial fashion shoot, dramatic lighting, dark atmosphere',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_019')?.previewUrl || '',
  },
  {
    id: 'preset_beach',
    label: 'Beach Vibes',
    subtitle: 'Olivia · Sunset Coast',
    modelId: 'model_035',
    poseId: 'pose_015',
    prompt: 'Beach sunset lifestyle photoshoot, warm coastal light, relaxed vibe',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_015')?.previewUrl || '',
  },
  {
    id: 'preset_cafe',
    label: 'Café Morning',
    subtitle: 'Hannah · Coffee Shop',
    modelId: 'model_050',
    poseId: 'pose_014',
    prompt: 'Morning café lifestyle shoot, natural window light, cozy atmosphere',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_014')?.previewUrl || '',
  },
];

interface FreestyleQuickPresetsProps {
  onSelect: (preset: QuickPreset, model: ModelProfile, scene: TryOnPose) => void;
  activePresetId?: string | null;
}

export function FreestyleQuickPresets({ onSelect, activePresetId }: FreestyleQuickPresetsProps) {
  const handleSelect = (preset: QuickPreset) => {
    const model = mockModels.find(m => m.modelId === preset.modelId);
    const scene = mockTryOnPoses.find(p => p.poseId === preset.poseId);
    if (model && scene) {
      onSelect(preset, model, scene);
    }
  };

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-muted-foreground mb-3 text-center lg:text-left">
        Quick start — pick a scene
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none lg:flex-wrap lg:overflow-visible lg:justify-center">
        {QUICK_PRESETS.map(preset => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all snap-start shrink-0',
                'hover:border-primary/50 hover:bg-accent/50 active:scale-[0.98]',
                isActive
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border/60 bg-background'
              )}
            >
              <img
                src={preset.thumbnail}
                alt={preset.label}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
              <div className="text-left min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{preset.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{preset.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
