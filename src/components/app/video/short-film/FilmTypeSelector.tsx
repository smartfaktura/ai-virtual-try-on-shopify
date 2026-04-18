import { FILM_TYPE_OPTIONS } from '@/lib/shortFilmPlanner';
import type { FilmType, AudioLayers } from '@/types/shortFilm';
import { cn } from '@/lib/utils';
import { Music, MessageSquare, Volume2 } from 'lucide-react';

interface FilmTypeSelectorProps {
  value: FilmType | null;
  onChange: (type: FilmType) => void;
  audioLayers?: AudioLayers;
  onAudioLayersChange?: (layers: AudioLayers) => void;
}

const AUDIO_PREF_OPTIONS = [
  {
    key: 'music' as const,
    label: 'Background Music',
    description: 'Add a music track on top of your film',
    icon: Music,
    defaultOn: true,
  },
  {
    key: 'voiceover' as const,
    label: 'Dialog / Speech',
    description: 'Characters speak in the video',
    icon: MessageSquare,
    defaultOn: false,
  },
  {
    key: 'sfx' as const,
    label: 'Sound Effects',
    description: 'Ambient sounds, impacts, transitions',
    icon: Volume2,
    defaultOn: true,
  },
];

export function FilmTypeSelector({ value, onChange, audioLayers, onAudioLayersChange }: FilmTypeSelectorProps) {
  const layers = audioLayers || { music: true, sfx: true, voiceover: false };

  const toggleLayer = (key: 'music' | 'sfx' | 'voiceover') => {
    if (!onAudioLayersChange) return;
    onAudioLayersChange({ ...layers, [key]: !layers[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">What kind of film?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a film type to set defaults for story structure, motion, and tone
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {FILM_TYPE_OPTIONS.map((option) => {
          const Icon = option.lucideIcon;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                'hover:border-primary/50 hover:shadow-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                value === option.value
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                  : 'border-border bg-card'
              )}
            >
              {Icon && (
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center',
                  value === option.value ? 'bg-primary/10' : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'h-4 w-4',
                    value === option.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Audio Preferences — shown after film type is selected */}
      {value && onAudioLayersChange && (
        <div className="space-y-3 pt-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Audio Preferences</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose what audio layers to include — this guides the AI Director's planning
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {AUDIO_PREF_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isOn = layers[opt.key];
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleLayer(opt.key)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                    'hover:border-primary/50',
                    isOn
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border bg-card'
                  )}
                >
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    isOn ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Icon className={cn('h-4 w-4', isOn ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Dialog & SFX are generated natively by the video engine. Background music is added as a separate layer.
          </p>
          {layers.voiceover && (
            <p className="text-[11px] text-primary/80">
              When Dialog/Speech is on, AI Director will write narration for each shot automatically.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
