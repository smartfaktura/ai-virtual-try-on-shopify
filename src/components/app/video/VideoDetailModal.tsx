import { useState, useEffect } from 'react';
import { Download, Trash2, X, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/brandedToast';
import { format } from 'date-fns';
import type { GeneratedVideo } from '@/hooks/useGenerateVideo';
import { buildVideoFileName } from '@/lib/videoFilename';

interface VideoDetailModalProps {
  video: GeneratedVideo | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function VideoDetailModal({ video, open, onClose, onDeleted }: VideoDetailModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  useEffect(() => { setPromptExpanded(false); }, [video?.id]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
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

  const handleDownload = async () => {
    if (!video.video_url) return;
    try {
      const res = await fetch(video.video_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${video.camera_type || video.id.slice(0, 8)}.mp4`;
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
      {/* Backdrop */}
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/90" />

      {/* Split layout */}
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
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
            {/* Title */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                Video Generation
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight flex items-center gap-2">
                <Film className="w-6 h-6 text-muted-foreground/60" />
                Generated Video
              </h2>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  {dateStr}
                </span>
                {isProcessing && (
                  <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-900 animate-pulse">
                    {video.status === 'processing' ? 'Processing' : 'Queued'}
                  </Badge>
                )}
                {video.status === 'failed' && (
                  <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                )}
              </div>
            </div>

            {/* Prompt */}
            {video.prompt && (() => {
              const isLong = video.prompt.length > 150;
              const displayText = isLong && !promptExpanded ? `${video.prompt.slice(0, 150)}…` : video.prompt;
              return (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                    Prompt
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {displayText}
                    {isLong && (
                      <button
                        onClick={() => setPromptExpanded(!promptExpanded)}
                        className="ml-1 text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                      >
                        {promptExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </p>
                </div>
              );
            })()}

            {/* Metadata chips */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground">
                {video.duration}s
              </span>
              <span className="px-2.5 py-1 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground">
                {video.aspect_ratio}
              </span>
            </div>

            {/* Settings metadata */}
            {(() => {
              const s = video.settings_json || {};
              const entries = ([
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

              if (entries.length === 0) return null;

              const fmt = (v: string) => v.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

              return (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                    Settings
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {entries.map(([label, value]) => (
                      <div key={label} className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground/50 font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground truncate">{fmt(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
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
