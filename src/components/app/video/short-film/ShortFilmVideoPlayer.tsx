import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Music, Loader2 } from 'lucide-react';
import type { AudioAssets } from '@/types/shortFilm';

interface ShotMeta {
  shot_index: number;
  duration_sec: number;
  sfx_trigger_at?: number;
}

interface ShortFilmVideoPlayerProps {
  clips: { url: string; label: string }[];
  audioAssets?: AudioAssets;
  shots?: ShotMeta[];
  onDownload?: () => void;
  onDownloadWithAudio?: () => void;
  isDownloadingWithAudio?: boolean;
}

export function ShortFilmVideoPlayer({ clips, audioAssets, shots, onDownload, onDownloadWithAudio, isDownloadingWithAudio }: ShortFilmVideoPlayerProps) {
  if (!clips.length) return null;
  return <SingleVideoPlayer clip={clips[0]} audioAssets={audioAssets} shots={shots} onDownload={onDownload} onDownloadWithAudio={onDownloadWithAudio} isDownloadingWithAudio={isDownloadingWithAudio} />;
}

/* ─── Single combined video player with background music sync ─── */
function SingleVideoPlayer({
  clip,
  audioAssets,
  shots,
  onDownload,
  onDownloadWithAudio,
  isDownloadingWithAudio,
}: {
  clip: { url: string; label: string };
  audioAssets?: AudioAssets;
  shots?: ShotMeta[];
  onDownload?: () => void;
  onDownloadWithAudio?: () => void;
  isDownloadingWithAudio?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const musicVolume = 0.5;
  const hasMusic = !!audioAssets?.backgroundTrackUrl;

  // Volume sync on mount
  useEffect(() => {
    if (bgAudioRef.current) bgAudioRef.current.volume = musicVolume;
  }, []);

  // RAF loop for progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onFrame = () => {
      if (video.paused || video.ended) return;
      const t = video.currentTime;
      const d = video.duration || 1;
      setCurrentTime(t);
      setProgress((t / d) * 100);
      rafRef.current = requestAnimationFrame(onFrame);
    };

    const onPlay = () => { rafRef.current = requestAnimationFrame(onFrame); };
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
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      if (bgAudioRef.current && hasMusic) {
        bgAudioRef.current.currentTime = video.currentTime;
        bgAudioRef.current.play().catch(() => {});
      }
    } else {
      video.pause();
      setIsPlaying(false);
      if (bgAudioRef.current) bgAudioRef.current.pause();
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (bgAudioRef.current) bgAudioRef.current.pause();
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
  };

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
          {onDownload && (
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onDownload}>
              <Download className="h-3 w-3" />
              Download
            </Button>
          )}
          {hasMusic && onDownloadWithAudio && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={onDownloadWithAudio}
              disabled={isDownloadingWithAudio}
            >
              {isDownloadingWithAudio ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Music className="h-3 w-3" />
              )}
              {isDownloadingWithAudio ? 'Muxing...' : 'Download with Music'}
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
            muted={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleVideoEnd}
            onError={() => setVideoError(true)}
          />
        )}
      </div>

      {hasMusic && (
        <audio ref={bgAudioRef} src={audioAssets!.backgroundTrackUrl} loop preload="auto" />
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
        {hasMusic && ' · 🎵 Music'}
      </p>
    </div>
  );
}
