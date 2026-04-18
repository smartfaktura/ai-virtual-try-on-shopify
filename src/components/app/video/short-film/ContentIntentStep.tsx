/**
 * Wizard Step: Content Intent
 *
 * Required: contentIntent + platform.
 * Optional (Advanced): soundMode, paceMode, productPriority, endingStyle,
 * audience/offer context, clarityFirstMode toggle.
 */
import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  INTENT_OPTIONS, PLATFORM_OPTIONS, SOUND_MODE_OPTIONS,
  PACE_OPTIONS, PRODUCT_PRIORITY_OPTIONS, ENDING_STYLE_OPTIONS,
} from '@/lib/commerceVideo/contentIntents';
import {
  CLARITY_FIRST_INTENTS,
  type ContentIntent, type Platform, type SoundMode, type PaceMode,
  type ProductPriority, type EndingStyle,
} from '@/types/commerceVideo';

export interface ContentIntentStepValue {
  contentIntent: ContentIntent | null;
  platform: Platform;
  soundMode: SoundMode;
  paceMode: PaceMode;
  productPriority: ProductPriority;
  endingStyle: EndingStyle;
  audienceContext?: string;
  offerContext?: string;
  clarityFirstMode: boolean;
}

interface ContentIntentStepProps {
  value: ContentIntentStepValue;
  onChange: (next: ContentIntentStepValue) => void;
}

export function ContentIntentStep({ value, onChange }: ContentIntentStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = <K extends keyof ContentIntentStepValue>(k: K, v: ContentIntentStepValue[K]) => {
    onChange({ ...value, [k]: v });
  };

  const handleIntentSelect = (intent: ContentIntent) => {
    // Auto-suggest clarity-first based on intent (user can still override below)
    const suggestedClarity = CLARITY_FIRST_INTENTS.includes(intent);
    onChange({
      ...value,
      contentIntent: intent,
      clarityFirstMode: suggestedClarity,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Step · Content Intent
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          What kind of video are you making?
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          This shapes pacing, voiceover, ending and product-clarity rules. Pick the closest match — you can fine-tune later.
        </p>
      </div>

      {/* Intent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {INTENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = value.contentIntent === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleIntentSelect(opt.value)}
              className={cn(
                'group text-left rounded-2xl border p-4 transition-all duration-200',
                'bg-white/[0.02] hover:bg-white/[0.04]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isActive
                  ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                  : 'border-border/60 hover:border-border',
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                  isActive ? 'bg-primary/15 text-primary' : 'bg-muted/60 text-muted-foreground group-hover:text-foreground',
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={cn(
                      'text-sm font-medium tracking-tight',
                      isActive ? 'text-foreground' : 'text-foreground/90',
                    )}>{opt.label}</p>
                    {opt.recommendsClarityFirst && (
                      <span className="text-[9px] uppercase tracking-wider text-primary/80 font-semibold px-1.5 py-0.5 rounded bg-primary/10">
                        Clarity
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{opt.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Platform pills */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
          Platform
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORM_OPTIONS.map((p) => {
            const Icon = p.icon;
            const isActive = value.platform === p.value;
            return (
              <button
                key={p.value}
                onClick={() => update('platform', p.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border/60 hover:border-border hover:text-foreground',
                )}
              >
                <Icon className="w-3 h-3" />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clarity-first toggle */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-white/[0.02] p-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            {value.clarityFirstMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-tight">Clarity-first mode</p>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
              Prioritize product readability over abstract framing. Recommended for PDP, showcase and detail films.
            </p>
          </div>
        </div>
        <Switch
          checked={value.clarityFirstMode}
          onCheckedChange={(v) => update('clarityFirstMode', v)}
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced((s) => !s)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Advanced options
      </button>

      {showAdvanced && (
        <div className="space-y-6 rounded-2xl border border-border/60 bg-white/[0.02] p-5">
          {/* Sound mode */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Sound mode
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
              {SOUND_MODE_OPTIONS.map((s) => {
                const isActive = value.soundMode === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => update('soundMode', s.value)}
                    className={cn(
                      'text-left px-3 py-2 rounded-xl border text-xs transition-all',
                      isActive
                        ? 'border-primary/60 bg-primary/[0.08] text-foreground'
                        : 'border-border/60 hover:border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <p className="font-medium">{s.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5">{s.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pace */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Pacing
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PACE_OPTIONS.map((p) => {
                const isActive = value.paceMode === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => update('paceMode', p.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs transition-all',
                      isActive ? 'border-primary/60 bg-primary/[0.08] text-foreground' : 'border-border/60 text-muted-foreground hover:text-foreground',
                    )}
                    title={p.hint}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product priority */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Product priority
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCT_PRIORITY_OPTIONS.map((p) => {
                const isActive = value.productPriority === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => update('productPriority', p.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs transition-all',
                      isActive ? 'border-primary/60 bg-primary/[0.08] text-foreground' : 'border-border/60 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ending */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Ending style
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {ENDING_STYLE_OPTIONS.map((e) => {
                const isActive = value.endingStyle === e.value;
                return (
                  <button
                    key={e.value}
                    onClick={() => update('endingStyle', e.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs transition-all',
                      isActive ? 'border-primary/60 bg-primary/[0.08] text-foreground' : 'border-border/60 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {e.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audience + offer text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Audience (optional)</Label>
              <Input
                value={value.audienceContext ?? ''}
                onChange={(e) => update('audienceContext', e.target.value)}
                placeholder="e.g. Gen-Z skincare buyers"
                className="bg-white/[0.02]"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Offer (optional)</Label>
              <Input
                value={value.offerContext ?? ''}
                onChange={(e) => update('offerContext', e.target.value)}
                placeholder="e.g. New launch, free shipping"
                className="bg-white/[0.02]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
