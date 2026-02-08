import {
  Square, Smartphone, RectangleHorizontal, ChevronDown,
  Minus, Plus, Wand2, Image as ImageIcon,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ModelSelectorChip } from './ModelSelectorChip';
import { SceneSelectorChip } from './SceneSelectorChip';
import type { ModelProfile } from '@/types';
import type { TryOnPose } from '@/types';

export type FreestyleAspectRatio = '1:1' | '3:4' | '4:5' | '16:9';

const ASPECT_RATIOS: { value: FreestyleAspectRatio; label: string; icon: typeof Square }[] = [
  { value: '1:1', label: '1:1', icon: Square },
  { value: '3:4', label: '3:4', icon: Smartphone },
  { value: '4:5', label: '4:5', icon: Smartphone },
  { value: '16:9', label: '16:9', icon: RectangleHorizontal },
];

interface FreestyleSettingsChipsProps {
  selectedModel: ModelProfile | null;
  onModelSelect: (model: ModelProfile | null) => void;
  modelPopoverOpen: boolean;
  onModelPopoverChange: (open: boolean) => void;
  selectedScene: TryOnPose | null;
  onSceneSelect: (scene: TryOnPose | null) => void;
  scenePopoverOpen: boolean;
  onScenePopoverChange: (open: boolean) => void;
  aspectRatio: FreestyleAspectRatio;
  onAspectRatioChange: (ar: FreestyleAspectRatio) => void;
  quality: 'standard' | 'high';
  onQualityToggle: () => void;
  polishPrompt: boolean;
  onPolishChange: (v: boolean) => void;
  imageCount: number;
  onImageCountChange: (count: number) => void;
}

export function FreestyleSettingsChips({
  selectedModel, onModelSelect, modelPopoverOpen, onModelPopoverChange,
  selectedScene, onSceneSelect, scenePopoverOpen, onScenePopoverChange,
  aspectRatio, onAspectRatioChange,
  quality, onQualityToggle,
  polishPrompt, onPolishChange,
  imageCount, onImageCountChange,
}: FreestyleSettingsChipsProps) {
  const [aspectPopoverOpen, setAspectPopoverOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Model Selector */}
      <ModelSelectorChip
        selectedModel={selectedModel}
        open={modelPopoverOpen}
        onOpenChange={onModelPopoverChange}
        onSelect={onModelSelect}
      />

      {/* Scene Selector */}
      <SceneSelectorChip
        selectedScene={selectedScene}
        open={scenePopoverOpen}
        onOpenChange={onScenePopoverChange}
        onSelect={onSceneSelect}
      />

      {/* Aspect Ratio */}
      <Popover open={aspectPopoverOpen} onOpenChange={setAspectPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.04] text-sidebar-foreground/80 hover:bg-white/[0.08] transition-colors">
            <Square className="w-3.5 h-3.5" />
            {aspectRatio}
            <ChevronDown className="w-3 h-3 opacity-40" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2" align="start">
          {ASPECT_RATIOS.map(ar => (
            <button
              key={ar.value}
              onClick={() => { onAspectRatioChange(ar.value); setAspectPopoverOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                aspectRatio === ar.value ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              )}
            >
              <ar.icon className="w-3.5 h-3.5" />
              {ar.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Quality Toggle */}
      <button
        onClick={onQualityToggle}
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-colors',
          quality === 'high'
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-white/[0.08] bg-white/[0.04] text-sidebar-foreground/80 hover:bg-white/[0.08]'
        )}
      >
        {quality === 'high' ? '✦ High' : 'Standard'}
      </button>

      {/* Prompt Polish Toggle */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.04] text-sidebar-foreground/80">
        <Wand2 className="w-3.5 h-3.5" />
        Polish
        <Switch
          checked={polishPrompt}
          onCheckedChange={onPolishChange}
          className="scale-75 -my-1"
        />
      </div>

      {/* Image Count Stepper */}
      <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.04] text-sidebar-foreground/80">
        <button
          onClick={() => onImageCountChange(Math.max(1, imageCount - 1))}
          disabled={imageCount <= 1}
          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-5 text-center tabular-nums">{imageCount}</span>
        <button
          onClick={() => onImageCountChange(Math.min(4, imageCount + 1))}
          disabled={imageCount >= 4}
          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
        <ImageIcon className="w-3.5 h-3.5 ml-0.5" />
      </div>
    </div>
  );
}

import React from 'react';
