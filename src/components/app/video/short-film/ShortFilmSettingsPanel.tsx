import { useState, useRef } from 'react';
import type { ShortFilmSettings } from '@/types/shortFilm';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone, Square, RectangleVertical, Volume2, VolumeX, Mic, Music, AudioLines, Play, Loader2, Square as StopIcon, Zap, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ShortFilmSettingsPanelProps {
  settings: ShortFilmSettings;
  onChange: (settings: ShortFilmSettings) => void;
  onPreviewAudio?: () => Promise<string | null>;
}

const ASPECT_OPTIONS = [
  { value: '16:9' as const, label: '16:9', icon: Monitor, desc: 'Landscape' },
  { value: '9:16' as const, label: '9:16', icon: Smartphone, desc: 'Portrait' },
  { value: '1:1' as const, label: '1:1', icon: Square, desc: 'Square' },
  { value: '4:5' as const, label: '4:5', icon: RectangleVertical, desc: 'Social' },
];

const AUDIO_OPTIONS = [
  { value: 'silent' as const, label: 'Silent', icon: VolumeX, desc: 'No audio' },
  { value: 'ambient' as const, label: 'Ambient', icon: Volume2, desc: 'Kling native' },
  { value: 'music' as const, label: 'Music', icon: Music, desc: 'AI background track' },
  { value: 'voiceover' as const, label: 'Voiceover', icon: Mic, desc: 'AI narration' },
  { value: 'full_mix' as const, label: 'Full Mix', icon: AudioLines, desc: 'Music + SFX + Voice' },
];

const PRESERVATION_OPTIONS = [
  { value: 'low' as const, label: 'Low', desc: 'More creative freedom' },
  { value: 'medium' as const, label: 'Medium', desc: 'Balanced' },
  { value: 'high' as const, label: 'High', desc: 'Maximum fidelity' },
];

const DURATION_OPTIONS = [
  { value: '5' as const, label: '5s per shot' },
];

const VOICE_OPTIONS = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', label: 'George — warm male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Sarah — clear female' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', label: 'Roger — confident male' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', label: 'Laura — elegant female' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', label: 'Liam — neutral male' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', label: 'Alice — soft female' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', label: 'Lily — gentle female' },
  { id: 'onwK4e9ZLuTAKqWW03F9', label: 'Daniel — deep male' },
  { id: 'cgSgspJ2msm6clMCkdW9', label: 'Jessica — bright female' },
  { id: 'nPczCjzI2devNBz1zQrb', label: 'Brian — professional male' },
];

export function ShortFilmSettingsPanel({ settings, onChange, onPreviewAudio }: ShortFilmSettingsPanelProps) {
  const update = (partial: Partial<ShortFilmSettings>) =>
    onChange({ ...settings, ...partial });

  const showMusicPrompt = settings.audioMode === 'music' || settings.audioMode === 'full_mix';
  const showVoicePicker = settings.audioMode === 'voiceover' || settings.audioMode === 'full_mix';
  const showPreview = settings.audioMode !== 'silent' && settings.audioMode !== 'ambient' && !!onPreviewAudio;

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Final adjustments before generating your film.
        </p>
      </div>

      {/* Quality */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Film Quality</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => update({ quality: 'standard' })}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
              settings.quality === 'standard'
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border hover:border-primary/40'
            )}
          >
            <Zap className="h-4 w-4 text-foreground" />
            <span className="text-xs font-medium">Standard</span>
            <span className="text-[10px] text-muted-foreground">Faster & cheaper</span>
          </button>
          <button
            onClick={() => update({ quality: 'pro' })}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
              settings.quality === 'pro'
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border hover:border-primary/40'
            )}
          >
            <Crown className="h-4 w-4 text-foreground" />
            <span className="text-xs font-medium">Pro</span>
            <span className="text-[10px] text-muted-foreground">Highest quality</span>
          </button>
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Aspect Ratio</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

      {/* Shot Duration info */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Duration</p>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          Variable per shot · Up to 6 shots · 15s total (platform limit)
        </div>
      </div>

      {/* Audio Mode */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Audio</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {AUDIO_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => update({ audioMode: opt.value })}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all',
                  settings.audioMode === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight text-center">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Music Prompt */}
      {showMusicPrompt && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Music Style</p>
          <p className="text-xs text-muted-foreground">
            Describe the mood and style of the background track.
          </p>
          <Input
            value={settings.musicPrompt || ''}
            onChange={(e) => update({ musicPrompt: e.target.value })}
            placeholder="e.g. cinematic ambient, warm piano, energetic electronic..."
            className="text-sm"
          />
        </div>
      )}

      {/* Voice Picker */}
      {showVoicePicker && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Voiceover Voice</p>
          <p className="text-xs text-muted-foreground">
            Choose a voice for AI narration of script lines.
          </p>
          <Select
            value={settings.voiceId || VOICE_OPTIONS[0].id}
            onValueChange={(val) => update({ voiceId: val })}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Audio Preview */}
      {showPreview && (
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isLoadingPreview}
            onClick={async () => {
              // If currently playing, stop it
              if (isPlayingPreview && previewAudioRef.current) {
                previewAudioRef.current.pause();
                previewAudioRef.current = null;
                setIsPlayingPreview(false);
                return;
              }
              setIsLoadingPreview(true);
              try {
                const url = await onPreviewAudio!();
                if (url) {
                  const audio = new Audio(url);
                  previewAudioRef.current = audio;
                  audio.onended = () => {
                    setIsPlayingPreview(false);
                    previewAudioRef.current = null;
                  };
                  setIsLoadingPreview(false);
                  setIsPlayingPreview(true);
                  await audio.play();
                } else {
                  setIsLoadingPreview(false);
                }
              } catch {
                setIsLoadingPreview(false);
                setIsPlayingPreview(false);
              }
            }}
          >
            {isLoadingPreview ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating preview...</>
            ) : isPlayingPreview ? (
              <><StopIcon className="h-3.5 w-3.5" /> Stop Preview</>
            ) : (
              <><Play className="h-3.5 w-3.5" /> Preview Audio</>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Generates a short 10s sample so you can tune settings before committing.
          </p>
        </div>
      )}

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
