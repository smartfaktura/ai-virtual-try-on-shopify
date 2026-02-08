import { useState, useRef, useCallback } from 'react';
import { Upload, Film, Download, Loader2, Clock, ImageIcon, LinkIcon, X, Play, RotateCcw, History, Trash2, Repeat, Info } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useGenerateVideo, VideoGenStatus, GeneratedVideo } from '@/hooks/useGenerateVideo';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { format } from 'date-fns';

type ImageSource = 'upload' | 'url';

function VideoHistoryCard({ video }: { video: GeneratedVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    if (!video.video_url) return;
    const a = document.createElement('a');
    a.href = video.video_url;
    a.download = `video-${video.id.slice(0, 8)}.mp4`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden group">
      <div className="relative aspect-square bg-muted/30">
        {video.status === 'complete' && video.video_url ? (
          isPlaying ? (
            <video
              src={video.video_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <>
              {video.source_image_url && (
                <img
                  src={video.source_image_url}
                  alt="Source"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                </div>
              </button>
            </>
          )
        ) : video.status === 'processing' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <X className="w-8 h-8 text-destructive/50" />
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-foreground/60 text-[10px] text-background font-medium">
          {video.duration}s
        </div>

        {/* Status badge for non-complete */}
        {video.status !== 'complete' && (
          <div className={cn(
            'absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium',
            video.status === 'processing' ? 'bg-amber-500/80 text-white' : 'bg-destructive/80 text-white'
          )}>
            {video.status === 'processing' ? 'Processing' : 'Failed'}
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {video.prompt || 'No prompt (auto motion)'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/60">
            {format(new Date(video.created_at), 'MMM d, HH:mm')}
          </span>
          {video.status === 'complete' && video.video_url && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={handleDownload}>
              <Download className="w-3 h-3" />
              MP4
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoGenerate() {
  const [imageSource, setImageSource] = useState<ImageSource>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<'5' | '10'>('5');
  const [modelName, setModelName] = useState('kling-v2-1');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  const [loopMode, setLoopMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useFileUpload();
  const { status, videoUrl, error, elapsedSeconds, startGeneration, reset, history, isLoadingHistory } = useGenerateVideo();

  const isGenerating = status === 'creating' || status === 'processing';

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const url = await upload(file);
    if (url) {
      setImageUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) return;
    setPreviewUrl(imageUrl.trim());
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = () => {
    const url = imageSource === 'url' ? imageUrl.trim() : imageUrl;
    if (!url) {
      toast.error('Please provide an image first');
      return;
    }
    startGeneration({
      imageUrl: url,
      prompt,
      duration,
      modelName,
      aspectRatio,
      imageTailUrl: loopMode ? url : undefined,
    });
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-${Date.now()}.mp4`;
    a.target = '_blank';
    a.click();
  };

  const handleReset = () => {
    reset();
    clearImage();
    setPrompt('');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const estimatedProgress = status === 'creating'
    ? 5
    : status === 'processing'
      ? Math.min(95, (elapsedSeconds / 180) * 100)
      : status === 'complete'
        ? 100
        : 0;

  const completedVideos = history.filter(v => v.status === 'complete');
  const processingVideos = history.filter(v => v.status === 'processing');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Video Generator"
        subtitle="Turn any image into an animated video clip using AI"
      >
        <div />
      </PageHeader>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Input */}
        <div className="space-y-5">
          {/* Image Input */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Source Image
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setImageSource('upload')}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                  imageSource === 'upload'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                )}
              >
                <Upload className="w-3.5 h-3.5 inline mr-1.5" />
                Upload
              </button>
              <button
                onClick={() => setImageSource('url')}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                  imageSource === 'url'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                )}
              >
                <LinkIcon className="w-3.5 h-3.5 inline mr-1.5" />
                Paste URL
              </button>
            </div>

            {imageSource === 'upload' ? (
              previewUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={previewUrl} alt="Selected" className="w-full max-h-64 object-contain bg-muted/30" />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background border border-border"
                    disabled={isGenerating}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
                    isDragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  )}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop an image here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</p>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isGenerating}
                  />
                  <Button variant="secondary" onClick={handleUrlSubmit} disabled={!imageUrl.trim() || isGenerating}>
                    Load
                  </Button>
                </div>
                {previewUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain bg-muted/30" />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background border border-border"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>

          {/* Motion Prompt */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Motion Prompt</h3>
            <Textarea
              placeholder="Describe the motion you want, e.g. 'gentle breeze, fabric flowing naturally, subtle camera push-in'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isGenerating}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Optional — leave blank for automatic motion</p>
          </div>

          {/* Configuration */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Configuration</h3>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</label>
              <div className="flex gap-2">
                {[
                  { value: 'kling-v2-1', label: 'V2.1', desc: 'Best quality' },
                  { value: 'kling-v1-6', label: 'V1.6', desc: 'Faster' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setModelName(opt.value)}
                    disabled={isGenerating}
                    className={cn(
                      'flex-1 px-3 py-2.5 rounded-lg text-sm transition-all border',
                      modelName === opt.value
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                    )}
                  >
                    <span className="block font-medium">{opt.label}</span>
                    <span className="block text-[10px] opacity-70">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</label>
              <div className="flex gap-2">
                {(['5', '10'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    disabled={isGenerating}
                    className={cn(
                      'flex-1 px-3 py-2.5 rounded-lg text-sm transition-all border',
                      duration === d
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                    )}
                  >
                    {d} seconds
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['1:1', '16:9', '9:16'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    disabled={isGenerating}
                    className={cn(
                      'flex-1 px-3 py-2.5 rounded-lg text-sm transition-all border',
                      aspectRatio === r
                        ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                        : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
                    )}
                  >
                    {r}
                  </button>
                ))}
            </div>

            {/* Loop Mode Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-sm font-medium">Loop Mode</span>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Info className="w-3 h-3 inline" />
                    Same start &amp; end frame for seamless loop (uses Pro mode)
                  </p>
                </div>
              </div>
              <Switch
                checked={loopMode}
                onCheckedChange={setLoopMode}
                disabled={isGenerating}
              />
            </div>
          </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isUploading || (!imageUrl && imageSource === 'upload')}
            className="w-full h-12 text-base font-semibold gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Film className="w-5 h-5" />
                Generate Video
              </>
            )}
          </Button>
        </div>

        {/* Right Column: Result */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 min-h-[400px] flex flex-col">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Play className="w-4 h-4 text-primary" />
              Result
            </h3>

            {status === 'idle' && (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Film className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Your generated video will appear here</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Upload an image and click Generate to start</p>
                </div>
              </div>
            )}

            {(status === 'creating' || status === 'processing') && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-xs text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {status === 'creating' ? 'Submitting task...' : 'Generating video...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This typically takes 1-3 minutes
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={estimatedProgress} className="h-2" />
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(elapsedSeconds)} elapsed
                    </div>
                  </div>
                </div>
              </div>
            )}

            {status === 'complete' && videoUrl && (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-[400px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Download MP4
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    New Video
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-sm font-medium text-destructive">Generation Failed</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">{error}</p>
                  <Button onClick={handleReset} variant="outline" className="mt-4 gap-2" size="sm">
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Video History
          </h2>
          {history.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedVideos.length} completed{processingVideos.length > 0 ? ` · ${processingVideos.length} in progress` : ''}
            </span>
          )}
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <Film className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No videos yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Generated videos will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.map((video) => (
              <VideoHistoryCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
