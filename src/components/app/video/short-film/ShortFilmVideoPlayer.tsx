import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface ShortFilmVideoPlayerProps {
  clips: { url: string; label: string }[];
}

export function ShortFilmVideoPlayer({ clips }: ShortFilmVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = clips[currentIndex];

  const playNext = useCallback(() => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, clips.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    if (isPlaying) {
      video.play().catch(() => {});
    }
  }, [currentIndex, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  if (clips.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Preview Film</h3>
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
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={currentIndex === 0}
          onClick={() => { setCurrentIndex(prev => prev - 1); setIsPlaying(true); }}
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
          onClick={() => { setCurrentIndex(prev => prev + 1); setIsPlaying(true); }}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Shot {currentIndex + 1} / {clips.length} — {current?.label}
      </p>
    </div>
  );
}
