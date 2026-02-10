import { useState } from 'react';
import { Copy, ArrowRight, X, Heart, Search, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';
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
}: DiscoverDetailModalProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!item) return null;

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
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Details</DialogDescription>
        </DialogHeader>

        {/* Image */}
        <div className="w-full bg-muted rounded-t-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full max-h-[50vh] object-contain"
          />
        </div>

        <div className="flex flex-col gap-5 px-6 pb-6">
          {/* Title + badges */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs">{category}</Badge>
              {isPreset && (
                <>
                  <Badge variant="outline" className="text-xs">{item.data.aspect_ratio}</Badge>
                  {item.data.quality === 'high' && <Badge variant="secondary" className="text-xs">HD</Badge>}
                </>
              )}
            </div>
          </div>

          {/* Generate Prompt section */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={handleGeneratePrompt}
              disabled={isGenerating}
              className="w-full h-11 rounded-xl"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing image…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Prompt</>
              )}
            </Button>

            {generatedPrompt && (
              <div className="space-y-2.5">
                <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed border border-border/50 max-h-36 overflow-y-auto">
                  {generatedPrompt}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyGenerated} className="flex-1 rounded-lg">
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                  </Button>
                  <Button size="sm" onClick={handleUseGenerated} className="flex-1 rounded-lg">
                    Use in Freestyle <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Description / Prompt */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isPreset ? 'Prompt' : 'Description'}
            </p>
            <div className="bg-muted/30 rounded-xl p-4 text-sm leading-relaxed border border-border/30">
              {description}
            </div>
          </div>

          {/* Tags */}
          {isPreset && item.data.tags && item.data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.data.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Primary CTA */}
          <Button onClick={() => onUseItem(item)} className="w-full h-12 rounded-xl text-sm font-medium">
            {isPreset ? 'Use Prompt' : 'Use Scene'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Secondary actions */}
          <div className="flex gap-2">
            {isPreset && (
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 rounded-lg">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Prompt
              </Button>
            )}
            {onToggleSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleSave}
                className={cn('flex-1 rounded-lg', isSaved && 'text-destructive border-destructive/30')}
              >
                <Heart className={cn('w-3.5 h-3.5 mr-1.5', isSaved && 'fill-current')} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { onSearchSimilar(item); onClose(); }}
              className="flex-1 rounded-lg"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" /> Similar
            </Button>
          </div>

          {/* Related */}
          {relatedItems.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                More like this
              </p>
              <div className="grid grid-cols-4 gap-2">
                {relatedItems.map((ri) => {
                  const riImage = ri.type === 'preset' ? ri.data.image_url : ri.data.previewUrl;
                  const riTitle = ri.type === 'preset' ? ri.data.title : ri.data.name;
                  const riKey = ri.type === 'preset' ? `p-${ri.data.id}` : `s-${ri.data.poseId}`;
                  return (
                    <button
                      key={riKey}
                      onClick={() => onSelectRelated(ri)}
                      className="aspect-[3/4] rounded-lg overflow-hidden bg-muted hover:ring-2 ring-primary transition-all"
                    >
                      <img src={riImage} alt={riTitle} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
