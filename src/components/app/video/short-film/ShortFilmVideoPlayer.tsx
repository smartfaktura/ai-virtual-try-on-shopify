import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Mic } from 'lucide-react';
import type { AudioAssets } from '@/types/shortFilm';

interface ShortFilmVideoPlayerProps {
  clips: { url: string; label: string }[];
  audioAssets?: AudioAssets;
}

export function ShortFilmVideoPlayer({ clips, audioAssets }: ShortFilmVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const shotAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [showMixer, setShowMixer] = useState(false);

  const current = clips[currentIndex];
  const hasAudio = audioAssets && (audioAssets.backgroundTrackUrl || audioAssets.perShotAudio.length > 0);

  // Sync background track volume
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Sync per-shot audio volumes
  useEffect(() => {
    shotAudioRefs.current.forEach((audio, key) => {
      const type = key.split('-')[0];
      audio.volume = type === 'sfx' ? sfxVolume : voiceVolume;
    });
  }, [sfxVolume, voiceVolume]);

  // Stop all per-shot audio
  const stopAllShotAudio = useCallback(() => {
    shotAudioRefs.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  // Play per-shot audio for current index
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

  const playNext = useCallback(() => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      if (bgAudioRef.current) bgAudioRef.current.pause();
      stopAllShotAudio();
    }
  }, [currentIndex, clips.length, stopAllShotAudio]);

  // Handle clip change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    stopAllShotAudio();
    if (isPlaying) {
      video.play().catch(() => {});
      // Play per-shot audio for new clip
      const shot = currentIndex + 1; // shot_index is 1-based
      playShotAudio(shot);
    }
  }, [currentIndex, isPlaying, stopAllShotAudio, playShotAudio]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      // Start background track
      if (bgAudioRef.current && audioAssets?.backgroundTrackUrl) {
        bgAudioRef.current.play().catch(() => {});
      }
      playShotAudio(currentIndex + 1);
    } else {
      video.pause();
      setIsPlaying(false);
      if (bgAudioRef.current) bgAudioRef.current.pause();
      stopAllShotAudio();
    }
  };

  const handleSkip = (direction: -1 | 1) => {
    stopAllShotAudio();
    setCurrentIndex(prev => prev + direction);
    setIsPlaying(true);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      shotAudioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      shotAudioRefs.current.clear();
    };
  }, []);

  if (clips.length === 0) return null;

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
        <video
          ref={videoRef}
          src={current?.url}
          className="w-full aspect-video"
          playsInline
          onEnded={playNext}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      {/* Background audio element */}
      {audioAssets?.backgroundTrackUrl && (
        <audio
          ref={bgAudioRef}
          src={audioAssets.backgroundTrackUrl}
          loop
          preload="auto"
        />
      )}

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={currentIndex === 0}
          onClick={() => handleSkip(-1)}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={currentIndex >= clips.length - 1}
          onClick={() => handleSkip(1)}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Shot {currentIndex + 1} / {clips.length} — {current?.label}
      </p>

      {/* Volume Mixer */}
      {showMixer && hasAudio && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-3">
          <p className="text-xs font-medium text-foreground">Volume Mixer</p>

          {audioAssets?.backgroundTrackUrl && (
            <div className="flex items-center gap-3">
              <Music className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground w-12">Music</span>
              <Slider
                value={[musicVolume * 100]}
                onValueChange={([v]) => setMusicVolume(v / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          )}

          {audioAssets?.perShotAudio.some(a => a.type === 'sfx') && (
            <div className="flex items-center gap-3">
              <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground w-12">SFX</span>
              <Slider
                value={[sfxVolume * 100]}
                onValueChange={([v]) => setSfxVolume(v / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
          )}

          {audioAssets?.perShotAudio.some(a => a.type === 'voiceover') && (
            <div className="flex items-center gap-3">
              <Mic className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground w-12">Voice</span>
              <Slider
                value={[voiceVolume * 100]}
                onValueChange={([v]) => setVoiceVolume(v / 100)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {Math.round(voiceVolume * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
