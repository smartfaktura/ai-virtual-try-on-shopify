import { Film, Layers, Users, ArrowRightLeft, Clapperboard, Play, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { VideoWorkflowCard } from '@/components/app/video/VideoWorkflowCard';
import { VideoDetailModal } from '@/components/app/video/VideoDetailModal';
import { useGenerateVideo, type GeneratedVideo } from '@/hooks/useGenerateVideo';
import { Badge } from '@/components/ui/badge';
import { useState, useRef, useCallback, useEffect } from 'react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useIsMobile } from '@/hooks/use-mobile';

function RecentVideoCard({ video, onClick }: { video: GeneratedVideo; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const isComplete = video.status === 'complete' && video.video_url;
  const [hovering, setHovering] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  // Auto-play/pause on hover
  useEffect(() => {
    if (!videoRef.current || !canPlay) return;
    if (hovering) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [hovering, canPlay]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && isComplete) setHovering(true);
  }, [isMobile, isComplete]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && isComplete) {
      setHovering(false);
      setCanPlay(false);
    }
  }, [isMobile, isComplete]);

  const showStatusBadge = video.status === 'processing' || video.status === 'queued';
  const isPlaying = hovering && canPlay;

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-muted/30">
        {/* Mount video only on hover — poster prevents black flash */}
        {hovering && isComplete && (
          <video
            ref={videoRef}
            src={video.video_url!}
            poster={getOptimizedUrl(video.source_image_url, { quality: 60 })}
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setCanPlay(true)}
            className="absolute inset-0 w-full h-full object-cover bg-transparent"
            style={{ visibility: isPlaying ? 'visible' : 'hidden' }}
          />
        )}
        <img
          src={getOptimizedUrl(video.source_image_url, { quality: 60 })}
          alt=""
          loading="lazy"
          className={`w-full h-full object-cover ${isPlaying ? 'invisible' : 'visible'}`}
        />

        {showStatusBadge && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-amber-50 text-amber-900 animate-pulse">
            {video.status === 'processing' ? 'Processing' : 'Queued'}
          </Badge>
        )}

        {/* Camera motion label */}
        {video.camera_type && !showStatusBadge && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-background/80 backdrop-blur-sm text-foreground capitalize">
            {video.camera_type.replace(/_/g, ' ')}
          </Badge>
        )}

        {/* Loading spinner while buffering on hover */}
        {hovering && !canPlay && isComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 z-10">
            <Loader2 className="h-6 w-6 text-background animate-spin" />
          </div>
        )}

        {/* Play icon when idle */}
        {isComplete && !hovering && (
          <div className="absolute bottom-2 left-2 z-10">
            <div className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Play className="h-3 w-3 text-foreground ml-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoHub() {
  const { history, isLoadingHistory, refreshHistory } = useGenerateVideo();
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);

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
              <RecentVideoCard key={v.id} video={v} onClick={() => setSelectedVideo(v)} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Film className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No videos yet. Create your first one above.</p>
          </div>
        )}
      </div>

      <VideoDetailModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onDeleted={refreshHistory}
      />
    </div>
  );
}
