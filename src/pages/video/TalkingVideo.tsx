import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FolderOpen, Mic2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { LibraryPickerModal } from '@/components/app/video/LibraryPickerModal';
import { KlingVoicePicker, VOICE_IDS } from '@/components/app/video/KlingVoicePicker';
import { TalkingVideoGenerating } from '@/components/app/video/TalkingVideoGenerating';
import { TalkingScriptComposer } from '@/components/app/video/TalkingScriptComposer';
import { TalkingPerformancePicker, type Performance } from '@/components/app/video/TalkingPerformancePicker';
import { BackgroundJobPill } from '@/components/app/video/BackgroundJobPill';
import { useTalkingVideoProject } from '@/hooks/useTalkingVideoProject';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCredits } from '@/contexts/CreditContext';
import { VIDEO_CREDIT_RULES } from '@/config/videoCreditPricing';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { toSignedUrl } from '@/lib/signedUrl';
import { estimateDuration, serializeForKling } from '@/lib/talkingDuration';

type Duration = '5' | '10';
type Phase = 'idle' | 'queued' | 'processing' | 'complete' | 'failed';

const DEFAULT_PERFORMANCE: Performance = { motion: 'natural', gaze: 'camera' };

export default function TalkingVideo() {
  const navigate = useNavigate();
  const { balance, refreshBalance } = useCredits();
  const { upload, isUploading } = useFileUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [voiceId, setVoiceId] = useState(VOICE_IDS[0]);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [duration, setDuration] = useState<Duration>('5');
  const [performance, setPerformance] = useState<Performance>(DEFAULT_PERFORMANCE);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [backgroundJobIds, setBackgroundJobIds] = useState<string[]>([]);

  const { isSubmitting, start } = useTalkingVideoProject();

  const cost = duration === '10'
    ? VIDEO_CREDIT_RULES.talkingVideo.base10s
    : VIDEO_CREDIT_RULES.talkingVideo.base5s;

  const balanceReady = balance !== null && balance !== undefined;
  const displayBalance = balance ?? 0;
  const hasEnough = balanceReady && displayBalance >= cost;
  const creditShortfall = balanceReady ? Math.max(cost - displayBalance, 0) : 0;

  const target = duration === '10' ? 10 : 5;
  const est = estimateDuration(script, voiceId, voiceSpeed, target);
  const serialized = serializeForKling(script);
  const scriptEmpty = serialized.trim().length === 0;
  const scriptOver = est.fits === 'over' || serialized.length > 200;

  const hasImage = !!imageUrl;
  const missingHint = !hasImage
    ? 'Add a reference photo to continue'
    : scriptEmpty
      ? 'Write a short script to continue'
      : scriptOver
        ? `Script is over ${target}s — trim it or switch to ${duration === '5' ? '10s' : 'a shorter clip'}`
        : !balanceReady
          ? 'Checking your credits…'
          : !hasEnough
            ? `Need ${creditShortfall} more credits to generate this video`
            : null;

  const handleFile = useCallback(async (file: File) => {
    const url = await upload(file);
    if (url) setImageUrl(url);
  }, [upload]);

  // Poll the queue + generated_videos row while a foreground job is active
  useEffect(() => {
    if (!activeJobId || phase === 'idle' || phase === 'complete' || phase === 'failed') return;
    let cancelled = false;

    const poll = async () => {
      try {
        const { data: queueRow } = await supabase
          .from('generation_queue')
          .select('status, error_message')
          .eq('id', activeJobId)
          .maybeSingle();

        if (cancelled || !queueRow) return;

        if (queueRow.status === 'failed' || queueRow.status === 'cancelled') {
          setResultError(queueRow.error_message || 'Generation failed');
          setPhase('failed');
          refreshBalance();
          return;
        }

        const { data: videoRow } = await supabase
          .from('generated_videos')
          .select('id, status, video_url, error_message')
          .eq('workflow_type', 'talking_video')
          .filter('metadata->>queue_job_id', 'eq', activeJobId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (videoRow?.status === 'complete' && videoRow.video_url) {
          const signed = await toSignedUrl(videoRow.video_url);
          if (cancelled) return;
          setResultVideoUrl(signed || videoRow.video_url);
          setPhase('complete');
          refreshBalance();
          return;
        }
        if (videoRow?.status === 'failed') {
          setResultError(videoRow.error_message || 'Generation failed');
          setPhase('failed');
          refreshBalance();
          return;
        }
        if (videoRow?.status === 'processing' && phase !== 'processing') {
          setPhase('processing');
        }
      } catch (e) {
        console.warn('[TalkingVideo] poll error', e);
      }
    };

    poll();
    const interval = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [activeJobId, phase, refreshBalance]);

  const handleGenerate = useCallback(async () => {
    if (isSubmitting) return;
    if (!imageUrl) {
      toast.error('Add a reference photo first');
      document.getElementById('talking-step-reference')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (scriptEmpty) {
      toast.error('Write a short script first');
      document.getElementById('script')?.focus();
      return;
    }
    if (scriptOver) {
      toast.error(`Script is over ${target}s — trim it or switch to ${duration === '5' ? '10s' : 'a shorter clip'}`);
      return;
    }
    if (!balanceReady) {
      toast('Checking credits — try again in a moment');
      return;
    }
    if (!hasEnough) {
      toast.error(`You need ${cost} credits for a ${duration}s Talking Video. Your balance is ${displayBalance}.`);
      setNoCreditsOpen(true);
      return;
    }
    const result = await start({
      imageUrl,
      script,
      voiceId,
      voiceSpeed,
      duration,
      aspectRatio: '9:16',
      performance,
    });
    if (result.ok && result.jobId) {
      setActiveJobId(result.jobId);
      setResultVideoUrl(null);
      setResultError(null);
      setPhase('queued');
      refreshBalance();
    }
  }, [isSubmitting, imageUrl, scriptEmpty, scriptOver, target, balanceReady, hasEnough, cost, duration, displayBalance, script, voiceId, voiceSpeed, performance, start, refreshBalance]);

  const resetToForm = useCallback(() => {
    setPhase('idle');
    setActiveJobId(null);
    setResultVideoUrl(null);
    setResultError(null);
  }, []);

  // "Start another" while current job keeps generating in background
  const startAnother = useCallback(() => {
    if (activeJobId) {
      setBackgroundJobIds((prev) => [...new Set([...prev, activeJobId])]);
    }
    setScript('');
    setResultVideoUrl(null);
    setResultError(null);
    setActiveJobId(null);
    setPhase('idle');
  }, [activeJobId]);

  const removeBackgroundJob = useCallback((jobId: string) => {
    setBackgroundJobIds((prev) => prev.filter((id) => id !== jobId));
    refreshBalance();
  }, [refreshBalance]);

  const generateLabel = isSubmitting
    ? 'Queuing…'
    : !balanceReady
      ? 'Checking credits…'
      : !hasEnough
        ? 'Top up to generate'
        : 'Generate talking video';

  // === Generating / complete / failed screen ===
  if (phase !== 'idle') {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader
          title="Talking Video"
          subtitle="Your video is being generated"
        >
          <div />
        </PageHeader>
        <TalkingVideoGenerating
          estimatedSeconds={duration === '10' ? 7 * 60 : 5 * 60}
          status={phase === 'queued' ? 'queued' : phase === 'processing' ? 'processing' : phase === 'complete' ? 'complete' : 'failed'}
          videoUrl={resultVideoUrl}
          errorMessage={resultError}
          thumbnailUrl={imageUrl}
          onGoToHub={() => navigate('/app/video')}
          onReset={resetToForm}
          onStartAnother={phase === 'queued' || phase === 'processing' ? startAnother : undefined}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Talking Video"
        subtitle="Bring a model to life with synced speech — pick a reference, write a short line, choose a voice"
      >
        <div />
      </PageHeader>

      <BackgroundJobPill
        jobIds={backgroundJobIds}
        onResolved={removeBackgroundJob}
        onOpenHub={() => navigate('/app/video')}
      />

      {/* Step 1 — Reference */}
      <section id="talking-step-reference" className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Reference photo</Label>
          <span className="text-xs text-muted-foreground">Model, scene, or any portrait</span>
        </div>

        {imageUrl ? (
          <div className="relative w-full max-w-sm">
            <img
              src={imageUrl}
              alt="Reference"
              className="w-full aspect-[9/16] object-cover rounded-xl border border-border"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary/40 transition-all py-10 px-4"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                : <Upload className="h-5 w-5 text-muted-foreground" />}
              <span className="text-sm font-medium">Upload photo</span>
              <span className="text-xs text-muted-foreground">PNG or JPG</span>
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card hover:border-primary/40 transition-all py-10 px-4"
            >
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Choose from library</span>
              <span className="text-xs text-muted-foreground">Models, brand assets, drops</span>
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </section>

      {/* Step 2 — Script composer */}
      <TalkingScriptComposer
        script={script}
        onScriptChange={setScript}
        voiceId={voiceId}
        voiceSpeed={voiceSpeed}
        duration={duration}
        onDurationChange={setDuration}
      />

      {/* Step 3 — Voice */}
      <section className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Mic2 className="h-3.5 w-3.5" /> Voice
        </Label>
        <KlingVoicePicker value={voiceId} onChange={setVoiceId} />
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Speed</Label>
            <span className="text-xs tabular-nums text-muted-foreground">{voiceSpeed.toFixed(2)}x</span>
          </div>
          <Slider
            value={[voiceSpeed]}
            onValueChange={(v) => setVoiceSpeed(v[0])}
            min={0.8}
            max={1.5}
            step={0.05}
          />
        </div>
      </section>

      {/* Step 4 — Performance */}
      <section className="space-y-3">
        <Label className="text-sm font-medium">Performance</Label>
        <TalkingPerformancePicker value={performance} onChange={setPerformance} />
      </section>

      {/* Step 5 — Duration */}
      <section className="space-y-3">
        <Label className="text-sm font-medium">Duration</Label>
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          {(['5', '10'] as Duration[]).map((d) => {
            const active = duration === d;
            const c = d === '10' ? VIDEO_CREDIT_RULES.talkingVideo.base10s : VIDEO_CREDIT_RULES.talkingVideo.base5s;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm font-medium transition-all',
                  active
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                )}
              >
                <div>{d} sec</div>
                <div className="text-[10px] uppercase tracking-wide opacity-70 mt-0.5">{c} credits</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Generate */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 bg-background/95 backdrop-blur border-t border-border/60 flex items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>Cost <span className="text-foreground font-medium">{cost} credits</span> · balance {displayBalance}</div>
          {missingHint && <div className="text-[11px] text-muted-foreground/80">{missingHint}</div>}
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isSubmitting}
          size="lg"
          className="min-w-[180px]"
        >
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{generateLabel}</> : generateLabel}
        </Button>
      </div>

      <LibraryPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => { setImageUrl(url); setPickerOpen(false); }}
      />
      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} />
    </div>
  );
}
