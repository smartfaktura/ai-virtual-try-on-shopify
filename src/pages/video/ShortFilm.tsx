import { Sparkles, Coins, RotateCw, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/PageHeader';
import { useShortFilmProject } from '@/hooks/useShortFilmProject';
import { useCredits } from '@/contexts/CreditContext';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { FilmTypeSelector } from '@/components/app/video/short-film/FilmTypeSelector';
import { ContentIntentStep } from '@/components/app/video/short-film/ContentIntentStep';
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
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useState, useCallback, useRef } from 'react';

export default function ShortFilm() {
  const { balance } = useCredits();
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

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
    audioPhase,
    generateAudio, previewAudio,
    contentIntent, setContentIntent,
    platform, setPlatform,
    soundMode, setSoundMode,
    paceMode, setPaceMode,
    productPriority, setProductPriority,
    endingStyle, setEndingStyle,
    audienceContext, setAudienceContext,
    offerContext, setOfferContext,
    clarityFirstMode, setClarityFirstMode,
  } = useShortFilmProject();

  const handleGenerate = useCallback(() => {
    if (balance < totalCredits) {
      setNoCreditsOpen(true);
      return;
    }
    startGeneration();
  }, [balance, totalCredits, startGeneration]);

  const generationStartRef = useRef<number>(Date.now());

  const prevIsGenerating = useRef(false);
  if (isGenerating && !prevIsGenerating.current) {
    generationStartRef.current = Date.now();
  }
  prevIsGenerating.current = isGenerating;

  const showCredits = shots.length > 0 && step !== 'film_type' && step !== 'references';

  const successCount = shotStatuses.filter(s => s.status === 'complete').length;
  const failedCount = shotStatuses.filter(s => s.status === 'failed').length;
  const videosDone = !isGenerating && shotStatuses.length > 0 && shotStatuses.every(s => s.status === 'complete' || s.status === 'failed');
  const musicEnabled = !!settings.audioLayers?.music;
  const musicDone = !musicEnabled || (audioPhase === 'done' && !!audioAssets?.backgroundTrackUrl);
  const allDone = videosDone && musicDone;
  const allSucceeded = allDone && failedCount === 0 && successCount > 0;
  const hasFailures = allDone && failedCount > 0;

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

  const shotsMeta = useMemo(() =>
    shots.map(s => ({ shot_index: s.shot_index, duration_sec: s.duration_sec })),
    [shots]
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const totalDuration = useMemo(() =>
    shots.reduce((sum, s) => sum + (s.duration_sec || 3), 0),
    [shots]
  );

  const availableReferences = useMemo(() => {
    return references.map(r => ({ id: r.id, url: r.url, role: r.role, name: r.name }));
  }, [references]);

  // Single smart download: auto-mux with music if available, otherwise raw video
  const handleDownload = useCallback(async () => {
    if (!completedClips.length) return;
    setIsDownloading(true);
    try {
      let downloadUrl = completedClips[0].url;
      let filename = 'short-film.mp4';

      // If music track exists, mux it into the video
      if (audioAssets?.backgroundTrackUrl) {
        try {
          const { data, error } = await supabase.functions.invoke('mux-video-audio', {
            body: {
              video_url: completedClips[0].url,
              audio_url: audioAssets.backgroundTrackUrl,
            },
          });
          if (!error && data?.url && !data?.fallback) {
            downloadUrl = data.url;
            filename = 'short-film-final.mp4';
          } else {
            console.warn('[Download] Mux fallback — downloading raw video', data?.error);
          }
        } catch (muxErr) {
          console.warn('[Download] Mux call failed, downloading raw video', muxErr);
        }
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success('Downloaded!');
    } catch {
      window.open(completedClips[0].url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  }, [completedClips, audioAssets]);

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

      <div className="min-h-[300px]">
        {step === 'film_type' && (
          <FilmTypeSelector
            value={filmType}
            onChange={setFilmType}
            audioLayers={settings.audioLayers || { music: true, sfx: true, voiceover: false }}
            onAudioLayersChange={(layers) => setSettings(prev => ({ ...prev, audioLayers: layers }))}
          />
        )}

        {step === 'content_intent' && (
          <ContentIntentStep
            value={{
              contentIntent, platform, soundMode, paceMode,
              productPriority, endingStyle, audienceContext, offerContext, clarityFirstMode,
            }}
            onChange={(v) => {
              setContentIntent(v.contentIntent);
              setPlatform(v.platform);
              setSoundMode(v.soundMode);
              setPaceMode(v.paceMode);
              setProductPriority(v.productPriority);
              setEndingStyle(v.endingStyle);
              setAudienceContext(v.audienceContext ?? '');
              setOfferContext(v.offerContext ?? '');
              setClarityFirstMode(v.clarityFirstMode);
            }}
          />
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
            audioLayers={settings.audioLayers || { music: true, sfx: true, voiceover: false }}
            onAudioLayersChange={(layers) => setSettings(prev => ({ ...prev, audioLayers: layers }))}
          />
        )}

        {step === 'settings' && (
          <ShortFilmSettingsPanel settings={settings} onChange={setSettings} onPreviewAudio={previewAudio} filmType={filmType} musicDirection={shots.length > 0 ? settings.musicPrompt : undefined} />
        )}

        {step === 'review' && !isGenerating && shotStatuses.length === 0 && (
          <ShortFilmReviewSummary
            filmType={filmType}
            storyStructure={storyStructure}
            shots={shots}
            settings={settings}
            totalCredits={totalCredits}
            references={references}
            contentIntent={contentIntent}
            platform={platform}
            soundMode={soundMode}
            endingStyle={endingStyle}
            clarityFirst={clarityFirstMode}
          />
        )}

        {step === 'review' && (isGenerating || shotStatuses.length > 0) && (
          <div className="space-y-6">
            <ShortFilmProgressPanel
              shots={shots}
              shotStatuses={shotStatuses}
              onRetryShot={retryShotGeneration}
              generationStartTime={generationStartRef.current}
              audioPhase={audioPhase}
              musicEnabled={musicEnabled}
            />

            {/* Regenerate music button — only after everything is done */}
            {allSucceeded && !isGeneratingAudio && audioPhase === 'done' && audioAssets?.backgroundTrackUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-9"
                onClick={() => generateAudio(projectId || undefined)}
              >
                <Music className="h-3.5 w-3.5" />
                Regenerate Music
              </Button>
            )}

            {allSucceeded && !isGeneratingAudio && audioPhase === 'done' && audioAssets?.backgroundTrackUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-9"
                onClick={() => generateAudio(projectId || undefined)}
              >
                <Music className="h-3.5 w-3.5" />
                Regenerate Music
              </Button>
            )}

            {allDone && completedClips.length > 0 && (
              <div className="space-y-4">
                <ShortFilmVideoPlayer
                  clips={completedClips}
                  audioAssets={audioAssets}
                  shots={shotsMeta}
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                />
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Shot Breakdown · {totalDuration}s
                  </p>
                  {shots.map(shot => (
                    <div key={shot.shot_index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono w-4">{shot.shot_index}</span>
                      <span className="font-medium text-foreground">
                        {shot.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      <span>· {shot.duration_sec}s</span>
                      <span className="truncate">{shot.purpose}</span>
                      {shot.script_line && (
                        <span className="text-[10px] italic text-muted-foreground/70 truncate ml-auto max-w-[150px]">
                          🎙 "{shot.script_line}"
                        </span>
                      )}
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
           onGenerate={handleGenerate}
          onReset={handleReset}
          onSaveDraft={saveDraft}
          onDownloadAll={handleDownload}
        />
      )}

      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
    </div>
  );
}
