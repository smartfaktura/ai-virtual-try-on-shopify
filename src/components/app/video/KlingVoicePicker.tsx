import { Check, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KlingVoice {
  id: string;
  label: string;
  language: 'en' | 'zh';
  gender: 'male' | 'female';
}

/** Curated Kling voice IDs — see Kling lip-sync docs. */
export const KLING_VOICES: KlingVoice[] = [
  { id: 'oversea_male1',   label: 'Oliver',   language: 'en', gender: 'male' },
  { id: 'oversea_male2',   label: 'Marcus',   language: 'en', gender: 'male' },
  { id: 'oversea_female1', label: 'Sophia',   language: 'en', gender: 'female' },
  { id: 'oversea_female2', label: 'Ava',      language: 'en', gender: 'female' },
  { id: 'ai_kaiya',        label: 'Kaiya',    language: 'en', gender: 'female' },
];

export const VOICE_IDS = KLING_VOICES.map(v => v.id);

interface KlingVoicePickerProps {
  value: string;
  onChange: (id: string) => void;
}

export function KlingVoicePicker({ value, onChange }: KlingVoicePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {KLING_VOICES.map((v) => {
        const active = v.id === value;
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
            <div className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md',
              active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              <Mic className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{v.label}</div>
              <div className="text-[10px] uppercase tracking-wide opacity-70">
                {v.gender} · {v.language}
              </div>
            </div>
            {active && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
