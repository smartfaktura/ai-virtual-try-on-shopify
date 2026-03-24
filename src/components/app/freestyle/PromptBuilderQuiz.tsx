import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Sparkles, Check, ArrowLeft, ArrowRight, Wand2, Pencil, Shirt, Wind, Gem, Watch, Lamp, Smartphone, Heart, Package, UtensilsCrossed, Dumbbell,
  User, Users, Hand, Eye, Frame, Camera, Sun, Home, TreePine, Palette, Zap, Flame, Leaf, Crown, LayoutGrid, GripHorizontal, Move3D, Focus, ScanFace } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  type QuizCategory, type SubjectType, type InteractionType, type SettingType, type MoodType, type FramingType, type QuizAnswers,
  CATEGORY_LABELS, getSubjectOptions, getInteractionOptions, getFramingOptions, assemblePrompt,
} from '@/lib/promptBuilderTemplates';

// ——— Category short descriptions ———
const CATEGORY_DESCRIPTIONS: Record<QuizCategory, string> = {
  fashion: 'Clothing, shoes',
  beauty: 'Skincare, makeup',
  fragrances: 'Perfumes, scents',
  jewelry: 'Rings, necklaces',
  accessories: 'Bags, watches',
  home: 'Furniture, decor',
  food: 'Drinks, snacks',
  electronics: 'Gadgets, tech',
  sports: 'Activewear, gear',
  health: 'Vitamins, wellness',
  other: 'Everything else',
};

// ——— Icon mapping ———
const CATEGORY_ICON_MAP: Record<QuizCategory, React.ReactNode> = {
  fashion: <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />,
  beauty: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
  fragrances: <Wind className="w-4 h-4 sm:w-5 sm:h-5" />,
  jewelry: <Gem className="w-4 h-4 sm:w-5 sm:h-5" />,
  accessories: <Watch className="w-4 h-4 sm:w-5 sm:h-5" />,
  home: <Lamp className="w-4 h-4 sm:w-5 sm:h-5" />,
  food: <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />,
  electronics: <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />,
  sports: <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />,
  health: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />,
  other: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
};

const SUBJECT_ICON_MAP: Record<SubjectType, React.ReactNode> = {
  'single-model': <User className="w-4 h-4 sm:w-5 sm:h-5" />,
  'multiple-models': <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
  faceless: <Hand className="w-4 h-4 sm:w-5 sm:h-5" />,
  'on-surface': <GripHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />,
  floating: <Move3D className="w-4 h-4 sm:w-5 sm:h-5" />,
  'flat-lay': <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />,
};

const SETTING_ICON_MAP: Record<SettingType, React.ReactNode> = {
  studio: <Camera className="w-4 h-4 sm:w-5 sm:h-5" />,
  indoor: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
  outdoor: <TreePine className="w-4 h-4 sm:w-5 sm:h-5" />,
  editorial: <Palette className="w-4 h-4 sm:w-5 sm:h-5" />,
  'ai-decide': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
};

const MOOD_ICON_MAP: Record<MoodType, React.ReactNode> = {
  luxury: <Crown className="w-4 h-4 sm:w-5 sm:h-5" />,
  minimal: <Frame className="w-4 h-4 sm:w-5 sm:h-5" />,
  bold: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
  warm: <Flame className="w-4 h-4 sm:w-5 sm:h-5" />,
  organic: <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />,
};

const FRAMING_ICON_MAP: Record<FramingType, React.ReactNode> = {
  'full-body': <User className="w-4 h-4 sm:w-5 sm:h-5" />,
  'upper-body': <ScanFace className="w-4 h-4 sm:w-5 sm:h-5" />,
  'close-up': <Focus className="w-4 h-4 sm:w-5 sm:h-5" />,
  'side-profile': <Eye className="w-4 h-4 sm:w-5 sm:h-5" />,
  'hand-focus': <Hand className="w-4 h-4 sm:w-5 sm:h-5" />,
};

const INTERACTION_ICON_MAP: Record<InteractionType, React.ReactNode> = {
  worn: <Shirt className="w-4 h-4" />,
  held: <Hand className="w-4 h-4" />,
  'placed-nearby': <GripHorizontal className="w-4 h-4" />,
  background: <Eye className="w-4 h-4" />,
};

