import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { mockModels, mockTryOnPoses } from '@/data/mockData';
import { TEAM_MEMBERS } from '@/data/teamData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ModelProfile, TryOnPose } from '@/types';

export interface QuickPreset {
  id: string;
  label: string;
  subtitle: string;
  modelId: string;
  poseId: string;
  prompt: string;
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
  },
  {
    id: 'preset_studio',
    label: 'Studio Clean',
    subtitle: 'Zara · Studio Front',
    modelId: 'model_031',
    poseId: 'pose_001',
    prompt: 'Clean studio product photography, white backdrop, professional lighting',
  },
  {
    id: 'skatepark_golden',
    label: 'Skatepark Golden Hour',
    subtitle: 'Freya · Urban energy',
    modelId: 'model_029',
    poseId: 'pose_022',
    prompt: 'Skatepark golden hour photoshoot, warm sunset light, urban energy',
  },
  {
    id: 'industrial_light',
    label: 'Industrial Light Play',
    subtitle: 'Sienna · Raw textures',
    modelId: 'model_033',
    poseId: 'pose_023',
    prompt: 'Industrial location, dramatic directional light, raw concrete textures',
  },
  {
    id: 'preset_editorial',
    label: 'Editorial Moody',
    subtitle: 'Sienna · Dramatic Light',
    modelId: 'model_033',
    poseId: 'pose_019',
    prompt: 'Moody editorial fashion shoot, dramatic lighting, dark atmosphere',
  },
  {
    id: 'earthy_woodland',
    label: 'Earthy Woodland Product',
    subtitle: 'Olivia · Organic tones',
    modelId: 'model_035',
    poseId: 'pose_029',
    prompt: 'Earthy woodland setting, warm natural tones, organic textures, soft light',
  },
  {
    id: 'amber_studio',
    label: 'Amber Glow Studio',
    subtitle: 'Zara · Golden tones',
    modelId: 'model_031',
    poseId: 'pose_001',
    prompt: 'Amber warm studio glow, golden-toned studio lighting, rich atmosphere',
  },
  {
    id: 'preset_cafe',
    label: 'Café Morning',
    subtitle: 'Hannah · Coffee Shop',
    modelId: 'model_050',
    poseId: 'pose_014',
    prompt: 'Morning café lifestyle shoot, natural window light, cozy atmosphere',
  },
  {
    id: 'pilates_glow',
    label: 'Pilates Studio Glow',
    subtitle: 'Natalie · Fitness space',
    modelId: 'model_054',
    poseId: 'pose_025',
    prompt: 'Bright pilates studio, soft diffused light, clean minimal fitness space',
  },
  {
    id: 'elevator_chic',
    label: 'Elevator Chic',
    subtitle: 'Sienna · Reflective surfaces',
    modelId: 'model_033',
    poseId: 'pose_005',
    prompt: 'Luxury elevator editorial, reflective surfaces, dramatic overhead light',
  },
  {
    id: 'natural_loft',
    label: 'Natural Light Loft',
    subtitle: 'Zara · Window light',
    modelId: 'model_031',
    poseId: 'pose_030',
    prompt: 'Spacious loft with floor-to-ceiling windows, natural light flooding in',
  },
];

interface FreestyleQuickPresetsProps {
  onSelect: (preset: QuickPreset, model: ModelProfile, scene: TryOnPose) => void;
  activePresetId?: string | null;
}

export function FreestyleQuickPresets({ onSelect, activePresetId }: FreestyleQuickPresetsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  };

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

      <div className="relative group">
        {/* Fade hints */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />
        )}

        {/* Desktop arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 hidden lg:flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border shadow-sm hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
        >
          {QUICK_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            const model = mockModels.find(m => m.modelId === preset.modelId);
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
                  src={model?.previewUrl || ''}
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
