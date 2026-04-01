import React, { useState } from 'react';
import { Download, Sparkles, Play, CheckCircle2, ChevronDown, Image, Video, Zap, SlidersHorizontal, Shield, Ban, Focus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TEAM_MEMBERS } from '@/data/teamData';
import { CorrectionConfirmModal } from './CorrectionConfirmModal';
import { getOptimizedUrl } from '@/lib/imageOptimization';

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
  description: string;
  icon?: React.ElementType;
  changes: Record<string, string>;
}

export const QUICK_VARIATIONS: QuickVariationPreset[] = [
  { id: 'more_subtle', label: 'More subtle', description: 'Reduces motion intensity and softens camera movement for a calmer, more refined result.', changes: { motionIntensity: 'low', cameraMotion: 'camera_drift' } },
  { id: 'more_premium', label: 'More premium', description: 'Increases realism and applies premium handheld camera feel for a polished, cinematic look.', changes: { realismLevel: 'ultra_realistic', cameraMotion: 'premium_handheld' } },
  { id: 'more_motion', label: 'More motion', description: 'Boosts motion intensity for more dynamic, eye-catching movement throughout the video.', changes: { motionIntensity: 'high' } },
  { id: 'better_loop', label: 'Better loop', description: 'Optimizes the video for seamless looping — perfect for social media autoplay and website backgrounds.', changes: { loopStyle: 'seamless_loop' } },
  { id: 'cleaner_camera', label: 'Cleaner camera', description: 'Locks the camera to a static position with minimal motion for a steady, focused result.', changes: { cameraMotion: 'static', motionIntensity: 'low' } },
];

export const CORRECTION_VARIATIONS: QuickVariationPreset[] = [
  { id: 'keep_closer', label: 'Keep closer to original', description: 'Maximizes preservation of the original image — tighter identity, scene, and product fidelity with minimal motion.', icon: Shield, changes: { motionIntensity: 'low', preserveScene: 'true', preserveProductDetails: 'true' } },
  { id: 'stronger_fidelity', label: 'Stronger subject fidelity', description: 'Locks down identity, outfit, and product details to prevent the AI from changing the subject appearance.', icon: Eye, changes: { preserveIdentity: 'true', preserveOutfit: 'true', preserveProductDetails: 'true' } },
  { id: 'no_added_objects', label: 'No added objects', description: 'Adds explicit negative prompts to prevent the AI from inventing products, props, or objects not in your source image.', icon: Ban, changes: { negativePromptAppend: 'invented objects, added props, new products, random handheld items, hallucinated packaging' } },
  { id: 'cleaner_motion_v2', label: 'Cleaner motion', description: 'Reduces camera and subject motion to the minimum for a cleaner, distraction-free result.', icon: Focus, changes: { cameraMotion: 'static', motionIntensity: 'low' } },
  { id: 'more_realistic_v2', label: 'More realistic', description: 'Pushes the realism level to ultra-realistic for maximum photographic fidelity in the output.', icon: Focus, changes: { realismLevel: 'ultra_realistic' } },
  { id: 'remove_objects', label: 'Remove added objects', description: 'Strongly suppresses hallucinated objects while preserving the original scene and product details.', icon: Ban, changes: { negativePromptAppend: 'invented objects, added props, swapped products, new bottles, new accessories', preserveScene: 'true', preserveProductDetails: 'true' } },
  { id: 'strict_preservation', label: 'Rebuild with stricter preservation', description: 'Rebuilds the video with maximum preservation across all dimensions — scene, product, identity, and outfit.', icon: Shield, changes: { preserveScene: 'true', preserveProductDetails: 'true', preserveIdentity: 'true', preserveOutfit: 'true', motionIntensity: 'low' } },
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
  creditCost?: number;
  creditsRemaining?: number;
  onReuse?: () => void;
  onVariation?: () => void;
  onNewProject?: () => void;
  onQuickVariation?: (preset: QuickVariationPreset) => void;
}

