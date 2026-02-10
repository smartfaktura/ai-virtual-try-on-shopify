import { Copy, ArrowRight, X, Heart, Search } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isPreset ? 'Inspiration preset details' : 'Scene details'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{category}</Badge>
              {isPreset && (
                <>
                  <Badge variant="outline">{item.data.aspect_ratio}</Badge>
                  {item.data.quality === 'high' && (
                    <Badge variant="secondary">HD</Badge>
                  )}
                </>
              )}
            </div>

            {isPreset && item.data.model_name && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Model</p>
                <p className="text-sm">{item.data.model_name}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                {isPreset ? 'Prompt' : 'Description'}
              </p>
              <div className="bg-muted/50 rounded-lg p-3 text-sm leading-relaxed border border-border/50">
                {description}
              </div>
            </div>

            {isPreset && item.data.tags && item.data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <div className="flex gap-2">
                {isPreset && (
                  <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                  </Button>
                )}
                <Button size="sm" onClick={() => onUseItem(item)} className="flex-1">
                  {isPreset ? 'Use Prompt' : 'Use Scene'}{' '}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
              <div className="flex gap-2">
                {onToggleSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleSave}
                    className={cn('flex-1', isSaved && 'text-red-500 border-red-500/30')}
                  >
                    <Heart className={cn('w-3.5 h-3.5 mr-1.5', isSaved && 'fill-current')} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onSearchSimilar(item); onClose(); }}
                  className="flex-1"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" /> Similar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedItems.length > 0 && (
          <div className="pt-4 border-t border-border mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
                    <img
                      src={riImage}
                      alt={riTitle}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
