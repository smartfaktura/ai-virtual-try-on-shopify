import { useState, useEffect } from 'react';
import { Copy, ArrowRight, Heart, Search, Sparkles, Loader2, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import { cn } from '@/lib/utils';
import { convertImageToBase64 } from '@/lib/imageUtils';

interface DiscoverDetailModalProps {
  item: DiscoverItem | null;
  open: boolean;
  onClose: () => void;
  onUseItem: (item: DiscoverItem) => void;
  onSearchSimilar: (item: DiscoverItem) => void;
  relatedItems: DiscoverItem[];
  onSelectRelated: (item: DiscoverItem) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  viewCount?: number;
}

export function DiscoverDetailModal({
  item,
  open,
  onClose,
  onUseItem,
  onSearchSimilar,
  relatedItems,
  onSelectRelated,
  isSaved,
  onToggleSave,
  viewCount,
}: DiscoverDetailModalProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setGeneratedPrompt(null);
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

  if (!open || !item) return null;

  const isPreset = item.type === 'preset';
  const imageUrl = isPreset ? item.data.image_url : item.data.previewUrl;
  const title = isPreset ? item.data.title : item.data.name;
  const description = isPreset ? item.data.prompt : item.data.description;
  const category = isPreset ? item.data.category : item.data.category;

  const handleCopy = () => {
    if (isPreset) {
      navigator.clipboard.writeText(item.data.prompt);
      toast.success('Prompt copied to clipboard');
    }
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    setGeneratedPrompt(null);
    try {
      const resolvedUrl = await convertImageToBase64(imageUrl);
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/describe-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ imageUrl: resolvedUrl }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate prompt');
      }
      const data = await resp.json();
      setGeneratedPrompt(data.prompt);
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyGenerated = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      toast.success('Generated prompt copied');
    }
  };

  const handleUseGenerated = () => {
    if (generatedPrompt) {
      onUseItem({ ...item, _generatedPrompt: generatedPrompt } as any);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Split layout */}
      <div
        className="relative z-10 flex flex-col md:flex-row w-full h-dvh"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left — Image showcase */}
        <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right — Controls panel */}
        <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
          {/* Close button — black, inside right panel */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
            {/* Category label + title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                  {category}
                </p>
                {!isPreset && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary/70">· Scene</span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">{title}</h2>
              {typeof viewCount === 'number' && (
                <div className="flex items-center gap-1.5 text-muted-foreground/60 mt-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">{viewCount} views</span>
                </div>
              )}
              {isPreset && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{item.data.aspect_ratio}</span>
                  {item.data.quality === 'high' && (
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">· HD</span>
                  )}
                </div>
              )}
            </div>

            {/* Generate Prompt */}
            <div className="space-y-3">
              <button
                onClick={handleGeneratePrompt}
                disabled={isGenerating}
                className={cn(
                  'w-full h-12 rounded-xl text-sm font-medium transition-all duration-300',
                  'bg-muted/40 backdrop-blur-md border border-border/50',
                  'hover:bg-muted/60 hover:border-border/80 hover:shadow-md',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2'
                )}
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> <span className="text-muted-foreground">Analyzing image…</span></>
                ) : (
                  <><Sparkles className="w-4 h-4 text-primary/80" /> <span>Generate Prompt from Image</span></>
                )}
              </button>

              {generatedPrompt && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-4 text-sm leading-relaxed border border-primary/10 max-h-36 overflow-y-auto shadow-inner">
                    {generatedPrompt}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyGenerated} className="flex-1 rounded-xl h-10 border-border/40 hover:bg-muted/50">
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                    </Button>
                    <Button size="sm" onClick={handleUseGenerated} className="flex-1 rounded-xl h-10">
                      Use in Freestyle <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                {isPreset ? 'Prompt' : 'Description'}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Tags */}
            {isPreset && item.data.tags && item.data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.data.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground/70 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Primary CTA */}
            <Button
              onClick={() => { onUseItem(item); onClose(); }}
              className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              {isPreset ? 'Use Prompt' : 'Use Scene'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Secondary actions */}
            <div className="flex gap-2">
              {isPreset && (
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              )}
              {onToggleSave && (
                <button
                  onClick={onToggleSave}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 transition-all',
                    isSaved ? 'text-destructive border-destructive/20' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', isSaved && 'fill-current')} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              )}
              <button
                onClick={() => { onSearchSimilar(item); onClose(); }}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-muted-foreground bg-muted/30 backdrop-blur-sm border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all"
              >
                <Search className="w-3.5 h-3.5" /> Similar
              </button>
            </div>

            {/* More like this */}
            {relatedItems.length > 0 && (
              <div className="pt-5 border-t border-border/30">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                  More like this
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {relatedItems.map((ri) => {
                    const riImage = ri.type === 'preset' ? ri.data.image_url : ri.data.previewUrl;
                    const riTitle = ri.type === 'preset' ? ri.data.title : ri.data.name;
                    const riKey = ri.type === 'preset' ? `p-${ri.data.id}` : `s-${ri.data.poseId}`;
                    return (
                      <button
                        key={riKey}
                        onClick={() => onSelectRelated(ri)}
                        className="aspect-[3/4] rounded-xl overflow-hidden bg-muted hover:ring-2 ring-primary/50 transition-all duration-200 hover:scale-[1.03] shadow-sm hover:shadow-md"
                      >
                        <img src={riImage} alt={riTitle} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
