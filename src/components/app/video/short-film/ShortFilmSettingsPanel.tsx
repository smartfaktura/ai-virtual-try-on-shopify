import { useState, useRef } from 'react';
import type { ShortFilmSettings, AudioLayers, FilmType } from '@/types/shortFilm';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone, Square, RectangleVertical, Play, Loader2, Square as StopIcon, Zap, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ShortFilmSettingsPanelProps {
  settings: ShortFilmSettings;
  onChange: (settings: ShortFilmSettings) => void;
  onPreviewAudio?: () => Promise<string | null>;
  filmType?: FilmType | null;
  musicDirection?: string;
}

const ASPECT_OPTIONS = [
  { value: '16:9' as const, label: '16:9', icon: Monitor, desc: 'Landscape' },
  { value: '9:16' as const, label: '9:16', icon: Smartphone, desc: 'Portrait' },
  { value: '1:1' as const, label: '1:1', icon: Square, desc: 'Square' },
  { value: '4:5' as const, label: '4:5', icon: RectangleVertical, desc: 'Social' },
];

const PRESERVATION_OPTIONS = [
  { value: 'low' as const, label: 'Low', desc: 'More creative freedom' },
  { value: 'medium' as const, label: 'Medium', desc: 'Balanced' },
  { value: 'high' as const, label: 'High', desc: 'Maximum fidelity' },
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

const MUSIC_PRESETS: { key: string; label: string; forFilmType?: string }[] = [
  { key: 'product_launch', label: 'Cinematic Orchestral', forFilmType: 'product_launch' },
  { key: 'brand_story', label: 'Warm Piano & Strings', forFilmType: 'brand_story' },
  { key: 'fashion_campaign', label: 'Minimal Deep House', forFilmType: 'fashion_campaign' },
  { key: 'beauty_film', label: 'Ethereal Ambient', forFilmType: 'beauty_film' },
  { key: 'luxury_mood', label: 'Minimal Piano & Pads', forFilmType: 'luxury_mood' },
  { key: 'sports_campaign', label: 'Driving Electronic', forFilmType: 'sports_campaign' },
  { key: 'lifestyle_teaser', label: 'Warm Acoustic', forFilmType: 'lifestyle_teaser' },
];

function getDefaultMusicPresetKey(filmType?: FilmType | null, musicDirection?: string): string {
  if (musicDirection) return 'ai_director';
  if (filmType) {
    const match = MUSIC_PRESETS.find(p => p.forFilmType === filmType);
    if (match) return match.key;
  }
  return 'product_launch';
}

export function ShortFilmSettingsPanel({ settings, onChange, onPreviewAudio, filmType, musicDirection }: ShortFilmSettingsPanelProps) {
  const update = (partial: Partial<ShortFilmSettings>) =>
    onChange({ ...settings, ...partial });

  const layers: AudioLayers = settings.audioLayers || { music: true, sfx: true, voiceover: true };
  const showMusicSection = layers.music;
  const showVoicePicker = layers.voiceover;
  const showPreview = (layers.music || layers.voiceover) && !!onPreviewAudio;

  const currentPresetKey = settings.musicPresetKey || getDefaultMusicPresetKey(filmType, musicDirection);

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

      {/* Audio note — configured in Shot Plan */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Audio</p>
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          Audio layers are configured in the Shot Plan step.
          {layers.music && ' Music ✓'}
          {layers.sfx && ' SFX ✓'}
          {layers.voiceover && ' Voiceover ✓'}
          {!layers.music && !layers.sfx && !layers.voiceover && ' All layers disabled'}
        </div>
      </div>

      {/* Music Style Dropdown */}
      {showMusicSection && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Music Style</p>
          <p className="text-xs text-muted-foreground">
            Choose a preset or customize the background music mood.
          </p>
          <Select
            value={currentPresetKey}
            onValueChange={(val) => {
              update({ musicPresetKey: val, musicPrompt: val === 'custom' ? (settings.musicPrompt || '') : undefined });
            }}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select music style" />
            </SelectTrigger>
            <SelectContent>
              {musicDirection && (
                <SelectItem value="ai_director">
                  🤖 AI Director Suggestion
                </SelectItem>
              )}
              {MUSIC_PRESETS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}{filmType && p.forFilmType === filmType ? ' ★' : ''}
                </SelectItem>
              ))}
              <SelectItem value="custom">✏️ Custom</SelectItem>
            </SelectContent>
          </Select>

          {/* Show AI Director suggestion preview */}
          {currentPresetKey === 'ai_director' && musicDirection && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-muted-foreground italic">
              "{musicDirection}"
            </div>
          )}

          {/* Custom text input */}
          {currentPresetKey === 'custom' && (
            <Input
              value={settings.musicPrompt || ''}
              onChange={(e) => update({ musicPrompt: e.target.value })}
              placeholder="e.g. cinematic ambient, warm piano, energetic electronic..."
              className="text-sm"
            />
          )}
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
