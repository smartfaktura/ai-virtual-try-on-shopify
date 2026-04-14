import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Music, Mic } from 'lucide-react';
import type { AudioAssets } from '@/types/shortFilm';

interface ShotMeta {
  shot_index: number;
  duration_sec: number;
}

interface ShortFilmVideoPlayerProps {
  clips: { url: string; label: string }[];
  audioAssets?: AudioAssets;
  shots?: ShotMeta[];
}

export function ShortFilmVideoPlayer({ clips, audioAssets, shots }: ShortFilmVideoPlayerProps) {
  const isSingleVideo = useMemo(() => {
    if (clips.length <= 1) return true;
    const firstUrl = clips[0]?.url;
    return clips.every(c => c.url === firstUrl);
  }, [clips]);

  if (isSingleVideo && clips.length > 0) {
    return <SingleVideoPlayer clip={clips[0]} audioAssets={audioAssets} shots={shots} />;
  }

  return <SingleVideoPlayer clip={clips[0]} audioAssets={audioAssets} shots={shots} />;
}

/* ─── Single combined video player with audio mixing ─── */
function SingleVideoPlayer({
  clip,
  audioAssets,
  shots,
}: {
  clip: { url: string; label: string };
  audioAssets?: AudioAssets;
  shots?: ShotMeta[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const shotAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(0.7);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [showMixer, setShowMixer] = useState(false);
  const [currentShotIdx, setCurrentShotIdx] = useState(-1);
  const [videoError, setVideoError] = useState(false);

  const hasAudio = audioAssets && (audioAssets.backgroundTrackUrl || audioAssets.perShotAudio.length > 0);

  // Calculate cumulative shot time offsets
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
      let audio = shotAudioRefs.current.get(key);
      if (!audio) {
        audio = new Audio(a.url);
        shotAudioRefs.current.set(key, audio);
      }
      audio.volume = a.type === 'sfx' ? sfxVolume : voiceVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    });
  }, [audioAssets, sfxVolume, voiceVolume]);

  // Track current shot with requestAnimationFrame for precise timing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasAudio || shotOffsets.length === 0) return;

    let rafId: number;
    const onFrame = () => {
      if (video.paused || video.ended) return;
      const t = video.currentTime;
      const match = shotOffsets.find(s => t >= s.start && t < s.end);
      if (match && match.shot_index !== currentShotIdx) {
        setCurrentShotIdx(match.shot_index);
        stopAllShotAudio();
        playShotAudio(match.shot_index);
      }
      rafId = requestAnimationFrame(onFrame);
    };

    const onPlay = () => { rafId = requestAnimationFrame(onFrame); };
    const onPause = () => { cancelAnimationFrame(rafId); };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    // Start immediately if already playing
    if (!video.paused) { rafId = requestAnimationFrame(onFrame); }

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [hasAudio, shotOffsets, currentShotIdx, stopAllShotAudio, playShotAudio]);

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
  };

  const handleSeek = () => {
    const video = videoRef.current;
    if (!video) return;
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

  const totalDuration = shots ? shots.reduce((sum, s) => sum + s.duration_sec, 0) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Preview Film</h3>
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
            onSeeked={handleSeek}
            onError={() => setVideoError(true)}
          />
        )}
      </div>

      {audioAssets?.backgroundTrackUrl && (
        <audio ref={bgAudioRef} src={audioAssets.backgroundTrackUrl} loop preload="auto" />
      )}

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={togglePlay} disabled={videoError}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
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
