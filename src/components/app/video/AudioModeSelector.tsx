import { cn } from '@/lib/utils';
import { Volume2, VolumeX, Mic } from 'lucide-react';

type AudioMode = 'silent' | 'ambient' | 'voice';

interface AudioModeSelectorProps {
  value: AudioMode;
  onChange: (value: AudioMode) => void;
  showVoice?: boolean;
}

const MODES: { id: AudioMode; label: string; icon: typeof VolumeX }[] = [
  { id: 'silent', label: 'Silent', icon: VolumeX },
  { id: 'ambient', label: 'Ambient', icon: Volume2 },
  { id: 'voice', label: 'Voice', icon: Mic },
];

export function AudioModeSelector({ value, onChange, showVoice = false }: AudioModeSelectorProps) {
  const visibleModes = showVoice ? MODES : MODES.filter(m => m.id !== 'voice');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Audio</label>
      <div className="flex gap-2">
        {visibleModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors',
                value === mode.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
