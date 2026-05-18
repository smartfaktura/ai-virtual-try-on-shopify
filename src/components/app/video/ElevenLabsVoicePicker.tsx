import { Check, Mic, Play, Pause, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';

export interface ElevenVoice {
  id: string;            // ElevenLabs voice id
  label: string;
  gender: 'female' | 'male' | 'neutral';
  accent: 'US' | 'UK' | 'AU';
  vibe: string;
}

export const ELEVEN_VOICES: ElevenVoice[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah',    gender: 'female',  accent: 'US', vibe: 'Warm, conversational' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', label: 'Laura',    gender: 'female',  accent: 'US', vibe: 'Bright, friendly' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', label: 'Alice',    gender: 'female',  accent: 'UK', vibe: 'Calm, refined' },
  { id: 'XrExE9yKIg1WjnnlVkGX', label: 'Matilda',  gender: 'female',  accent: 'US', vibe: 'Soft, story' },
  { id: 'cgSgspJ2msm6clMCkdW9', label: 'Jessica',  gender: 'female',  accent: 'US', vibe: 'Youthful, upbeat' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily',     gender: 'female',  accent: 'UK', vibe: 'Gentle narration' },
  { id: 'SAz9YHcvj6GT2YYXdXww', label: 'River',    gender: 'neutral', accent: 'US', vibe: 'Neutral, modern' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', label: 'Roger',    gender: 'male',    accent: 'US', vibe: 'Confident' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', label: 'George',   gender: 'male',    accent: 'UK', vibe: 'Mature, authoritative' },
  { id: 'IKne3meq5aSn9XLyUdCD', label: 'Charlie',  gender: 'male',    accent: 'AU', vibe: 'Casual, friendly' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', label: 'Callum',   gender: 'male',    accent: 'UK', vibe: 'Intense, character' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam',     gender: 'male',    accent: 'US', vibe: 'Articulate' },
  { id: 'bIHbv24MWmeRgasZH58o', label: 'Will',     gender: 'male',    accent: 'US', vibe: 'Chill, podcast' },
  { id: 'cjVigY5qzO86Huf0OWal', label: 'Eric',     gender: 'male',    accent: 'US', vibe: 'Smooth narration' },
  { id: 'iP95p4xoKVk53GoZ742B', label: 'Chris',    gender: 'male',    accent: 'US', vibe: 'Natural, casual' },
  { id: 'nPczCjzI2devNBz1zQrb', label: 'Brian',    gender: 'male',    accent: 'US', vibe: 'Deep narration' },
];

export const ELEVEN_VOICE_IDS = ELEVEN_VOICES.map(v => v.id);

/** Back-compat: map old Kling alias ids to new ElevenLabs ids. */
export function normalizeVoiceId(id: string): string {
  const map: Record<string, string> = {
    ai_kaiya: '9BWtsMINqrJLrRacOk9x', // legacy — not in catalog, but keep audio
    girlfriend_4_speech02: 'EXAVITQu4vr4xnSDxMaL',
    calm_story1: 'XrExE9yKIg1WjnnlVkGX',
    oversea_male1: 'nPczCjzI2devNBz1zQrb',
    uk_man2: 'JBFqnCBsd6RMkjVDRZzb',
    uk_boy1: 'N2lVS1w4EtoT3dr4eOWO',
  };
  return map[id] || id;
}

const SAMPLE_LINE = 'Hi, welcome to our new collection.';

type Filter = 'all' | 'female' | 'male' | 'UK' | 'US';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',    label: 'All' },
  { value: 'female', label: 'Female' },
  { value: 'male',   label: 'Male' },
  { value: 'UK',     label: 'UK' },
  { value: 'US',     label: 'US' },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function ElevenLabsVoicePicker({ value, onChange }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map()); // voiceId -> objectURL

  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
    cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    cacheRef.current.clear();
  }, []);

  const filtered = useMemo(() => ELEVEN_VOICES.filter((v) => {
    if (filter === 'all') return true;
    if (filter === 'female' || filter === 'male') return v.gender === filter;
    return v.accent === filter;
  }), [filter]);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  };

  const handlePlay = async (e: React.MouseEvent, voiceId: string) => {
    e.stopPropagation();

    if (playingId === voiceId) { stop(); return; }
    stop();

    let url = cacheRef.current.get(voiceId);
    if (!url) {
      setLoadingId(voiceId);
      try {
        const { data, error } = await supabase.functions.invoke('preview-talking-voice', {
          body: { script: SAMPLE_LINE, voice_id: voiceId, speed: 1 },
        });
        if (error || !data?.audio_base64) throw new Error(error?.message || 'Preview failed');
        url = `data:audio/mpeg;base64,${data.audio_base64}`;
        cacheRef.current.set(voiceId, url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Preview failed');
        setLoadingId(null);
        return;
      }
      setLoadingId(null);
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(voiceId);
    const clear = () => {
      if (audioRef.current === audio) { audioRef.current = null; setPlayingId(null); }
    };
    audio.addEventListener('ended', clear);
    audio.addEventListener('error', clear);
    audio.play().catch(clear);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-[11px] font-medium transition-all',
              filter === f.value
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filtered.map((v) => {
          const active = v.id === value;
          const isPlaying = playingId === v.id;
          const isLoading = loadingId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              className={cn(
                'group relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
                active
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handlePlay(e, v.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlay(e as unknown as React.MouseEvent, v.id);
                  }
                }}
                aria-label={isPlaying ? `Stop ${v.label} preview` : `Play ${v.label} preview`}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer shrink-0',
                  isPlaying || isLoading
                    ? 'bg-primary text-primary-foreground'
                    : active
                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {isLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : isPlaying
                    ? <Pause className="h-3.5 w-3.5" />
                    : <Play className="h-3.5 w-3.5 ml-0.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate flex items-center gap-1.5">
                  {v.label}
                  <Mic className="h-2.5 w-2.5 opacity-40" />
                </div>
                <div className="text-[10px] uppercase tracking-wide opacity-70 truncate">
                  {v.gender === 'neutral' ? 'NB' : v.gender} · {v.accent} · {v.vibe}
                </div>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Tap ▸ to preview · "{SAMPLE_LINE}"
      </p>
    </div>
  );
}
