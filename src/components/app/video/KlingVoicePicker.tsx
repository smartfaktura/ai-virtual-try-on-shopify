import { Check, Mic, Play, Pause } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface KlingVoice {
  id: string;
  label: string;
  language: 'en' | 'zh';
  gender: 'male' | 'female';
}

/** Curated Kling voice IDs — see Kling lip-sync docs. */
export const KLING_VOICES: KlingVoice[] = [
  { id: 'ai_kaiya',              label: 'Kaiya',  language: 'en', gender: 'female' },
  { id: 'girlfriend_4_speech02', label: 'Mia',    language: 'en', gender: 'female' },
  { id: 'calm_story1',           label: 'Lila',   language: 'en', gender: 'female' },
  { id: 'oversea_male1',         label: 'Oliver', language: 'en', gender: 'male' },
  { id: 'uk_man2',               label: 'James',  language: 'en', gender: 'male' },
  { id: 'uk_boy1',               label: 'Theo',   language: 'en', gender: 'male' },
];

export const VOICE_IDS = KLING_VOICES.map(v => v.id);

const SAMPLE_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/voice-samples`;

interface KlingVoicePickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function KlingVoicePicker({ value, onChange }: KlingVoicePickerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handlePlay = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Stop whatever is playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingId === id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(`${SAMPLE_BASE}/${id}.mp3`);
    audioRef.current = audio;
    setPlayingId(id);
    audio.addEventListener('ended', () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingId((cur) => (cur === id ? null : cur));
      }
    });
    audio.addEventListener('error', () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingId((cur) => (cur === id ? null : cur));
      }
    });
    audio.play().catch(() => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingId((cur) => (cur === id ? null : cur));
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {KLING_VOICES.map((v) => {
          const active = v.id === value;
          const isPlaying = playingId === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              className={cn(
                'group relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
                active
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground'
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
                  'flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                  isPlaying
                    ? 'bg-primary text-primary-foreground'
                    : active
                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                {isPlaying
                  ? <Pause className="h-3.5 w-3.5" />
                  : <Play className="h-3.5 w-3.5 ml-0.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate flex items-center gap-1.5">
                  {v.label}
                  <Mic className="h-2.5 w-2.5 opacity-40" />
                </div>
                <div className="text-[10px] uppercase tracking-wide opacity-70">
                  {v.gender} · {v.language}
                </div>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Tap ▸ to preview · sample line: "Hi, welcome to our new collection"
      </p>
    </div>
  );
}
