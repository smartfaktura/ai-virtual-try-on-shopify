import { Sparkles, Coins, ExternalLink, RotateCw, Play, Download, Loader2, Music } from 'lucide-react';
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
import { ShortFilmStickyBar } from '@/components/app/video/short-film/ShortFilmStickyBar';
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
    audioPhase, audioShotStatuses, retryAudioForShot,
    generateAudio, previewAudio,
  } = useShortFilmProject();

  const [showPreview, setShowPreview] = useState(false);

  const showCredits = shots.length > 0 && step !== 'film_type' && step !== 'references';

  const successCount = shotStatuses.filter(s => s.status === 'complete').length;
  const failedCount = shotStatuses.filter(s => s.status === 'failed').length;
  const allDone = !isGenerating && shotStatuses.length > 0 && shotStatuses.every(s => s.status === 'complete' || s.status === 'failed');
  const allSucceeded = allDone && failedCount === 0 && successCount > 0;
  const hasFailures = allDone && failedCount > 0;

  // Deduplicate: multi-shot produces one combined video shared across all shot statuses
  const completedClips = useMemo(() => {
    const urls = new Set<string>();
    const clips: { url: string; label: string }[] = [];
    for (const s of shotStatuses) {
      if (s.result_url && !urls.has(s.result_url)) {
        urls.add(s.result_url);
        clips.push({ url: s.result_url, label: 'Short Film' });
      }
    }
    return clips;
  }, [shotStatuses]);

  const availableReferences = useMemo(() => {
    return references.map(r => ({ id: r.id, url: r.url, role: r.role, name: r.name }));
  }, [references]);

  const downloadAllClips = useCallback(async () => {
    for (const clip of completedClips) {
      try {
        const response = await fetch(clip.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${clip.label.replace(/[^a-zA-Z0-9-_ ]/g, '')}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        // Stagger downloads to avoid browser blocking
        await new Promise(r => setTimeout(r, 500));
      } catch {
        // Fallback: open in new tab
        window.open(clip.url, '_blank');
      }
    }
  }, [completedClips]);

  const handleResumeDraft = useCallback((projectId: string) => {
    loadDraft(projectId);
  }, [loadDraft]);

  const handleViewProject = useCallback((pid: string) => {
    loadDraft(pid);
  }, [loadDraft]);

  const handleStepClick = useCallback((index: number) => {
    if (index < currentStepIndex) {
      for (let i = currentStepIndex; i > index; i--) {
        goBack();
      }
    }
  }, [currentStepIndex, goBack]);

  const canNavigateToStep = useCallback((index: number) => {
    return index < currentStepIndex;
  }, [currentStepIndex]);

  const handleReset = useCallback(() => {
    setShowPreview(false);
    resetProject();
  }, [resetProject]);

  const hideBar = step === 'review' && isGenerating;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28">
      <PageHeader
        title="Short Film"
        subtitle="Plan and generate a premium multi-shot brand film"
      >
        {showCredits && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            ~{totalCredits} credits
          </div>
        )}
      </PageHeader>

      <ShortFilmProjectList onResumeDraft={handleResumeDraft} onViewProject={handleViewProject} />

      <ShortFilmStepper
        steps={steps}
        currentStepIndex={currentStepIndex}
        onStepClick={handleStepClick}
        canNavigateTo={canNavigateToStep}
      />

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
          <ShortFilmSettingsPanel settings={settings} onChange={setSettings} onPreviewAudio={previewAudio} />
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

            {isGeneratingAudio && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {audioPhase === 'music' && 'Generating background music...'}
                    {audioPhase === 'sfx' && 'Generating sound effects...'}
                    {audioPhase === 'voiceover' && 'Generating voiceover...'}
                    {audioPhase === 'idle' && 'Preparing audio layer...'}
                  </p>
                  {audioShotStatuses.length > 0 && (audioPhase === 'sfx' || audioPhase === 'voiceover') && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {audioShotStatuses.map(s => {
                        const status = audioPhase === 'sfx' ? s.sfx : s.voiceover;
                        return (
                          <span key={s.shot_index} className={`text-[10px] px-1.5 py-0.5 rounded ${
                            status === 'generating' ? 'bg-amber-100 text-amber-800' :
                            status === 'done' ? 'bg-green-100 text-green-800' :
                            status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            Shot {s.shot_index}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isGeneratingAudio && audioShotStatuses.some(s => s.sfx === 'failed' || s.voiceover === 'failed') && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 space-y-2">
                <p className="text-sm font-medium text-foreground">Some audio tracks failed</p>
                <div className="flex flex-wrap gap-1.5">
                  {audioShotStatuses.filter(s => s.sfx === 'failed').map(s => (
                    <Button key={`sfx-${s.shot_index}`} variant="outline" size="sm" className="h-8 text-xs gap-1"
                      onClick={() => retryAudioForShot(s.shot_index, 'sfx')}>
                      <RotateCw className="h-3 w-3" /> SFX Shot {s.shot_index}
                    </Button>
                  ))}
                  {audioShotStatuses.filter(s => s.voiceover === 'failed').map(s => (
                    <Button key={`vo-${s.shot_index}`} variant="outline" size="sm" className="h-8 text-xs gap-1"
                      onClick={() => retryAudioForShot(s.shot_index, 'voiceover')}>
                      <RotateCw className="h-3 w-3" /> Voice Shot {s.shot_index}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {allSucceeded && !isGeneratingAudio && (settings.audioMode !== 'silent' && settings.audioMode !== 'ambient') && audioPhase !== 'done' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-9"
                onClick={() => generateAudio()}
              >
                <Music className="h-3.5 w-3.5" />
                Generate Audio
              </Button>
            )}

            {allSucceeded && !isGeneratingAudio && audioPhase === 'done' && (settings.audioMode !== 'silent' && settings.audioMode !== 'ambient') && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-9"
                onClick={() => generateAudio()}
              >
                <Music className="h-3.5 w-3.5" />
                Regenerate Audio
              </Button>
            )}

            {allDone && completedClips.length > 0 && (
              <>
                {showPreview ? (
                  <ShortFilmVideoPlayer clips={completedClips} audioAssets={audioAssets} />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-9"
                    onClick={() => setShowPreview(true)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Preview Film
                  </Button>
                )}
              </>
            )}

            {allDone && completedClips.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Your Short Film</h3>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={downloadAllClips}>
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <video
                    src={completedClips[0].url}
                    controls
                    playsInline
                    className="w-full aspect-video bg-black"
                  />
                </div>
                {/* Shot breakdown metadata */}
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Shot Breakdown</p>
                  {shots.map(shot => (
                    <div key={shot.shot_index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono w-4">{shot.shot_index}</span>
                      <span className="font-medium text-foreground">
                        {shot.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      <span>· {shot.duration_sec || 3}s</span>
                      <span className="truncate">{shot.purpose}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {allDone && completedClips.length === 0 && hasFailures && (
              <p className="text-sm text-destructive">
                Film generation failed. Use the Retry button to try again.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Floating bottom bar */}
      {!hideBar && (
        <ShortFilmStickyBar
          step={step}
          steps={steps}
          currentStepIndex={currentStepIndex}
          totalCredits={totalCredits}
          shotCount={shots.length}
          canAdvance={canAdvance}
          isGenerating={isGenerating}
          allDone={allDone}
          hasCompletedClips={completedClips.length > 0}
          onNext={goNext}
          onBack={goBack}
          onGenerate={startGeneration}
          onReset={handleReset}
          onSaveDraft={saveDraft}
          onDownloadAll={downloadAllClips}
        />
      )}
    </div>
  );
}
