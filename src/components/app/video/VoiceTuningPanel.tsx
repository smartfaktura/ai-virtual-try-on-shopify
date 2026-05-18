import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export type TtsModel = 'eleven_multilingual_v2' | 'eleven_turbo_v2_5';

export interface VoiceSettings {
  stability: number;        // 0..1
  similarity_boost: number; // 0..1
  style: number;            // 0..1
  use_speaker_boost: boolean;
  speed: number;            // 0.7..1.2
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0,
  use_speaker_boost: true,
  speed: 1,
};

export const DEFAULT_TTS_MODEL: TtsModel = 'eleven_multilingual_v2';

interface Props {
  settings: VoiceSettings;
  onSettingsChange: (s: VoiceSettings) => void;
  model: TtsModel;
  onModelChange: (m: TtsModel) => void;
}

function Row({
  label, hint, value, min, max, step, leftLabel, rightLabel, onChange,
}: {
  label: string; hint: string; value: number; min: number; max: number; step: number;
  leftLabel: string; rightLabel: string; onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <span className="text-[11px] tabular-nums text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={min} max={max} step={step} />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/80">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <p className="text-[10px] text-muted-foreground/70">{hint}</p>
    </div>
  );
}

export function VoiceTuningPanel({ settings, onSettingsChange, model, onModelChange }: Props) {
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<VoiceSettings>) => onSettingsChange({ ...settings, ...patch });
  const reset = () => { onSettingsChange(DEFAULT_VOICE_SETTINGS); onModelChange(DEFAULT_TTS_MODEL); };

  return (
    <div className="rounded-lg border border-border bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-xs font-medium">Voice tuning</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-border/60 px-3 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">ElevenLabs controls</span>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <Row
            label="Stability"
            hint="Higher = predictable, lower = more emotion"
            value={settings.stability} min={0} max={1} step={0.05}
            leftLabel="Expressive" rightLabel="Consistent"
            onChange={(n) => update({ stability: n })}
          />
          <Row
            label="Similarity"
            hint="How closely to match the original voice"
            value={settings.similarity_boost} min={0} max={1} step={0.05}
            leftLabel="Creative" rightLabel="True to voice"
            onChange={(n) => update({ similarity_boost: n })}
          />
          <Row
            label="Style"
            hint="Exaggerates voice character — keep low for neutral delivery"
            value={settings.style} min={0} max={1} step={0.05}
            leftLabel="Neutral" rightLabel="Stylized"
            onChange={(n) => update({ style: n })}
          />
          <Row
            label="Speed"
            hint="Speech rate — 1.0 is natural"
            value={settings.speed} min={0.7} max={1.2} step={0.05}
            leftLabel="Slower" rightLabel="Faster"
            onChange={(n) => update({ speed: n })}
          />

          <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
            <div>
              <Label className="text-xs font-medium">Speaker boost</Label>
              <p className="text-[10px] text-muted-foreground/70">Sharpens clarity and voice match</p>
            </div>
            <Switch
              checked={settings.use_speaker_boost}
              onCheckedChange={(c) => update({ use_speaker_boost: c })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Model</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { v: 'eleven_multilingual_v2', l: 'Multilingual v2', d: 'Best quality' },
                { v: 'eleven_turbo_v2_5',      l: 'Turbo v2.5',      d: 'Faster, lighter' },
              ] as { v: TtsModel; l: string; d: string }[]).map((opt) => {
                const active = model === opt.v;
                return (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => onModelChange(opt.v)}
                    className={cn(
                      'rounded-md border px-3 py-2 text-left text-xs transition-all',
                      active
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40',
                    )}
                  >
                    <div className="font-medium">{opt.l}</div>
                    <div className="text-[10px] opacity-70">{opt.d}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
