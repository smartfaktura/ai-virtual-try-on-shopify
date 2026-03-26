import React, { useState } from 'react';
import { Download, Sparkles, Play, CheckCircle2, ChevronDown, Image, Video, Zap, SlidersHorizontal, Shield, Ban, Focus, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { TEAM_MEMBERS } from '@/data/teamData';

const RESULTS_TEAM = TEAM_MEMBERS.filter(m => ['Sophia', 'Kenji', 'Zara'].includes(m.name));

export interface GenerationContext {
  categoryLabel: string;
  sceneTypeLabel: string;
  motionGoalTitle: string;
  cameraMotion: string;
  subjectMotion: string;
  duration: string;
  audioMode: string;
  creditsUsed: number;
  realismLevel: string;
  loopStyle: string;
}

export interface QuickVariationPreset {
  id: string;
  label: string;
  icon?: React.ElementType;
  changes: Record<string, string>;
}

export const QUICK_VARIATIONS: QuickVariationPreset[] = [
  { id: 'more_subtle', label: 'More subtle', changes: { motionIntensity: 'low', cameraMotion: 'camera_drift' } },
  { id: 'more_premium', label: 'More premium', changes: { realismLevel: 'ultra_realistic', cameraMotion: 'premium_handheld' } },
  { id: 'more_motion', label: 'More motion', changes: { motionIntensity: 'high' } },
  { id: 'better_loop', label: 'Better loop', changes: { loopStyle: 'seamless_loop' } },
  { id: 'cleaner_camera', label: 'Cleaner camera', changes: { cameraMotion: 'static', motionIntensity: 'low' } },
];

export const CORRECTION_VARIATIONS: QuickVariationPreset[] = [
  { id: 'keep_closer', label: 'Keep closer to original', icon: Shield, changes: { motionIntensity: 'low', preserveScene: 'true', preserveProductDetails: 'true' } },
  { id: 'stronger_fidelity', label: 'Stronger subject fidelity', icon: Eye, changes: { preserveIdentity: 'true', preserveOutfit: 'true', preserveProductDetails: 'true' } },
  { id: 'no_added_objects', label: 'No added objects', icon: Ban, changes: { negativePromptAppend: 'invented objects, added props, new products, random handheld items, hallucinated packaging' } },
  { id: 'cleaner_motion_v2', label: 'Cleaner motion', icon: Focus, changes: { cameraMotion: 'static', motionIntensity: 'low' } },
  { id: 'more_realistic_v2', label: 'More realistic', icon: Focus, changes: { realismLevel: 'ultra_realistic' } },
  { id: 'remove_objects', label: 'Remove added objects', icon: Ban, changes: { negativePromptAppend: 'invented objects, added props, swapped products, new bottles, new accessories', preserveScene: 'true', preserveProductDetails: 'true' } },
  { id: 'strict_preservation', label: 'Rebuild with stricter preservation', icon: Shield, changes: { preserveScene: 'true', preserveProductDetails: 'true', preserveIdentity: 'true', preserveOutfit: 'true', motionIntensity: 'low' } },
];

const ASPECT_RATIO_CLASSES: Record<string, string> = {
  '9:16': 'aspect-[9/16]',
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
};

interface VideoResultsPanelProps {
  videoUrl: string | null;
  sourceImageUrl?: string;
  aspectRatio?: string;
  generationContext?: GenerationContext;
  onReuse?: () => void;
  onVariation?: () => void;
  onNewProject?: () => void;
  onQuickVariation?: (preset: QuickVariationPreset) => void;
}

export const VideoResultsPanel = React.forwardRef<HTMLDivElement, VideoResultsPanelProps>(
  ({ videoUrl, sourceImageUrl, aspectRatio = '16:9', generationContext, onReuse, onVariation, onNewProject, onQuickVariation }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showBeforeAfter, setShowBeforeAfter] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleDownload = () => {
      if (!videoUrl) return;
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `video-${Date.now()}.mp4`;
      a.target = '_blank';
      a.click();
    };

    if (!videoUrl) return null;

    const ctx = generationContext;
    const arClass = ASPECT_RATIO_CLASSES[aspectRatio] || 'aspect-video';

    return (
      <div ref={ref} className="space-y-5">
        {/* Success Header */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your video is ready</h2>
            <p className="text-sm text-muted-foreground">Preview, create variations, or download the final result.</p>
          </div>
          {/* Team avatars */}
          <div className="ml-auto flex -space-x-2 shrink-0">
            {RESULTS_TEAM.map(m => (
              <img key={m.name} src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border-2 border-background object-cover" />
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          {/* Left — Video Player */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-border bg-card">
            {/* Video / Original toggle — above the player */}
            {sourceImageUrl && (
              <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/20">
                <button
                  onClick={() => { setShowBeforeAfter(false); setIsPlaying(true); }}
                  className={cn('flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors', !showBeforeAfter ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground')}
                >
                  <Video className="h-3 w-3" /> Video
                </button>
                <button
                  onClick={() => { setShowBeforeAfter(true); setIsPlaying(false); }}
                  className={cn('flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors', showBeforeAfter ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:text-foreground')}
                >
                  <Image className="h-3 w-3" /> Original
                </button>
              </div>
            )}

            {/* Player area — softer bg, aspect-ratio-aware */}
            <div className="bg-muted/30 flex items-center justify-center p-2">
              {showBeforeAfter && sourceImageUrl ? (
                <div className={cn('relative w-full max-w-full', arClass)}>
                  <img src={sourceImageUrl} alt="Original" className="w-full h-full object-contain rounded-lg" />
                  <Badge variant="secondary" className="absolute top-3 left-3 text-xs">Original Image</Badge>
                </div>
              ) : isPlaying ? (
                <video
                  src={videoUrl}
                  autoPlay
                  loop
                  controls
                  playsInline
                  className={cn('w-full max-w-full object-contain rounded-lg', arClass)}
                />
              ) : (
                <button onClick={() => setIsPlaying(true)} className={cn('relative w-full max-w-full group', arClass)}>
                  {sourceImageUrl ? (
                    <img src={sourceImageUrl} alt="Source" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                      <Play className="h-7 w-7 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right — Details + Quick Variations + Corrections */}
          <div className="space-y-4">
            {/* Generation Details Card */}
            {ctx && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Generation Details</h3>
                <div className="space-y-2 text-sm">
                  <DetailRow label="Motion Goal" value={ctx.motionGoalTitle} />
                  <DetailRow label="Category" value={ctx.categoryLabel} />
                  <DetailRow label="Scene Type" value={ctx.sceneTypeLabel} />
                  <DetailRow label="Camera" value={ctx.cameraMotion} />
                  <DetailRow label="Subject" value={ctx.subjectMotion} />
                  <DetailRow label="Duration" value={ctx.duration} />
                  <DetailRow label="Audio" value={ctx.audioMode} />
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-muted-foreground text-xs">Credits used</span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-primary" />
                      {ctx.creditsUsed}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Variations */}
            {onQuickVariation && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Quick Variations</h3>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_VARIATIONS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => onQuickVariation(preset)}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors bg-background"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Correction Actions */}
            {onQuickVariation && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Quick Corrections</h3>
                <div className="flex flex-wrap gap-1.5">
                  {CORRECTION_VARIATIONS.map(preset => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => onQuickVariation(preset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors bg-background"
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons — Clear hierarchy */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download Video
          </Button>
          {onReuse && (
            <Button variant="outline" onClick={onReuse} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Adjust Motion
            </Button>
          )}
          {onNewProject && (
            <Button variant="ghost" size="sm" onClick={onNewProject} className="text-muted-foreground">
              Start New Video
            </Button>
          )}
        </div>

        {/* Used Settings Accordion */}
        {ctx && (
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <ChevronDown className={cn('h-4 w-4 transition-transform', settingsOpen && 'rotate-180')} />
              Used Settings
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="rounded-lg border border-border bg-muted/20 p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <DetailRow label="Realism" value={ctx.realismLevel} />
                <DetailRow label="Loop Style" value={ctx.loopStyle} />
                <DetailRow label="Camera Motion" value={ctx.cameraMotion} />
                <DetailRow label="Subject Motion" value={ctx.subjectMotion} />
                <DetailRow label="Duration" value={ctx.duration} />
                <DetailRow label="Audio" value={ctx.audioMode} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  }
);

VideoResultsPanel.displayName = 'VideoResultsPanel';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-xs font-medium text-foreground capitalize">{value.replace(/_/g, ' ')}</span>
    </div>
  );
}
