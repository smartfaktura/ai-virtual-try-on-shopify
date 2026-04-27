import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';
import { ValidationWarnings, type ValidationWarning } from '@/components/app/video/ValidationWarnings';
import { PreservationRulesPanel } from '@/components/app/video/PreservationRulesPanel';
import { AudioModeSelector } from '@/components/app/video/AudioModeSelector';
import { CreditEstimateBox } from '@/components/app/video/CreditEstimateBox';
import { VideoResultsPanel } from '@/components/app/video/VideoResultsPanel';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';

import { StartEndUploadPair, type UploadSlotState } from '@/components/app/video/start-end/StartEndUploadPair';
import { CompatibilityCard } from '@/components/app/video/start-end/CompatibilityCard';
import { TransitionGoalSelector } from '@/components/app/video/start-end/TransitionGoalSelector';
import { TransitionRefinementPanel } from '@/components/app/video/start-end/TransitionRefinementPanel';
import { TransitionSummaryCard } from '@/components/app/video/start-end/TransitionSummaryCard';

import { useStartEndVideoProject } from '@/hooks/useStartEndVideoProject';
import {
  TRANSITION_GOALS,
  TRANSITION_STYLES,
  CAMERA_FEELS,
  MOTION_STRENGTHS,
  SMOOTHNESS_LEVELS,
  REALISM_LEVELS,
  getDefaultPreservationForTransition,
  type TransitionStyle,
  type CameraFeel,
  type MotionStrength,
  type Smoothness,
  type Realism,
} from '@/lib/transitionMotionRecipes';
import {
  runTransitionPreflight,
  probeFile,
  probeUrl,
  probeToAspectRatio,
  type ImageProbe,
} from '@/lib/transitionPreflight';
import { estimateCredits } from '@/config/videoCreditPricing';

const EMPTY_SLOT: UploadSlotState = { url: null, preview: null, uploading: false, progress: 0 };

