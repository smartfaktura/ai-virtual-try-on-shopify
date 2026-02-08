import React from 'react';
import { Palette, ChevronDown, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type BrandProfile = Tables<'brand_profiles'>;

interface BrandProfileChipProps {
  selectedProfile: BrandProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (profile: BrandProfile | null) => void;
  profiles: BrandProfile[];
  isLoading: boolean;
}

const toneEmoji: Record<string, string> = {
  luxury: '✦',
  clean: '○',
  bold: '◆',
  minimal: '—',
  playful: '◕',
};

export function BrandProfileChip({
  selectedProfile, open, onOpenChange, onSelect, profiles, isLoading,
}: BrandProfileChipProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors',
                selectedProfile
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-muted/50 text-foreground/70 hover:bg-muted'
              )}
            >
              <Palette className="w-3.5 h-3.5" />
              {selectedProfile ? (
                <>
                  <span className="max-w-[80px] truncate">{selectedProfile.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(null); }}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <>
                  Brand
                  <ChevronDown className="w-3 h-3 opacity-40" />
                </>
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          Apply a saved brand profile to control tone, lighting, and style.
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-72 p-2" align="start">
        <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Brand Profiles</p>
        {isLoading ? (
          <div className="px-3 py-4 text-xs text-muted-foreground text-center">Loading…</div>
        ) : profiles.length === 0 ? (
          <div className="px-3 py-4 text-xs text-muted-foreground text-center">
            No profiles yet. Create one in Brand Profiles.
          </div>
        ) : (
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => { onSelect(profile); onOpenChange(false); }}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                  selectedProfile?.id === profile.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60">{toneEmoji[profile.tone] || '●'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate text-xs">{profile.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {profile.tone} · {profile.lighting_style} · {profile.color_temperature}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
