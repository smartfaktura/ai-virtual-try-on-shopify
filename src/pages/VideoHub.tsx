import { Film, Layers, Users, ArrowRightLeft, Clapperboard, Play, Pause, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { VideoWorkflowCard } from '@/components/app/video/VideoWorkflowCard';
import { useGenerateVideo } from '@/hooks/useGenerateVideo';
import { Badge } from '@/components/ui/badge';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

type PlayState = 'idle' | 'loading' | 'playing' | 'paused';

function RecentVideoCard({ video }: { video: { id: string; status: string; source_image_url: string; video_url: string | null; created_at: string; prompt: string } }) {
  const [playState, setPlayState] = useState<PlayState>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const isComplete = video.status === 'complete' && video.video_url;
  const mountVideo = playState !== 'idle';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  const startPlayback = useCallback(async () => {
    if (!isComplete || playState === 'loading') return;
    setPlayState('loading');
  }, [isComplete, playState]);

  const stopPlayback = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setPlayState('idle');
  }, []);

  // When video element mounts and can play, start it
  const handleCanPlay = useCallback(async () => {
    if (!videoRef.current || playState !== 'loading') return;
    try {
      await videoRef.current.play();
      setPlayState('playing');
    } catch {
      // AbortError from rapid pause/play — just reset
      setPlayState('idle');
    }
  }, [playState]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile || !isComplete) return;
    startPlayback();
  }, [isMobile, isComplete, startPlayback]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile || !isComplete) return;
    stopPlayback();
  }, [isMobile, isComplete, stopPlayback]);

  const handleClick = useCallback(() => {
    if (!isComplete || playState === 'loading') return;
    if (playState === 'playing' || playState === 'paused') {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isComplete, playState, stopPlayback, startPlayback]);

  const showStatusBadge = video.status === 'processing' || video.status === 'queued';
  const isPlaying = playState === 'playing';
  const isLoading = playState === 'loading';

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-muted/30">
        {/* Only mount video element on interaction */}
        {mountVideo && isComplete && (
          <video
            ref={videoRef}
            src={video.video_url!}
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={handleCanPlay}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        <img
          src={video.source_image_url}
          alt=""
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
        />

        {showStatusBadge && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-amber-50 text-amber-900 animate-pulse">
            {video.status === 'processing' ? 'Processing' : 'Queued'}
          </Badge>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <Loader2 className="h-6 w-6 text-background animate-spin" />
          </div>
        )}

        {/* Play icon when idle */}
        {isComplete && playState === 'idle' && (
          <div className="absolute bottom-2 left-2 z-10">
            <div className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Play className="h-3 w-3 text-foreground ml-0.5" />
            </div>
          </div>
        )}

        {/* Pause overlay on hover while playing */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Pause className="h-4 w-4 text-foreground" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default function VideoHub() {
  const { history, isLoadingHistory } = useGenerateVideo();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Create Videos"
        subtitle="Turn product shots, campaign visuals, and reference frames into polished short videos."
      >
        <div /></PageHeader>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <VideoWorkflowCard
          icon={Film}
          title="Animate Image"
          description="Turn one still image into a polished short video."
          bestFor={['Product hero', 'Campaign motion', 'Social ads']}
          to="/app/video/animate"
        />
        <VideoWorkflowCard
          icon={ArrowRightLeft}
          title="Start & End Video"
          description="Create a smooth video between a start image and an end image."
          bestFor={['Product reveals', 'Before / after', 'Smooth transitions']}
          to="/app/video/start-end"
          disabled
          comingSoon
        />
        <VideoWorkflowCard
          icon={Layers}
          title="Create Ad Sequence"
          description="Build a cinematic mini ad from several visuals."
          bestFor={['Product launches', 'Multi-frame ads', 'Brand teasers']}
          to="/app/video/ad-sequence"
          disabled
          comingSoon
        />
        <VideoWorkflowCard
          icon={Users}
          title="Consistent Model Video"
          description="Create videos with stronger subject consistency."
          bestFor={['Spokesmodels', 'Fashion clips', 'Creator content']}
          to="/app/video/consistent-model"
          disabled
          comingSoon
        />
        <VideoWorkflowCard
          icon={Clapperboard}
          title="Short Film"
          description="Plan and generate a premium multi-shot brand film."
          bestFor={['Brand storytelling', 'Multi-shot', 'Campaign films']}
          to="/app/video/short-film"
          disabled
          comingSoon
        />
      </div>

      {/* Recent Videos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Videos</h2>
        {isLoadingHistory ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {history.slice(0, 12).map((v) => (
              <RecentVideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Film className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No videos yet. Create your first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
