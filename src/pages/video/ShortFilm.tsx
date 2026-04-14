import { ArrowLeft, ArrowRight, Sparkles, Coins, ExternalLink } from 'lucide-react';
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
import { ShortFilmReviewSummary } from '@/components/app/video/short-film/ShortFilmReviewSummary';
import { ShortFilmStepper } from '@/components/app/video/short-film/ShortFilmStepper';
import { cn } from '@/lib/utils';

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
    projectId,
    totalCredits,
  } = useShortFilmProject();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <PageHeader
        title="Short Film"
        subtitle="Plan and generate a premium multi-shot brand film."
      >
        <div />
      </PageHeader>

      <ShortFilmStepper steps={steps} currentStepIndex={currentStepIndex} />

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
          <ShortFilmReviewSummary
            filmType={filmType}
            storyStructure={storyStructure}
            shots={shots}
            settings={settings}
            totalCredits={totalCredits}
          />
        )}

        {step === 'review' && (isGenerating || shotStatuses.length > 0) && (
          <div className="space-y-6">
            <ShortFilmProgressPanel shots={shots} shotStatuses={shotStatuses} />

            {/* Results section — show after all shots are done */}
            {!isGenerating && shotStatuses.length > 0 && shotStatuses.every(s => s.status === 'complete' || s.status === 'failed') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Generated Clips</h3>
                <div className="grid gap-3">
                  {shotStatuses
                    .filter(s => s.result_url)
                    .map(s => {
                      const shot = shots.find(sh => sh.shot_index === s.shot_index);
                      return (
                        <div key={s.shot_index} className="rounded-xl border border-border bg-card overflow-hidden">
                          <video
                            src={s.result_url}
                            controls
                            playsInline
                            className="w-full aspect-video bg-black"
                          />
                          {shot && (
                            <div className="px-3 py-2">
                              <p className="text-xs font-medium text-foreground">
                                Shot {s.shot_index} — {shot.role}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{shot.purpose}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
                {projectId && (
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <a href="/app/video">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View in Video Hub
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
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
