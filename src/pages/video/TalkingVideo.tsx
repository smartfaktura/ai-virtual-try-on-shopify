import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, FolderOpen, Mic2, Loader2, Info } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { LibraryPickerModal } from '@/components/app/video/LibraryPickerModal';
import { KlingVoicePicker, VOICE_IDS } from '@/components/app/video/KlingVoicePicker';
import { useTalkingVideoProject } from '@/hooks/useTalkingVideoProject';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useCredits } from '@/contexts/CreditContext';
import { VIDEO_CREDIT_RULES } from '@/config/videoCreditPricing';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';

type Duration = '5' | '10';

const MAX_SCRIPT = 120;

export default function TalkingVideo() {
  const navigate = useNavigate();
  const { balance } = useCredits();
  const { upload, isUploading } = useFileUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [script, setScript] = useState('');
  const [voiceId, setVoiceId] = useState(VOICE_IDS[0]);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [duration, setDuration] = useState<Duration>('5');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  const { isSubmitting, start, jobId } = useTalkingVideoProject();

  const cost = duration === '10'
    ? VIDEO_CREDIT_RULES.talkingVideo.base10s
    : VIDEO_CREDIT_RULES.talkingVideo.base5s;

  const hasEnough = (balance ?? 0) >= cost;
  const charCount = script.trim().length;

  const hasImage = !!imageUrl;
  const hasScript = charCount > 0 && charCount <= MAX_SCRIPT;
  const missingHint = !hasImage
    ? 'Add a reference photo to continue'
    : charCount === 0
      ? 'Write a short script to continue'
      : charCount > MAX_SCRIPT
        ? `Script is too long — keep it under ${MAX_SCRIPT} characters`
        : null;

  const handleFile = useCallback(async (file: File) => {
    const url = await upload(file);
    if (url) setImageUrl(url);
  }, [upload]);

  const handleGenerate = useCallback(async () => {
    if (isSubmitting) return;
    if (!imageUrl) {
      toast.error('Add a reference photo first');
      document.getElementById('talking-step-reference')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (charCount === 0) {
      toast.error('Write a short script first');
      document.getElementById('script')?.focus();
      return;
    }
    if (charCount > MAX_SCRIPT) {
      toast.error(`Script must be ${MAX_SCRIPT} characters or fewer`);
      return;
    }
    if (!hasEnough) {
      setNoCreditsOpen(true);
      return;
    }
    const ok = await start({
      imageUrl,
      script,
      voiceId,
      voiceSpeed,
      duration,
      aspectRatio: '9:16',
    });
    if (ok) {
      setTimeout(() => navigate('/app/video'), 800);
    }
  }, [isSubmitting, imageUrl, charCount, hasEnough, script, voiceId, voiceSpeed, duration, start, navigate]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="Talking Video"
        subtitle="Bring a model to life with synced speech — pick a reference, write a short line, choose a voice"
      >
        <div />
      </PageHeader>

      {/* Step 1 — Reference */}
      <section className="space-y-3">
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

      {/* Step 2 — Script */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="script" className="text-sm font-medium">Script</Label>
          <span className={cn(
            "text-xs tabular-nums",
            charCount > MAX_SCRIPT ? "text-destructive" : "text-muted-foreground"
          )}>
            {charCount}/{MAX_SCRIPT}
          </span>
        </div>
        <Textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Hi, welcome to our new collection."
          rows={3}
          maxLength={MAX_SCRIPT + 20}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          Keep it short for natural lip-sync. Roughly 2 seconds per 8 words.
        </p>
      </section>

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

      {/* Step 4 — Duration */}
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
        <div className="text-xs text-muted-foreground">
          Cost <span className="text-foreground font-medium">{cost} credits</span> · balance {balance ?? 0}
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          size="lg"
          className="min-w-[180px]"
        >
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Queuing…</> : 'Generate talking video'}
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
