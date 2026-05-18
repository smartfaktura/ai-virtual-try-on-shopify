import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pause, Play, Sparkles, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  estimateDuration,
  serializeForKling,
  autoTrimScript,
  PAUSE_TOKEN,
} from '@/lib/talkingDuration';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';

const MAX_RAW_CHARS = 260; // tokens add length; serialized capped at 200 server-side
const MAX_SERIALIZED = 200;

interface Props {
  script: string;
  onScriptChange: (v: string) => void;
  voiceId: string;
  voiceSpeed: number;
  duration: '5' | '10';
  onDurationChange: (d: '5' | '10') => void;
}

export function TalkingScriptComposer({
  script,
  onScriptChange,
  voiceId,
  voiceSpeed,
  duration,
  onDurationChange,
}: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [previewing, setPreviewing] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const target = duration === '10' ? 10 : 5;
  const est = useMemo(
    () => estimateDuration(script, voiceId, voiceSpeed, target),
    [script, voiceId, voiceSpeed, target],
  );

  const serialized = useMemo(() => serializeForKling(script), [script]);
  const serializedTooLong = serialized.length > MAX_SERIALIZED;

  const insertToken = useCallback(
    (token: string) => {
      const ta = taRef.current;
      if (!ta) {
        onScriptChange(script + token);
        return;
      }
      const start = ta.selectionStart ?? script.length;
      const end = ta.selectionEnd ?? script.length;
      const before = script.slice(0, start);
      const sel = script.slice(start, end);
      const after = script.slice(end);
      let next: string;
      let caret: number;
      if (token === '[em]' && sel) {
        next = `${before}[em]${sel}[/em]${after}`;
        caret = before.length + 4 + sel.length + 5;
      } else if (token === '[em]') {
        next = `${before}[em][/em]${after}`;
        caret = before.length + 4;
      } else {
        const needsSpaceBefore = before.length > 0 && !/\s$/.test(before);
        const insert = (needsSpaceBefore ? ' ' : '') + token + ' ';
        next = before + insert + after;
        caret = (before + insert).length;
      }
      if (next.length > MAX_RAW_CHARS) return;
      onScriptChange(next);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(caret, caret);
      });
    },
    [script, onScriptChange],
  );

  // Stop audio when script/voice changes
  useEffect(() => {
    if (audio) {
      audio.pause();
      setPlaying(false);
    }
  }, [script, voiceId, voiceSpeed]); // eslint-disable-line

  const previewVoice = useCallback(async () => {
    if (!serialized.trim()) {
      toast.error('Write something first');
      return;
    }
    if (audio && playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (audio && !playing) {
      audio.play();
      setPlaying(true);
      return;
    }
    setPreviewing(true);
    try {
      const { data, error } = await supabase.functions.invoke('preview-talking-voice', {
        body: { script: serialized, voice_id: voiceId, speed: voiceSpeed },
      });
      if (error) throw error;
      if (!data?.audio_base64) throw new Error('No audio returned');
      const a = new Audio(`data:audio/mpeg;base64,${data.audio_base64}`);
      a.onended = () => setPlaying(false);
      a.onpause = () => setPlaying(false);
      a.onplay = () => setPlaying(true);
      setAudio(a);
      await a.play();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Preview failed';
      toast.error(msg);
    } finally {
      setPreviewing(false);
    }
  }, [serialized, voiceId, voiceSpeed, audio, playing]);

  const handleAutoTrim = useCallback(() => {
    const trimmed = autoTrimScript(script, voiceId, voiceSpeed, target);
    onScriptChange(trimmed);
  }, [script, voiceId, voiceSpeed, target, onScriptChange]);

  const meterState = serializedTooLong ? 'over' : est.fits;
  const pct = Math.min(100, ((est.high || 0) / target) * 100);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="script" className="text-sm font-medium">Script</Label>
        <span className={cn(
          'text-xs tabular-nums text-muted-foreground',
          script.length > MAX_RAW_CHARS && 'text-destructive',
        )}>
          {script.length}/{MAX_RAW_CHARS}
        </span>
      </div>

      {/* Chip row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => insertToken(PAUSE_TOKEN.short)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium hover:border-primary/40 transition"
          title="Short pause (~0.25s)"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-foreground" />
          Short pause
        </button>
        <button
          type="button"
          onClick={() => insertToken(PAUSE_TOKEN.medium)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium hover:border-primary/40 transition"
          title="Medium pause (~0.6s)"
        >
          <span className="inline-flex gap-[2px]">
            <span className="inline-block w-1 h-1 rounded-full bg-foreground" />
            <span className="inline-block w-1 h-1 rounded-full bg-foreground" />
          </span>
          Medium pause
        </button>
        <button
          type="button"
          onClick={() => insertToken(PAUSE_TOKEN.long)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium hover:border-primary/40 transition"
          title="Long pause (~1.0s)"
        >
          <span className="inline-flex gap-[2px]">
            <span className="inline-block w-1 h-1 rounded-full bg-foreground" />
            <span className="inline-block w-1 h-1 rounded-full bg-foreground" />
            <span className="inline-block w-1 h-1 rounded-full bg-foreground" />
          </span>
          Long pause
        </button>
        <button
          type="button"
          onClick={() => insertToken('[em]')}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium hover:border-primary/40 transition"
          title="Emphasis on selected words"
        >
          <Sparkles className="w-3 h-3" />
          Emphasis
        </button>

        <div className="ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={previewVoice}
            disabled={previewing || !serialized.trim()}
            className="h-7 px-2 text-xs"
          >
            {previewing ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Generating…</>
            ) : playing ? (
              <><Pause className="w-3 h-3 mr-1" />Stop preview</>
            ) : audio ? (
              <><Play className="w-3 h-3 mr-1" />Play preview</>
            ) : (
              <><Volume2 className="w-3 h-3 mr-1" />Preview voice</>
            )}
          </Button>
        </div>
      </div>

      <Textarea
        id="script"
        ref={taRef}
        value={script}
        onChange={(e) => {
          if (e.target.value.length <= MAX_RAW_CHARS) onScriptChange(e.target.value);
        }}
        placeholder="Hi [.] welcome to our new collection."
        rows={3}
        className="resize-none font-mono text-sm"
      />

      {/* Duration meter */}
      <div className="space-y-1.5">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              meterState === 'over' && 'bg-destructive',
              meterState === 'tight' && 'bg-[hsl(38,92%,50%)]',
              meterState === 'ok' && 'bg-primary',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className={cn(
            'tabular-nums',
            meterState === 'over' ? 'text-destructive' :
            meterState === 'tight' ? 'text-[hsl(38,92%,50%)]' :
            'text-muted-foreground',
          )}>
            {est.words === 0 ? `0s of ${target}s` : `≈ ${est.low.toFixed(1)}–${est.high.toFixed(1)}s of ${target}s`}
          </span>
          {meterState === 'over' && (
            <div className="flex items-center gap-1.5">
              {duration === '5' && (
                <button
                  type="button"
                  onClick={() => onDurationChange('10')}
                  className="text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
                >
                  Switch to 10s
                </button>
              )}
              <button
                type="button"
                onClick={handleAutoTrim}
                className="text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
              >
                Auto-trim
              </button>
            </div>
          )}
          {meterState === 'tight' && (
            <span className="text-[11px] text-[hsl(38,92%,50%)]">Close to the limit</span>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Use pauses to control rhythm. Preview voice is an audio approximation — Kling matches the pacing in the final video.
      </p>
    </section>
  );
}

export { serializeForKling };
