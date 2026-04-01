import { useState, useEffect } from 'react';
import { Download, Trash2, X, Film, Clock, Monitor, Maximize, Video, Sparkles, Eye, RotateCcw, Volume2, Layers, Move, Target, Clapperboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/brandedToast';
import { format } from 'date-fns';
import type { GeneratedVideo } from '@/hooks/useGenerateVideo';
import { buildVideoFileName } from '@/lib/videoFilename';

const RESOLUTION_MAP: Record<string, string> = {
  '1:1': '1080 × 1080',
  '16:9': '1920 × 1080',
  '9:16': '1080 × 1920',
  '4:3': '1440 × 1080',
  '3:4': '1080 × 1440',
  '21:9': '2560 × 1080',
};

const ICON_MAP: Record<string, React.ElementType> = {
  Duration: Clock,
  Format: Monitor,
  Resolution: Maximize,
  'Camera Motion': Video,
  Style: Sparkles,
  'Scene Type': Layers,
  'Motion Goal': Target,
  'Subject Motion': Move,
  Realism: Eye,
  'Loop Style': RotateCcw,
  Audio: Volume2,
  Model: Clapperboard,
};

interface VideoDetailModalProps {
  video: GeneratedVideo | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function VideoDetailModal({ video, open, onClose, onDeleted }: VideoDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !video) return null;

  const isComplete = video.status === 'complete' && video.video_url;
  const isProcessing = video.status === 'processing' || video.status === 'queued';
  const s = video.settings_json || {};
  const fmt = (v: string) => v.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const details: [string, string][] = ([
    ['Duration', video.duration ? `${video.duration}s` : ''],
    ['Format', video.aspect_ratio || ''],
    ['Resolution', RESOLUTION_MAP[video.aspect_ratio] || ''],
    ['Camera Motion', video.camera_type || (s.cameraMotion as string) || ''],
    ['Style', (s.category as string) || ''],
    ['Scene Type', (s.sceneType as string) || ''],
    ['Motion Goal', (s.motionGoalId as string) || ''],
    ['Subject Motion', (s.subjectMotion as string) || ''],
    ['Realism', (s.realismLevel as string) || ''],
    ['Loop Style', (s.loopStyle as string) || ''],
    ['Audio', (s.audioMode as string) || ''],
    ['Model', video.model_name || ''],
  ] as [string, string][]).filter(([, v]) => v && v !== 'silent');

  const handleDownload = async () => {
    if (!video.video_url) return;
    try {
      const res = await fetch(video.video_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = buildVideoFileName({
        cameraType: video.camera_type,
        settingsJson: video.settings_json,
        projectTitle: video.project_title,
        videoId: video.id,
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Failed to download video');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('generated_videos').delete().eq('id', video.id);
      if (error) throw error;
      toast.success('Video deleted');
      onDeleted?.();
      onClose();
    } catch {
      toast.error('Failed to delete video');
    }
    setDeleting(false);
  };

  const dateStr = format(new Date(video.created_at), 'MMM d, yyyy · h:mm a');

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[200] animate-in fade-in duration-200"
      style={{ margin: 0, padding: 0 }}
      onClick={onClose}
    >
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" />

      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left — Video / Image preview */}
        <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
          {isComplete ? (
            <video
              src={video.video_url!}
              controls
              autoPlay
              loop
              playsInline
              className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] rounded-lg shadow-2xl"
            />
          ) : (
            <img
              src={video.source_image_url}
              alt=""
              className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {/* Right — Info panel */}
        <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <X className="w-6 h-6" strokeWidth={1.8} />
          </button>

          <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
            {/* Header */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
                Video Generation
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground leading-tight flex items-center gap-2.5">
                <Film className="w-5 h-5 text-muted-foreground/50" />
                Generated Video
              </h2>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                  {dateStr}
                </span>
                {isProcessing && (
                  <Badge variant="secondary" className="text-[10px] bg-status-warning/10 text-status-warning animate-pulse">
                    {video.status === 'processing' ? 'Processing' : 'Queued'}
                  </Badge>
                )}
                {video.status === 'failed' && (
                  <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                )}
              </div>
            </div>

            {/* Unified Details Grid */}
            {details.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                  Details
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {details.map(([label, value]) => {
                    const Icon = ICON_MAP[label] || Layers;
                    return (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-150"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" strokeWidth={1.8} />
                          <span className="text-xs text-muted-foreground/60 font-medium">{label}</span>
                        </div>
                        <span className="text-xs font-medium text-foreground/80 truncate text-right">
                          {label === 'Duration' || label === 'Format' || label === 'Resolution' ? value : fmt(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              {isComplete && (
                <Button
                  onClick={handleDownload}
                  className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Video
                </Button>
              )}

              <Separator className="my-1" />

              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full h-10 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
