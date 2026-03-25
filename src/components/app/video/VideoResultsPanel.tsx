import { Download, RotateCcw, Copy, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface VideoResultsPanelProps {
  videoUrl: string | null;
  sourceImageUrl?: string;
  onReuse?: () => void;
  onVariation?: () => void;
  onNewProject?: () => void;
}

export function VideoResultsPanel({ videoUrl, sourceImageUrl, onReuse, onVariation, onNewProject }: VideoResultsPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `video-${Date.now()}.mp4`;
    a.target = '_blank';
    a.click();
  };

  if (!videoUrl) return null;

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-muted/30 border border-border">
        {isPlaying ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            controls
            playsInline
            className="w-full aspect-video object-contain"
          />
        ) : (
          <button onClick={() => setIsPlaying(true)} className="relative w-full aspect-video group">
            {sourceImageUrl ? (
              <img src={sourceImageUrl} alt="Source" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/30">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
              </div>
            </div>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1.5" />
          Download
        </Button>
        {onReuse && (
          <Button variant="outline" size="sm" onClick={onReuse}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reuse Settings
          </Button>
        )}
        {onVariation && (
          <Button variant="outline" size="sm" onClick={onVariation}>
            <Copy className="h-4 w-4 mr-1.5" />
            Generate Variation
          </Button>
        )}
        {onNewProject && (
          <Button variant="ghost" size="sm" onClick={onNewProject}>
            New Project
          </Button>
        )}
      </div>
    </div>
  );
}
