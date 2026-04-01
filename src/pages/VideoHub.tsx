import { Film, Layers, Users, ArrowRightLeft, Clapperboard, Play, Loader2, Check, Download } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { VideoWorkflowCard } from '@/components/app/video/VideoWorkflowCard';
import { VideoDetailModal } from '@/components/app/video/VideoDetailModal';
import { useGenerateVideo, type GeneratedVideo } from '@/hooks/useGenerateVideo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useRef, useCallback, useEffect } from 'react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useIsMobile } from '@/hooks/use-mobile';
import { downloadVideosAsZip } from '@/lib/dropDownload';
import { toSignedUrl } from '@/lib/signedUrl';
import { toast } from 'sonner';
import { buildVideoFileName } from '@/lib/videoFilename';

interface RecentVideoCardProps {
  video: GeneratedVideo;
  onClick: () => void;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}

function RecentVideoCard({ video, onClick, selectMode, selected, onToggleSelect }: RecentVideoCardProps) {
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
    if (!isMobile && isComplete && !selectMode) setHovering(true);
  }, [isMobile, isComplete, selectMode]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && isComplete && !selectMode) {
      setHovering(false);
      setCanPlay(false);
    }
  }, [isMobile, isComplete, selectMode]);

  const handleClick = useCallback(() => {
    if (selectMode) {
      onToggleSelect();
    } else {
      onClick();
    }
  }, [selectMode, onToggleSelect, onClick]);

  const showStatusBadge = video.status === 'processing' || video.status === 'queued';
  const isPlaying = hovering && canPlay;

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-muted/30">
        {/* Select checkbox overlay */}
        {selectMode && (
          <div className="absolute top-2 left-2 z-20">
            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-foreground/40 bg-background/60 backdrop-blur-sm'
            }`}>
              {selected && <Check className="h-3.5 w-3.5" />}
            </div>
          </div>
        )}

        {hovering && isComplete && !selectMode && (
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

        {video.camera_type && !showStatusBadge && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] bg-background/80 backdrop-blur-sm text-foreground capitalize">
            {video.camera_type.replace(/_/g, ' ')}
          </Badge>
        )}

        {hovering && !canPlay && isComplete && !selectMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 z-10">
            <Loader2 className="h-6 w-6 text-background animate-spin" />
          </div>
        )}

        {isComplete && !hovering && !selectMode && (
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
  const { history, isLoadingHistory, refreshHistory, loadMore, hasMore, totalCount, isLoadingMore } = useGenerateVideo();
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleSelectMode = useCallback(() => {
    setSelectMode(prev => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDownloadZip = useCallback(async () => {
    const selected = history.filter(v => selectedIds.has(v.id) && v.video_url);
    if (selected.length === 0) return;

    setIsDownloading(true);
    try {
      const videos = await Promise.all(
        selected.map(async (v) => ({
          url: await toSignedUrl(v.video_url!),
          name: buildVideoFileName({
            cameraType: v.camera_type,
            settingsJson: v.settings_json,
            projectTitle: v.project_title,
            videoId: v.id,
          }),
        }))
      );
      await downloadVideosAsZip(videos, 'videos');
      toast.success(`Downloaded ${videos.length} video${videos.length > 1 ? 's' : ''}`);
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [history, selectedIds]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Create Videos"
        subtitle="Turn product shots, campaign visuals, and reference frames into polished short videos."
      >
        <div />
      </PageHeader>

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Recent Videos</h2>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {history.length} / {totalCount}
              </Badge>
            )}
          </div>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={toggleSelectMode}>
              {selectMode ? 'Done' : 'Select'}
            </Button>
          )}
        </div>
        {isLoadingHistory ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {history.map((v) => (
                <RecentVideoCard
                  key={v.id}
                  video={v}
                  onClick={() => setSelectedVideo(v)}
                  selectMode={selectMode}
                  selected={selectedIds.has(v.id)}
                  onToggleSelect={() => toggleSelection(v.id)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={isLoadingMore}>
                  {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Load More Videos
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Film className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No videos yet. Create your first one above.</p>
          </div>
        )}
      </div>

      {/* Sticky bulk download bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-full shadow-lg px-5 py-2.5 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
          <Button size="sm" onClick={handleDownloadZip} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download ZIP
          </Button>
        </div>
      )}

      <VideoDetailModal
        video={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onDeleted={refreshHistory}
      />
    </div>
  );
}
