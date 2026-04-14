import { ArrowLeft, ArrowRight, Sparkles, Coins, ExternalLink, RotateCcw, Play, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { useShortFilmProject } from '@/hooks/useShortFilmProject';
import { FilmTypeSelector } from '@/components/app/video/short-film/FilmTypeSelector';
import { ReferenceUploadPanel } from '@/components/app/video/short-film/ReferenceUploadPanel';
import { StoryStructureSelector } from '@/components/app/video/short-film/StoryStructureSelector';
import { ShotPlanEditor } from '@/components/app/video/short-film/ShotPlanEditor';
import { ShortFilmSettingsPanel } from '@/components/app/video/short-film/ShortFilmSettingsPanel';
import { ShortFilmProgressPanel } from '@/components/app/video/short-film/ShortFilmProgressPanel';
import { ShortFilmReviewSummary } from '@/components/app/video/short-film/ShortFilmReviewSummary';
import { ShortFilmStepper } from '@/components/app/video/short-film/ShortFilmStepper';
import { ShortFilmVideoPlayer } from '@/components/app/video/short-film/ShortFilmVideoPlayer';
import { ShortFilmProjectList } from '@/components/app/video/short-film/ShortFilmProjectList';
import { useMemo, useState, useCallback } from 'react';

export default function ShortFilm() {
  const {
    step, steps, currentStepIndex,
    filmType, setFilmType,
    storyStructure, setStoryStructure,
    references, setReferences,
    shots, settings, setSettings,
    canAdvance, goNext, goBack,
    regeneratePlan, isGenerating, shotStatuses,
    startGeneration, projectId, totalCredits,
    updateShot, deleteShot, addShot, reorderShots,
    resetProject, retryShotGeneration,
    planMode, setPlanMode, isAiPlanning,
    saveDraft, loadDraft,
    customRoles, setCustomRoles,
    audioAssets, isGeneratingAudio,
  } = useShortFilmProject();

  const [showPreview, setShowPreview] = useState(false);

  const showCredits = shots.length > 0 && step !== 'film_type' && step !== 'references';

  const allDone = !isGenerating && shotStatuses.length > 0 && shotStatuses.every(s => s.status === 'complete' || s.status === 'failed');

  const completedClips = useMemo(() => {
    return shotStatuses
      .filter(s => s.result_url)
      .map(s => {
        const shot = shots.find(sh => sh.shot_index === s.shot_index);
        return { url: s.result_url!, label: `Shot ${s.shot_index} — ${shot?.role || 'clip'}` };
      });
  }, [shotStatuses, shots]);

  const availableReferences = useMemo(() => {
    return references.map(r => ({ id: r.id, url: r.url, role: r.role, name: r.name }));
  }, [references]);

  const downloadAllClips = useCallback(() => {
    completedClips.forEach((clip, i) => {
      const a = document.createElement('a');
      a.href = clip.url;
      a.download = `shot-${i + 1}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }, [completedClips]);

  const handleResumeDraft = useCallback((projectId: string) => {
    loadDraft(projectId);
  }, [loadDraft]);

  const handleViewProject = useCallback((projectId: string) => {
    // For now just navigate to video hub
    window.location.href = '/app/video';
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <PageHeader
        title="Short Film"
        subtitle="Plan and generate a premium multi-shot brand film."
      >
        {showCredits && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            ~{totalCredits} credits
          </div>
        )}
      </PageHeader>

      {/* Project History */}
      <ShortFilmProjectList onResumeDraft={handleResumeDraft} onViewProject={handleViewProject} />

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
          <StoryStructureSelector
            value={storyStructure}
            onChange={setStoryStructure}
            customRoles={customRoles}
            onCustomRolesChange={setCustomRoles}
          />
        )}

        {step === 'shot_plan' && (
          <ShotPlanEditor
            shots={shots}
            onRegenerate={regeneratePlan}
            onUpdateShot={updateShot}
            onDeleteShot={deleteShot}
            onAddShot={addShot}
            onReorderShots={reorderShots}
            planMode={planMode}
            onPlanModeChange={setPlanMode}
            isAiPlanning={isAiPlanning}
            availableReferences={availableReferences}
          />
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
            <ShortFilmProgressPanel
              shots={shots}
              shotStatuses={shotStatuses}
              onRetryShot={retryShotGeneration}
            />

            {/* Sequential preview player */}
            {allDone && completedClips.length > 1 && (
              <>
                {showPreview ? (
                  <ShortFilmVideoPlayer clips={completedClips} />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowPreview(true)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Preview Film
                  </Button>
                )}
              </>
            )}

            {/* Individual clips + export */}
            {allDone && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Generated Clips</h3>
                  {completedClips.length > 0 && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadAllClips}>
                      <Download className="h-3.5 w-3.5" />
                      Download All
                    </Button>
                  )}
                </div>
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
            <div className="flex items-center gap-2">
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
              {currentStepIndex > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetProject}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start Over
                  </Button>
                  {currentStepIndex >= 1 && step !== 'review' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveDraft}
                      className="gap-1.5 text-muted-foreground"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Draft
                    </Button>
                  )}
                </>
              )}
            </div>

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
