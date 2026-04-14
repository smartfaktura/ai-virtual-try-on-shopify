import { ArrowLeft, ArrowRight, Clapperboard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { useShortFilmProject } from '@/hooks/useShortFilmProject';
import { FilmTypeSelector } from '@/components/app/video/short-film/FilmTypeSelector';
import { ReferenceUploadPanel } from '@/components/app/video/short-film/ReferenceUploadPanel';
import { StoryStructureSelector } from '@/components/app/video/short-film/StoryStructureSelector';
import { ShotPlanEditor } from '@/components/app/video/short-film/ShotPlanEditor';
import { ShortFilmSettingsPanel } from '@/components/app/video/short-film/ShortFilmSettingsPanel';
import { ShortFilmProgressPanel } from '@/components/app/video/short-film/ShortFilmProgressPanel';
import { ShotCard } from '@/components/app/video/short-film/ShotCard';
import { cn } from '@/lib/utils';
import { estimateCredits } from '@/config/videoCreditPricing';
import { Coins } from 'lucide-react';

const STEP_LABELS: Record<string, string> = {
  film_type: 'Film Type',
  references: 'References',
  story: 'Story',
  shot_plan: 'Shot Plan',
  settings: 'Settings',
  review: 'Review',
};

export default function ShortFilm() {
  const {
    step,
    steps,
    currentStepIndex,
    filmType,
    setFilmType,
    storyStructure,
    setStoryStructure,
    references,
    setReferences,
    shots,
    settings,
    setSettings,
    canAdvance,
    goNext,
    goBack,
    regeneratePlan,
    isGenerating,
    shotStatuses,
    startGeneration,
  } = useShortFilmProject();

  // Estimate credits for the whole film
  const totalCredits = shots.length * estimateCredits({
    workflowType: 'animate',
    duration: settings.shotDuration,
    audioMode: settings.audioMode,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <PageHeader
        title="Short Film"
        subtitle="Plan and generate a premium multi-shot brand film."
      >
        <div />
      </PageHeader>

      {/* Stepper */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div
              className={cn(
                'flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all shrink-0',
                i < currentStepIndex && 'bg-primary text-primary-foreground',
                i === currentStepIndex && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                i > currentStepIndex && 'bg-muted text-muted-foreground'
              )}
            >
              {i + 1}
            </div>
            <span className={cn(
              'text-xs font-medium hidden sm:block truncate',
              i === currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {STEP_LABELS[s]}
            </span>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-1',
                i < currentStepIndex ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {step === 'film_type' && (
          <FilmTypeSelector value={filmType} onChange={setFilmType} />
        )}

        {step === 'references' && (
          <ReferenceUploadPanel references={references} onChange={setReferences} />
        )}

        {step === 'story' && (
          <StoryStructureSelector value={storyStructure} onChange={setStoryStructure} />
        )}

        {step === 'shot_plan' && (
          <ShotPlanEditor shots={shots} onRegenerate={regeneratePlan} />
        )}

        {step === 'settings' && (
          <ShortFilmSettingsPanel settings={settings} onChange={setSettings} />
        )}

        {step === 'review' && !isGenerating && shotStatuses.length === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Review & Generate</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Everything looks good? Generate your {shots.length}-shot brand film.
              </p>
            </div>

            {/* Quick summary */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Film Type</span>
                  <p className="font-medium text-foreground capitalize">
                    {filmType?.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Structure</span>
                  <p className="font-medium text-foreground capitalize">
                    {storyStructure?.replace(/_/g, ' → ').slice(0, 30)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Shots</span>
                  <p className="font-medium text-foreground">{shots.length} shots × {settings.shotDuration}s</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Audio</span>
                  <p className="font-medium text-foreground capitalize">{settings.audioMode}</p>
                </div>
              </div>
            </div>

            {/* Shot preview */}
            <div className="space-y-2">
              {shots.map((shot) => (
                <ShotCard key={shot.shot_index} shot={shot} />
              ))}
            </div>

            {/* Credit estimate */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated cost:</span>
              <span className="text-sm font-semibold text-foreground">{totalCredits} credits</span>
            </div>
          </div>
        )}

        {step === 'review' && (isGenerating || shotStatuses.length > 0) && (
          <ShortFilmProgressPanel shots={shots} shotStatuses={shotStatuses} />
        )}
      </div>

      {/* Bottom navigation */}
      {!(step === 'review' && isGenerating) && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 z-40">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={currentStepIndex === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step === 'review' && shotStatuses.length === 0 ? (
              <Button
                onClick={startGeneration}
                disabled={isGenerating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Short Film
              </Button>
            ) : step !== 'review' ? (
              <Button
                onClick={goNext}
                disabled={!canAdvance}
                className="gap-1.5"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
