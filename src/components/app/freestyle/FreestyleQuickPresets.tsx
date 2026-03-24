import React from 'react';
import { cn } from '@/lib/utils';
import { mockModels, mockTryOnPoses } from '@/data/mockData';
import { TEAM_MEMBERS } from '@/data/teamData';
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

const amara = TEAM_MEMBERS.find(m => m.name === 'Amara')!;

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'canon_dining',
    label: 'Canon G7X Dining',
    subtitle: 'Hannah · Warm ambiance',
    modelId: 'model_050',
    poseId: 'pose_014',
    prompt: 'Canon G7X style dining scene, warm natural light, intimate atmosphere',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_014')?.previewUrl || '',
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
    id: 'skatepark_golden',
    label: 'Skatepark Golden Hour',
    subtitle: 'Freya · Urban energy',
    modelId: 'model_029',
    poseId: 'pose_022',
    prompt: 'Skatepark golden hour photoshoot, warm sunset light, urban energy',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_022')?.previewUrl || '',
  },
  {
    id: 'industrial_light',
    label: 'Industrial Light Play',
    subtitle: 'Sienna · Raw textures',
    modelId: 'model_033',
    poseId: 'pose_023',
    prompt: 'Industrial location, dramatic directional light, raw concrete textures',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_023')?.previewUrl || '',
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
    id: 'earthy_woodland',
    label: 'Earthy Woodland Product',
    subtitle: 'Olivia · Organic tones',
    modelId: 'model_035',
    poseId: 'pose_029',
    prompt: 'Earthy woodland setting, warm natural tones, organic textures, soft light',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_029')?.previewUrl || '',
  },
  {
    id: 'amber_studio',
    label: 'Amber Glow Studio',
    subtitle: 'Zara · Golden tones',
    modelId: 'model_031',
    poseId: 'pose_001',
    prompt: 'Amber warm studio glow, golden-toned studio lighting, rich atmosphere',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_001')?.previewUrl || '',
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
  {
    id: 'pilates_glow',
    label: 'Pilates Studio Glow',
    subtitle: 'Luna · Fitness space',
    modelId: 'model_040',
    poseId: 'pose_025',
    prompt: 'Bright pilates studio, soft diffused light, clean minimal fitness space',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_025')?.previewUrl || '',
  },
  {
    id: 'elevator_chic',
    label: 'Elevator Chic',
    subtitle: 'Sienna · Reflective surfaces',
    modelId: 'model_033',
    poseId: 'pose_005',
    prompt: 'Luxury elevator editorial, reflective surfaces, dramatic overhead light',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_005')?.previewUrl || '',
  },
  {
    id: 'natural_loft',
    label: 'Natural Light Loft',
    subtitle: 'Zara · Window light',
    modelId: 'model_031',
    poseId: 'pose_030',
    prompt: 'Spacious loft with floor-to-ceiling windows, natural light flooding in',
    thumbnail: mockTryOnPoses.find(p => p.poseId === 'pose_030')?.previewUrl || '',
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
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <img
          src={amara.avatar}
          alt={amara.name}
          className="w-6 h-6 rounded-full object-cover ring-1 ring-border"
        />
        <p className="text-xs font-semibold text-foreground">
          {amara.name} picked these for you
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mb-3">
        Tap a scene to get started
      </p>

      <div className="relative">
        {/* Mobile scroll fade hints */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 lg:hidden" />

        <div className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none lg:flex-wrap lg:overflow-visible lg:justify-center">
          {QUICK_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset)}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all snap-start shrink-0',
                  'hover:border-primary/50 hover:bg-accent/50 active:scale-[0.98]',
                  isActive
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border/60 bg-background'
                )}
              >
                <img
                  src={preset.thumbnail}
                  alt={preset.label}
                  className="w-11 h-11 rounded-lg object-cover shrink-0"
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
    </div>
  );
}
