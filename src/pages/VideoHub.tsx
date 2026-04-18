import { Film, Layers, Users, ArrowRightLeft, Clapperboard, Play, Loader2, Check, Download } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { VideoWorkflowCard } from '@/components/app/video/VideoWorkflowCard';
import { VideoDetailModal } from '@/components/app/video/VideoDetailModal';
import { useGenerateVideo, type GeneratedVideo } from '@/hooks/useGenerateVideo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { downloadVideosAsZip } from '@/lib/dropDownload';
import { toSignedUrl } from '@/lib/signedUrl';
import { toast } from 'sonner';
import { buildVideoFileName } from '@/lib/videoFilename';

/* ------------------------------------------------------------------ */
/*  Ratio helpers                                                      */
/* ------------------------------------------------------------------ */

/** Convert "16:9" → "16/9", fallback to undefined */
function ratioToCss(ratio: string | undefined | null): string | undefined {
  if (!ratio) return undefined;
  const parts = ratio.split(':');
  if (parts.length === 2) return `${parts[0]}/${parts[1]}`;
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  RecentVideoCard                                                    */
/* ------------------------------------------------------------------ */

interface RecentVideoCardProps {
  video: GeneratedVideo;
  onClick: () => void;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}

function RecentVideoCard({ video, onClick, selectMode, selected, onToggleSelect }: RecentVideoCardProps) {
  const isComplete = video.status === 'complete' && video.video_url;

  // Prefer preview_url (actual video frame) > source_image_url
  const rawThumb = video.preview_url || video.source_image_url;
  const hasThumbnail = !!rawThumb;
  const thumbnailUrl = hasThumbnail ? getOptimizedUrl(rawThumb, { quality: 60 }) : undefined;

  // Determine aspect-ratio for the wrapper:
  // Use the video's stored aspect_ratio when available, otherwise default to 3/4
  const cssRatio = ratioToCss(video.aspect_ratio) || '3/4';

  // Track natural image ratio for more accurate framing
  const [naturalRatio, setNaturalRatio] = useState<string | undefined>(undefined);
  const displayRatio = naturalRatio || cssRatio;

  const handleClick = useCallback(() => {
    if (selectMode) {
      onToggleSelect();
    } else {
      onClick();
    }
  }, [selectMode, onToggleSelect, onClick]);

  const showStatusBadge = video.status === 'processing' || video.status === 'queued';

  return (
    <div
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-muted/30">
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

        {hasThumbnail ? (
          <ShimmerImage
            src={thumbnailUrl!}
            alt=""
            aspectRatio={displayRatio}
            className="w-full h-full object-cover"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setNaturalRatio(`${img.naturalWidth}/${img.naturalHeight}`);
              }
            }}
          />
        ) : (
          <div
            className="w-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center"
            style={{ aspectRatio: displayRatio }}
          >
            <Film className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

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

        {isComplete && !selectMode && (
          <div className="absolute bottom-2 left-2 z-10">
            <div className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Play className="h-3 w-3 text-foreground ml-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VideoHub page                                                      */
/* ------------------------------------------------------------------ */

export default function VideoHub() {
  const { history, isLoadingHistory, refreshHistory, removeFromHistory, loadMore, hasMore, totalCount, isLoadingMore } = useGenerateVideo();
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
        subtitle="Turn product shots, campaign visuals, and reference frames into polished short videos"
      >
        <div />
      </PageHeader>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <VideoWorkflowCard
          icon={Film}
          title="Animate Image"
          description="Turn one still image into a polished short video"
          bestFor={['Product hero', 'Campaign motion', 'Social ads']}
          to="/app/video/animate"
        />
        <VideoWorkflowCard
          icon={ArrowRightLeft}
          title="Start & End Video"
          description="Create a smooth video between a start image and an end image"
          bestFor={['Product reveals', 'Before / after', 'Smooth transitions']}
          to="/app/video/start-end"
          disabled
          comingSoon
        />
        <VideoWorkflowCard
          icon={Layers}
          title="Create Ad Sequence"
          description="Build a cinematic mini ad from several visuals"
          bestFor={['Product launches', 'Multi-frame ads', 'Brand teasers']}
          to="/app/video/ad-sequence"
          disabled
          comingSoon
        />
        <VideoWorkflowCard
          icon={Users}
          title="Consistent Model Video"
          description="Create videos with stronger subject consistency"
          bestFor={['Spokesmodels', 'Fashion clips', 'Creator content']}
          to="/app/video/consistent-model"
          disabled
          comingSoon
        />
        <VideoWorkflowCard
          icon={Clapperboard}
          title="Short Film"
          description="Plan and generate a premium multi-shot brand film"
          bestFor={['Brand storytelling', 'Multi-shot', 'Campaign films']}
          to="/app/video/short-film"
        />
      </div>

      {/* Showcase */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Showcase</h2>
          <p className="text-sm text-muted-foreground mt-1">See what's possible</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
              <video
                src={`/videos/showcase/showcase-${i + 1}.mp4`}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* In Progress + Completed Videos */}
      {(() => {
        const processingVideos = history.filter(v => v.status === 'processing' || v.status === 'queued');
        const completedVideos = history.filter(v => v.status !== 'processing' && v.status !== 'queued');

        return (
          <>
            {processingVideos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">In Progress</h2>
                  <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-900">
                    {processingVideos.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {processingVideos.map((v) => (
                    <RecentVideoCard
                      key={v.id}
                      video={v}
                      onClick={() => setSelectedVideo(v)}
                      selectMode={false}
                      selected={false}
                      onToggleSelect={() => {}}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Videos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">Completed Videos</h2>
                  {completedVideos.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {completedVideos.length}{totalCount > history.length ? ` / ${totalCount}` : ''}
                    </Badge>
                  )}
                </div>
                {completedVideos.length > 0 && (
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
              ) : completedVideos.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {completedVideos.map((v) => (
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
              ) : !isLoadingHistory && processingVideos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Film className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No videos yet. Create your first one above.</p>
                </div>
              ) : null}
            </div>
          </>
        );
      })()}

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
        onDeleted={() => {
          if (selectedVideo) removeFromHistory(selectedVideo.id);
        }}
      />
    </div>
  );
}