export default function StartEndVideo() {
  const navigate = useNavigate();
  const { upload } = useFileUpload();
  const { balance: creditsBalance } = useCredits();
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  // Upload slots
  const [start, setStart] = useState<UploadSlotState>(EMPTY_SLOT);
  const [end, setEnd] = useState<UploadSlotState>(EMPTY_SLOT);
  const [startProbe, setStartProbe] = useState<ImageProbe | null>(null);
  const [endProbe, setEndProbe] = useState<ImageProbe | null>(null);

  // Refinement state
  const [goalId, setGoalId] = useState<string>(TRANSITION_GOALS[0].id);
  const [style, setStyle] = useState<TransitionStyle>('photographic');
  const [cameraFeel, setCameraFeel] = useState<CameraFeel>(TRANSITION_GOALS[0].defaultCameraFeel);
  const [motionStrength, setMotionStrength] = useState<MotionStrength>(TRANSITION_GOALS[0].defaultMotionStrength);
  const [smoothness, setSmoothness] = useState<Smoothness>(TRANSITION_GOALS[0].defaultSmoothness);
  const [realism, setRealism] = useState<Realism>('realistic');

  // Preservation
  const [preserveScene, setPreserveScene] = useState(true);
  const [preserveProductDetails, setPreserveProductDetails] = useState(true);
  const [preserveIdentity, setPreserveIdentity] = useState(false);
  const [preserveOutfit, setPreserveOutfit] = useState(false);

  const [audioMode, setAudioMode] = useState<'silent' | 'ambient'>('silent');
  const [userNote, setUserNote] = useState('');

  const project = useStartEndVideoProject();

  // When goal changes, default the related sliders to that goal's defaults
  const setGoal = (id: string) => {
    setGoalId(id);
    const g = TRANSITION_GOALS.find((x) => x.id === id);
    if (g) {
      setCameraFeel(g.defaultCameraFeel);
      setMotionStrength(g.defaultMotionStrength);
      setSmoothness(g.defaultSmoothness);
    }
  };

  // Preflight result (recomputed when probes change)
  const preflight = useMemo(() => runTransitionPreflight({ start: startProbe, end: endProbe }), [startProbe, endProbe]);

  const warnings: ValidationWarning[] = preflight.warnings;

  const bothPresent = !!start.url && !!end.url && !start.uploading && !end.uploading;
  const canAnalyze = bothPresent && preflight.ok;

  // Auto-trigger compatibility analysis when both frames are ready and preflight passes
  useEffect(() => {
    if (!canAnalyze) return;
    if (project.compatibility) return;
    if (project.isAnalyzing) return;
    project.analyzePair(start.url!, end.url!);
  }, [canAnalyze, project, start.url, end.url]);

  // Apply smart-default preservation once we have compatibility
  useEffect(() => {
    if (!project.compatibility) return;
    const hasPerson = !!(project.analysisStart as any)?.has_person || !!(project.analysisEnd as any)?.has_person;
    const category = ((project.analysisStart as any)?.category || (project.analysisStart as any)?.subject_category) ?? null;
    const def = getDefaultPreservationForTransition({ tier: project.compatibility.tier, hasPerson, category });
    setPreserveScene(def.preserveScene);
    setPreserveProductDetails(def.preserveProductDetails);
    setPreserveIdentity(def.preserveIdentity);
    setPreserveOutfit(def.preserveOutfit);
  }, [project.compatibility, project.analysisStart, project.analysisEnd]);

  // Handlers
  const handleUploadFile = useCallback(async (slot: 'start' | 'end', file: File) => {
    const setter = slot === 'start' ? setStart : setEnd;
    const probeSetter = slot === 'start' ? setStartProbe : setEndProbe;

    const previewUrl = URL.createObjectURL(file);
    setter({ url: null, preview: previewUrl, uploading: true, progress: 10 });

    try {
      const probe = await probeFile(file);
      probeSetter(probe);

      const url = await upload(file);
      if (!url) {
        setter({ url: null, preview: null, uploading: false, progress: 0 });
        URL.revokeObjectURL(previewUrl);
        return;
      }
      setter({ url, preview: previewUrl, uploading: false, progress: 100 });
      // Reset compatibility so it re-runs with new pair
      project.reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
      setter({ url: null, preview: null, uploading: false, progress: 0 });
      URL.revokeObjectURL(previewUrl);
    }
  }, [upload, project]);

  const handlePickFromLibrary = useCallback(async (slot: 'start' | 'end', url: string) => {
    const setter = slot === 'start' ? setStart : setEnd;
    const probeSetter = slot === 'start' ? setStartProbe : setEndProbe;
    setter({ url: null, preview: url, uploading: true, progress: 30 });
    try {
      const probe = await probeUrl(url);
      probeSetter(probe);
      setter({ url, preview: url, uploading: false, progress: 100 });
      project.reset();
    } catch (err) {
      toast.error('Could not load image from library');
      setter({ url: null, preview: null, uploading: false, progress: 0 });
    }
  }, [project]);

  const handleClear = useCallback((slot: 'start' | 'end') => {
    if (slot === 'start') { setStart(EMPTY_SLOT); setStartProbe(null); }
    else { setEnd(EMPTY_SLOT); setEndProbe(null); }
    project.reset();
  }, [project]);

  // Credit estimate
  const creditParams = useMemo(() => ({
    workflowType: 'startEnd' as const,
    duration: '5' as const,
    audioMode,
    transitionStyle: style,
  }), [audioMode, style]);

  const creditCost = estimateCredits(creditParams);

  // Aspect ratio derived from start probe
  const derivedAspectRatio = useMemo(
    () => (startProbe ? probeToAspectRatio(startProbe) : '16:9'),
    [startProbe]
  );

  const canGenerate =
    bothPresent &&
    preflight.ok &&
    !!project.compatibility &&
    !project.isGenerating &&
    !project.isAnalyzing;

  const handleGenerate = async () => {
    if (creditsBalance < creditCost) { setNoCreditsOpen(true); return; }
    if (!start.url || !end.url) return;

    await project.runPipeline({
      startImageUrl: start.url,
      endImageUrl: end.url,
      goalId,
      style,
      cameraFeel,
      motionStrength,
      smoothness,
      realism,
      preserveScene,
      preserveProductDetails,
      preserveIdentity,
      preserveOutfit,
      audioMode,
      duration: '5',
      aspectRatio: derivedAspectRatio,
      userNote: userNote.trim() || undefined,
      preAnalysis: { start: project.analysisStart, end: project.analysisEnd },
    });
  };

  // Summary rows
  const summaryRows = useMemo(() => {
    const goal = TRANSITION_GOALS.find((g) => g.id === goalId);
    return [
      { label: 'Goal', value: goal?.title ?? goalId },
      { label: 'Style', value: TRANSITION_STYLES.find((s) => s.id === style)?.label ?? style },
      { label: 'Camera', value: CAMERA_FEELS.find((s) => s.id === cameraFeel)?.label ?? cameraFeel },
      { label: 'Motion', value: MOTION_STRENGTHS.find((s) => s.id === motionStrength)?.label ?? motionStrength },
      { label: 'Smoothness', value: SMOOTHNESS_LEVELS.find((s) => s.id === smoothness)?.label ?? smoothness },
      { label: 'Realism', value: REALISM_LEVELS.find((s) => s.id === realism)?.label ?? realism },
      { label: 'Audio', value: audioMode === 'ambient' ? 'Ambient' : 'Silent' },
      { label: 'Aspect ratio', value: derivedAspectRatio },
      ...(project.compatibility ? [{ label: 'Compatibility', value: project.compatibility.tier }] : []),
      ...(userNote.trim() ? [{ label: 'Note', value: userNote.trim() }] : []),
      { label: 'Estimated credits', value: `${creditCost}` },
    ];
  }, [goalId, style, cameraFeel, motionStrength, smoothness, realism, audioMode, derivedAspectRatio, project.compatibility, userNote, creditCost]);

  // If we have a result, show the results panel
  if (project.isComplete && project.videoUrl) {
    return (
      <div className="container max-w-4xl py-6 space-y-6">
        <PageHeader
          title="Start & End Video"
          subtitle="Cinematic transition between two frames"
        />
        <VideoResultsPanel
          videoUrl={project.videoUrl}
          sourceImageUrl={start.preview ?? undefined}
          aspectRatio={derivedAspectRatio}
          creditCost={creditCost}
          creditsRemaining={creditsBalance}
          onNewProject={() => { project.reset(); setStart(EMPTY_SLOT); setEnd(EMPTY_SLOT); setStartProbe(null); setEndProbe(null); }}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/video')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      <PageHeader
        title="Start & End Video"
        subtitle="Upload two frames and let AI generate a smooth, cinematic transition between them."
      />

      {/* Upload pair */}
      <StartEndUploadPair
        start={start}
        end={end}
        onUploadFile={handleUploadFile}
        onPickFromLibrary={handlePickFromLibrary}
        onClear={handleClear}
        disabled={project.isGenerating}
      />

      {warnings.length > 0 && <ValidationWarnings warnings={warnings} />}

      {/* Compatibility */}
      {bothPresent && preflight.ok && (
        <>
          {project.isAnalyzing && (
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Analyzing both frames for compatibility…
            </div>
          )}
          {project.compatibility && <CompatibilityCard compatibility={project.compatibility} />}
        </>
      )}

      {/* Goal */}
      <TransitionGoalSelector selectedGoalId={goalId} onChange={setGoal} />

      {/* Refinement */}
      <TransitionRefinementPanel
        style={style}
        cameraFeel={cameraFeel}
        motionStrength={motionStrength}
        smoothness={smoothness}
        realism={realism}
        onStyleChange={setStyle}
        onCameraFeelChange={setCameraFeel}
        onMotionStrengthChange={setMotionStrength}
        onSmoothnessChange={setSmoothness}
        onRealismChange={setRealism}
      />

      {/* Preservation */}
      <PreservationRulesPanel
        preserveScene={preserveScene}
        preserveProductDetails={preserveProductDetails}
        preserveIdentity={preserveIdentity}
        preserveOutfit={preserveOutfit}
        onPreserveSceneChange={setPreserveScene}
        onPreserveProductDetailsChange={setPreserveProductDetails}
        onPreserveIdentityChange={setPreserveIdentity}
        onPreserveOutfitChange={setPreserveOutfit}
      />

      {/* Audio + Note */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <AudioModeSelector value={audioMode} onChange={(v) => setAudioMode(v as 'silent' | 'ambient')} />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Transition Note (optional)</label>
          <Textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="One sentence to refine the transition (e.g. 'reveal the bottle as the light shifts warmer')"
            rows={2}
            maxLength={240}
            className="resize-none"
          />
          <div className="text-[11px] text-muted-foreground text-right">{userNote.length}/240</div>
        </div>
      </div>

      {/* Summary */}
      <TransitionSummaryCard rows={summaryRows} />

      {/* Generate row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky bottom-4 bg-background/95 backdrop-blur rounded-xl border border-border p-3 shadow-sm">
        <CreditEstimateBox params={creditParams} />
        <Button
          size="lg"
          className="min-w-[220px]"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {project.isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {project.pipelineStage === 'queued' ? 'Queued…' : 'Generating…'}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Transition Video
            </>
          )}
        </Button>
      </div>

      {project.pipelineError && (
        <ValidationWarnings warnings={[{ type: 'error', message: project.pipelineError }]} />
      )}

      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} />
    </div>
  );
}
