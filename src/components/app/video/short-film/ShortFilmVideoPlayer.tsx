import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Volume2, Music, Mic, Download } from 'lucide-react';
import type { AudioAssets } from '@/types/shortFilm';

interface ShotMeta {
  shot_index: number;
  duration_sec: number;
}

interface ShortFilmVideoPlayerProps {
  clips: { url: string; label: string }[];
  audioAssets?: AudioAssets;
  shots?: ShotMeta[];
  onDownload?: () => void;
}

export function ShortFilmVideoPlayer({ clips, audioAssets, shots, onDownload }: ShortFilmVideoPlayerProps) {
  if (!clips.length) return null;
  return <SingleVideoPlayer clip={clips[0]} audioAssets={audioAssets} shots={shots} onDownload={onDownload} />;
}

/* ─── Single combined video player with audio mixing ─── */
function SingleVideoPlayer({
  clip,
  audioAssets,
  shots,
  onDownload,
}: {
  clip: { url: string; label: string };
  audioAssets?: AudioAssets;
  shots?: ShotMeta[];
  onDownload?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const shotAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const rafRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.7);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [showMixer, setShowMixer] = useState(false);
  const [currentShotIdx, setCurrentShotIdx] = useState(-1);
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hasAudio = audioAssets && (audioAssets.backgroundTrackUrl || audioAssets.perShotAudio.length > 0);

  const shotOffsets = useMemo(() => {
    if (!shots || shots.length === 0) return [];
    let acc = 0;
    return shots.map(s => {
      const start = acc;
      acc += s.duration_sec;
      return { shot_index: s.shot_index, start, end: acc };
    });
  }, [shots]);

  // Volume sync
  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    shotAudioRefs.current.forEach((audio, key) => {
      const type = key.split('-')[0];
      audio.volume = type === 'sfx' ? sfxVolume : voiceVolume;
    });
  }, [sfxVolume, voiceVolume]);

  // Preload per-shot audio on mount
  useEffect(() => {
    if (!audioAssets) return;
    audioAssets.perShotAudio.forEach(a => {
      const key = `${a.type}-${a.shotIndex}`;
      if (!shotAudioRefs.current.has(key)) {
        const audio = new Audio(a.url);
        audio.preload = 'auto';
        audio.volume = a.type === 'sfx' ? sfxVolume : voiceVolume;
        shotAudioRefs.current.set(key, audio);
      }
    });
  }, [audioAssets]);

  const stopAllShotAudio = useCallback(() => {
    shotAudioRefs.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const playShotAudio = useCallback((shotIndex: number) => {
    if (!audioAssets) return;
    const shotAudios = audioAssets.perShotAudio.filter(a => a.shotIndex === shotIndex);
    shotAudios.forEach(a => {
      const key = `${a.type}-${a.shotIndex}`;
      const audio = shotAudioRefs.current.get(key);
      if (audio) {
        audio.volume = a.type === 'sfx' ? sfxVolume : voiceVolume;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });
  }, [audioAssets, sfxVolume, voiceVolume]);

  // RAF loop for precise shot tracking + progress bar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let lastShotIdx = -1;

    const onFrame = () => {
      if (video.paused || video.ended) return;
      const t = video.currentTime;
      const d = video.duration || 1;
      setCurrentTime(t);
      setProgress((t / d) * 100);

      if (hasAudio && shotOffsets.length > 0) {
        const match = shotOffsets.find(s => t >= s.start && t < s.end);
        if (match && match.shot_index !== lastShotIdx) {
          lastShotIdx = match.shot_index;
          setCurrentShotIdx(match.shot_index);
          stopAllShotAudio();
          playShotAudio(match.shot_index);
        }
      }
      rafRef.current = requestAnimationFrame(onFrame);
    };

    const onPlay = () => { lastShotIdx = -1; rafRef.current = requestAnimationFrame(onFrame); };
    const onPause = () => { cancelAnimationFrame(rafRef.current); };
    const onLoadedMetadata = () => { setDuration(video.duration); };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    if (video.duration) setDuration(video.duration);
    if (!video.paused) { rafRef.current = requestAnimationFrame(onFrame); }

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [hasAudio, shotOffsets, stopAllShotAudio, playShotAudio]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      if (bgAudioRef.current && audioAssets?.backgroundTrackUrl) {
        bgAudioRef.current.currentTime = video.currentTime;
        bgAudioRef.current.play().catch(() => {});
      }
    } else {
      video.pause();
      setIsPlaying(false);
      if (bgAudioRef.current) bgAudioRef.current.pause();
      stopAllShotAudio();
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (bgAudioRef.current) bgAudioRef.current.pause();
    stopAllShotAudio();
    setCurrentShotIdx(-1);
    setProgress(100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
    setProgress(pct * 100);
    setCurrentTime(video.currentTime);
    if (bgAudioRef.current) {
      bgAudioRef.current.currentTime = video.currentTime;
    }
    stopAllShotAudio();
    setCurrentShotIdx(-1);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      shotAudioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      shotAudioRefs.current.clear();
    };
  }, []);

  if (!clip) return null;

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = shots ? shots.reduce((sum, s) => sum + s.duration_sec, 0) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Your Short Film</h3>
        <div className="flex items-center gap-1.5">
          {hasAudio && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground"
              onClick={() => setShowMixer(!showMixer)}
            >
              <Volume2 className="h-3 w-3" />
              Mixer
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onDownload}>
              <Download className="h-3 w-3" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-black">
        {videoError ? (
          <div className="w-full aspect-video flex items-center justify-center bg-muted/10">
            <p className="text-sm text-muted-foreground">Video failed to load. Try downloading instead.</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={clip.url}
            className="w-full aspect-video"
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleVideoEnd}
            onError={() => setVideoError(true)}
          />
        )}
      </div>

      {audioAssets?.backgroundTrackUrl && (
        <audio ref={bgAudioRef} src={audioAssets.backgroundTrackUrl} loop preload="auto" />
      )}

      {/* Controls bar */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={togglePlay} disabled={videoError}>
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>

        <span className="text-[11px] font-mono text-muted-foreground w-10 shrink-0">
          {formatTime(currentTime)}
        </span>

        {/* Clickable progress bar */}
        <div
          className="flex-1 h-2 rounded-full bg-secondary cursor-pointer relative overflow-hidden"
          onClick={handleSeek}
        >
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] font-mono text-muted-foreground w-10 shrink-0 text-right">
          {formatTime(duration)}
        </span>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {totalDuration ? `${shots?.length} shots · ${totalDuration}s` : clip.label}
        {hasAudio && ' · 🔊 Audio'}
      </p>

      {showMixer && hasAudio && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          <p className="text-xs font-medium text-foreground">Volume Mixer</p>
          {audioAssets?.backgroundTrackUrl && (
            <MixerRow icon={Music} label="Music" value={musicVolume} onChange={setMusicVolume} />
          )}
          {audioAssets?.perShotAudio.some(a => a.type === 'sfx') && (
            <MixerRow icon={Volume2} label="SFX" value={sfxVolume} onChange={setSfxVolume} />
          )}
          {audioAssets?.perShotAudio.some(a => a.type === 'voiceover') && (
            <MixerRow icon={Mic} label="Voice" value={voiceVolume} onChange={setVoiceVolume} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Mixer row component ─── */
function MixerRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-12">{label}</span>
      <Slider
        value={[value * 100]}
        onValueChange={([v]) => onChange(v / 100)}
        max={100}
        step={1}
        className="flex-1"
      />
      <span className="text-[10px] text-muted-foreground w-8 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