// ——— Option Card ———
function OptionCard({ value, label, description, icon, selected, onClick }: {
  value: string; label: string; description: string; icon: React.ReactNode; selected: boolean; onClick: (v: any) => void;
}) {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        'relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border transition-all text-center',
        'hover:shadow-sm hover:border-primary/40',
        selected
          ? 'border-primary bg-primary/8 shadow-sm ring-1 ring-primary/20'
          : 'border-border/50 bg-card hover:bg-accent/30'
      )}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="w-2.5 h-2.5" />
        </div>
      )}
      <div className={cn('text-muted-foreground transition-colors', selected && 'text-primary')}>{icon}</div>
      <span className="text-xs sm:text-sm font-medium leading-tight">{label}</span>
      {description && <span className="text-[10px] sm:text-[11px] text-muted-foreground/70 leading-tight">{description}</span>}
    </button>
  );
}

// ——— Section Label Pill ———
function SectionPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border/40">
      {children}
    </span>
  );
}

// ——— Main Quiz Component ———
interface PromptBuilderQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsePrompt: (prompt: string) => void;
}

export function PromptBuilderQuiz({ open, onOpenChange, onUsePrompt }: PromptBuilderQuizProps) {
  const isMobile = useIsMobile();
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [subject, setSubject] = useState<SubjectType | null>(null);
  const [interaction, setInteraction] = useState<InteractionType | null>(null);
  const [setting, setSetting] = useState<SettingType | null>(null);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [framing, setFraming] = useState<FramingType | null>(null);
  const [editablePrompt, setEditablePrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isPerson = subject ? ['single-model', 'multiple-models', 'faceless'].includes(subject) : false;

  // Build step list dynamically
  const steps = useMemo(() => {
    const s = ['category', 'subject', 'setting', 'review'];
    if (isPerson) s.splice(2, 0, 'interaction');
    if (isPerson) s.splice(s.indexOf('review'), 0, 'framing');
    s.splice(s.indexOf('setting') + 1, 0, 'mood');
    return s;
  }, [isPerson]);

  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex] || 'category';
  const totalSteps = steps.length;
  const progressPercent = ((stepIndex + 1) / totalSteps) * 100;

  const canAdvance = (() => {
    switch (currentStep) {
      case 'category': return !!category;
      case 'subject': return !!subject;
      case 'interaction': return !!interaction;
      case 'setting': return !!setting;
      case 'mood': return !!mood;
      case 'framing': return !!framing;
      case 'review': return true;
      default: return false;
    }
  })();

  const handleNext = useCallback(() => {
    if (currentStep === 'review') return;
    if (steps[stepIndex + 1] === 'review') {
      const answers: QuizAnswers = {
        category: category!,
        subject: subject!,
        interaction: isPerson ? interaction! : undefined,
        setting: setting!,
        mood: mood!,
        framing: isPerson ? framing! : undefined,
      };
      setEditablePrompt(assemblePrompt(answers));
    }
    setStepIndex(i => i + 1);
  }, [currentStep, stepIndex, steps, category, subject, interaction, setting, mood, framing, isPerson]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  }, [stepIndex]);

  const handleUse = useCallback(() => {
    onUsePrompt(editablePrompt);
    onOpenChange(false);
    setStepIndex(0);
    setCategory(null);
    setSubject(null);
    setInteraction(null);
    setSetting(null);
    setMood(null);
    setFraming(null);
    setIsEditing(false);
  }, [editablePrompt, onUsePrompt, onOpenChange]);

  const handleOpenChange = useCallback((v: boolean) => {
    if (!v) {
      setStepIndex(0);
      setCategory(null);
      setSubject(null);
      setInteraction(null);
      setSetting(null);
      setMood(null);
      setFraming(null);
      setIsEditing(false);
    }
    onOpenChange(v);
  }, [onOpenChange]);

  // ——— Step renderers ———
  const renderCategoryStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">What are you creating content for?</h3>
        <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5">Pick the category that best matches your product</p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
        {(Object.keys(CATEGORY_LABELS) as QuizCategory[]).map(cat => (
          <OptionCard
            key={cat}
            value={cat}
            label={CATEGORY_LABELS[cat]}
            description={CATEGORY_DESCRIPTIONS[cat]}
            icon={CATEGORY_ICON_MAP[cat]}
            selected={category === cat}
            onClick={(v) => { setCategory(v); setSubject(null); setInteraction(null); }}
          />
        ))}
      </div>
    </div>
  );

  const renderSubjectStep = () => {
    const opts = getSubjectOptions(category!);
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Who or what is the main subject?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5">Choose how your product should be presented</p>
        </div>
        <div>
          <div className="mb-2.5"><SectionPill>With Person</SectionPill></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
            {opts.withPerson.map(o => (
              <OptionCard key={o.value} {...o} icon={SUBJECT_ICON_MAP[o.value]} selected={subject === o.value} onClick={(v) => { setSubject(v); setInteraction(null); setFraming(null); }} />
            ))}
          </div>
          <div className="mb-2.5"><SectionPill>Product Only</SectionPill></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {opts.productOnly.map(o => (
              <OptionCard key={o.value} {...o} icon={SUBJECT_ICON_MAP[o.value]} selected={subject === o.value} onClick={(v) => { setSubject(v); setInteraction(null); setFraming(null); }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInteractionStep = () => {
    const opts = getInteractionOptions(category!);
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">How should the product appear?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5">Describe the product's relationship with the model</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {opts.map(o => (
            <OptionCard key={o.value} {...o} icon={INTERACTION_ICON_MAP[o.value]} selected={interaction === o.value} onClick={setInteraction} />
          ))}
        </div>
      </div>
    );
  };

  const renderSettingStep = () => {
    const settingOptions: { value: SettingType; label: string; description: string }[] = [
      { value: 'studio', label: 'Studio', description: 'Clean professional background' },
      { value: 'indoor', label: 'Indoor Lifestyle', description: 'Home, cafe, or office' },
      { value: 'outdoor', label: 'Outdoor', description: 'Street, nature, or urban' },
      { value: 'editorial', label: 'Editorial', description: 'Abstract or artistic' },
      { value: 'ai-decide', label: 'Let AI Decide', description: 'Best match for your product' },
    ];
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Where should this take place?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5">Pick the environment for your shot</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {settingOptions.map(o => (
            <OptionCard key={o.value} {...o} icon={SETTING_ICON_MAP[o.value]} selected={setting === o.value} onClick={setSetting} />
          ))}
        </div>
      </div>
    );
  };

  const renderMoodStep = () => {
    const moodOptions: { value: MoodType; label: string; description: string }[] = [
      { value: 'luxury', label: 'Luxury', description: 'Premium and sophisticated' },
      { value: 'minimal', label: 'Clean & Minimal', description: 'Simple and refined' },
      { value: 'bold', label: 'Bold & Energetic', description: 'High contrast, dynamic' },
      { value: 'warm', label: 'Warm & Cozy', description: 'Soft golden tones' },
      { value: 'organic', label: 'Natural & Organic', description: 'Earthy and raw' },
    ];
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">What mood are you going for?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5">This shapes the overall aesthetic</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {moodOptions.map(o => (
            <OptionCard key={o.value} {...o} icon={MOOD_ICON_MAP[o.value]} selected={mood === o.value} onClick={setMood} />
          ))}
        </div>
      </div>
    );
  };

  const renderFramingStep = () => {
    const opts = getFramingOptions(category!, subject ?? undefined);
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">How close should the camera be?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5">Choose the framing for your shot</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {opts.map(o => (
            <OptionCard key={o.value} {...o} icon={FRAMING_ICON_MAP[o.value]} selected={framing === o.value} onClick={setFraming} />
          ))}
        </div>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Your prompt is ready</h3>
        <p className="text-xs sm:text-sm text-muted-foreground/70 mt-0.5">Review and tweak, then use it in Freestyle</p>
      </div>
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4 sm:p-5">
        {isEditing ? (
          <textarea
            value={editablePrompt}
            onChange={e => setEditablePrompt(e.target.value)}
            className="w-full bg-transparent border-none text-sm leading-relaxed resize-none focus:outline-none min-h-[140px]"
            autoFocus
          />
        ) : (
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{editablePrompt}</p>
        )}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-3 h-3" />
            {isEditing ? 'Done Editing' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );

  const stepContent = (() => {
    switch (currentStep) {
      case 'category': return renderCategoryStep();
      case 'subject': return renderSubjectStep();
      case 'interaction': return renderInteractionStep();
      case 'setting': return renderSettingStep();
      case 'mood': return renderMoodStep();
      case 'framing': return renderFramingStep();
      case 'review': return renderReviewStep();
      default: return null;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(
        'p-0 gap-0 overflow-hidden flex flex-col',
        isMobile
          ? 'max-w-full h-[100dvh] rounded-t-2xl border-0 !top-auto !bottom-0 !translate-y-0'
          : 'max-w-xl'
      )}>
        <DialogTitle className="sr-only">Prompt Builder</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 border-b border-border/30 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Prompt Builder</p>
            <p className="text-[11px] text-muted-foreground/60">Step {stepIndex + 1} of {totalSteps}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 sm:px-6 pt-2.5 shrink-0">
          <Progress value={progressPercent} className="h-1" />
        </div>

        {/* Content */}
        <div className={cn('px-5 sm:px-6 py-5 overflow-y-auto', isMobile ? 'flex-1' : 'max-h-[60vh]')}>
          {stepContent}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-border/30 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={stepIndex === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
          {currentStep === 'review' ? (
            <Button size="sm" onClick={handleUse} className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Use This Prompt
            </Button>
          ) : (
            <Button size="sm" onClick={handleNext} disabled={!canAdvance} className="gap-1.5">
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
