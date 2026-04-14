import type { ShortFilmSettings } from '@/types/shortFilm';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone, Square, RectangleVertical, Volume2, VolumeX, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ShortFilmSettingsPanelProps {
  settings: ShortFilmSettings;
  onChange: (settings: ShortFilmSettings) => void;
}

const ASPECT_OPTIONS = [
  { value: '16:9' as const, label: '16:9', icon: Monitor, desc: 'Landscape' },
  { value: '9:16' as const, label: '9:16', icon: Smartphone, desc: 'Portrait' },
  { value: '1:1' as const, label: '1:1', icon: Square, desc: 'Square' },
  { value: '4:5' as const, label: '4:5', icon: RectangleVertical, desc: 'Social' },
];

const AUDIO_OPTIONS = [
  { value: 'silent' as const, label: 'Silent', icon: VolumeX },
  { value: 'ambient' as const, label: 'Ambient', icon: Volume2 },
  { value: 'voice' as const, label: 'Voiceover', icon: Mic },
];

const PRESERVATION_OPTIONS = [
  { value: 'low' as const, label: 'Low', desc: 'More creative freedom' },
  { value: 'medium' as const, label: 'Medium', desc: 'Balanced' },
  { value: 'high' as const, label: 'High', desc: 'Maximum fidelity' },
];

const DURATION_OPTIONS = [
  { value: '5' as const, label: '5s per shot' },
  { value: '10' as const, label: '10s per shot' },
];

export function ShortFilmSettingsPanel({ settings, onChange }: ShortFilmSettingsPanelProps) {
  const update = (partial: Partial<ShortFilmSettings>) =>
    onChange({ ...settings, ...partial });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Final adjustments before generating your film.
        </p>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Aspect Ratio</p>
        <div className="grid grid-cols-4 gap-2">
          {ASPECT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => update({ aspectRatio: opt.value })}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
                  settings.aspectRatio === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <Icon className="h-4 w-4 text-foreground" />
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shot Duration */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Shot Duration</p>
        <div className="grid grid-cols-2 gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ shotDuration: opt.value })}
              className={cn(
                'rounded-lg border p-3 text-sm font-medium transition-all',
                settings.shotDuration === opt.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audio Mode */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Audio</p>
        <div className="grid grid-cols-3 gap-2">
          {AUDIO_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => update({ audioMode: opt.value })}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border p-3 transition-all',
                  settings.audioMode === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preservation Level */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Preservation Level</p>
        <div className="grid grid-cols-3 gap-2">
          {PRESERVATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ preservationLevel: opt.value })}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg border p-3 transition-all',
                settings.preservationLevel === opt.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <span className="text-sm font-medium">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tone / Mood */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Tone / Mood Override</p>
        <p className="text-xs text-muted-foreground">
          Optional — override the default tone for the chosen film type.
        </p>
        <Input
          value={settings.tone || ''}
          onChange={(e) => update({ tone: e.target.value })}
          placeholder="e.g. dark & moody, warm editorial, high-energy..."
          className="text-sm"
        />
      </div>
    </div>
  );
}