export const VideoResultsPanel = React.forwardRef<HTMLDivElement, VideoResultsPanelProps>(
  ({ videoUrl, sourceImageUrl, aspectRatio = '16:9', generationContext, creditCost = 10, creditsRemaining = 0, onReuse, onNewProject, onQuickVariation }, ref) => {
    const [showBeforeAfter, setShowBeforeAfter] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [confirmPreset, setConfirmPreset] = useState<QuickVariationPreset | null>(null);

    const handleDownload = async () => {
      if (!videoUrl) return;
      try {
        const res = await fetch(videoUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-${generationContext?.cameraMotion || Date.now()}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error('Failed to download video');
      }
    };

    const handleChipClick = (preset: QuickVariationPreset) => {
      setConfirmPreset(preset);
    };

    const handleConfirm = () => {
      if (confirmPreset && onQuickVariation) {
        onQuickVariation(confirmPreset);
      }
      setConfirmPreset(null);
    };

    if (!videoUrl) return null;

    const ctx = generationContext;
    const arClass = ASPECT_RATIO_CLASSES[aspectRatio] || 'aspect-video';

    return (
      <div ref={ref} className="space-y-6">
        {/* Success Header */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your video is ready</h2>
            <p className="text-sm text-muted-foreground">Preview, create variations, or download the final result.</p>
          </div>
          <div className="ml-auto flex -space-x-2 shrink-0">
            {RESULTS_TEAM.map(m => (
              <img key={m.name} src={getOptimizedUrl(m.avatar, { quality: 60 })} alt={m.name} className="w-7 h-7 rounded-full border-2 border-background object-cover" />
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Left — Video Player */}
          <div className="rounded-2xl overflow-hidden shadow-lg bg-card">
            {/* Video / Original toggle */}
            {sourceImageUrl && (
              <div className="flex items-center gap-1 px-3 py-2 bg-muted/20">
                <div className="inline-flex items-center gap-0.5 rounded-full bg-muted/50 p-0.5">
                  <button
                    onClick={() => setShowBeforeAfter(false)}
                    className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all', !showBeforeAfter ? 'bg-background text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Video className="h-3 w-3" /> Video
                  </button>
                  <button
                    onClick={() => setShowBeforeAfter(true)}
                    className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all', showBeforeAfter ? 'bg-background text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Image className="h-3 w-3" /> Original
                  </button>
                </div>
              </div>
            )}

            {/* Player area */}
            <div className="bg-gradient-to-b from-muted/10 to-muted/30 p-2">
              {showBeforeAfter && sourceImageUrl ? (
                <div className="relative w-full">
                  <img src={sourceImageUrl} alt="Original" className="w-full rounded-lg" />
                  <Badge variant="secondary" className="absolute top-3 left-3 text-xs">Original Image</Badge>
                </div>
              ) : (
                <video
                  src={videoUrl}
                  autoPlay
                  loop
                  controls
                  playsInline
                  className="w-full rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Right — Details + Variations */}
          <div className="space-y-5">
            {/* Generation Details */}
            {ctx && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Generation Details</h3>
                <div className="rounded-xl bg-muted/10 p-4 space-y-2 text-sm">
                  <DetailRow label="Motion Goal" value={ctx.motionGoalTitle} />
                  <DetailRow label="Category" value={ctx.categoryLabel} />
                  <DetailRow label="Scene Type" value={ctx.sceneTypeLabel} />
                  <DetailRow label="Camera" value={ctx.cameraMotion} />
                  <DetailRow label="Subject" value={ctx.subjectMotion} />
                  <DetailRow label="Duration" value={ctx.duration} />
                  <DetailRow label="Audio" value={ctx.audioMode} />
                  <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-border/50">
                    <span className="text-muted-foreground text-xs">Credits used</span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-primary" />
                      {ctx.creditsUsed}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Variations & Corrections — merged */}
            {onQuickVariation && (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Quick Variations</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_VARIATIONS.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleChipClick(preset)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all bg-muted/10"
                      >
                        {preset.label}
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                          <Zap className="h-2.5 w-2.5" />{creditCost}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Quick Corrections</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {CORRECTION_VARIATIONS.map(preset => {
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleChipClick(preset)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all bg-muted/10"
                        >
                          {Icon && <Icon className="h-3 w-3" />}
                          {preset.label}
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                            <Zap className="h-2.5 w-2.5" />{creditCost}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
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
              <div className="rounded-xl bg-muted/10 p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
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

        {/* Confirmation Modal */}
        <CorrectionConfirmModal
          open={!!confirmPreset}
          onOpenChange={(open) => { if (!open) setConfirmPreset(null); }}
          presetLabel={confirmPreset?.label || ''}
          presetDescription={confirmPreset?.description || ''}
          creditCost={creditCost}
          creditsRemaining={creditsRemaining}
          onConfirm={handleConfirm}
        />
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
