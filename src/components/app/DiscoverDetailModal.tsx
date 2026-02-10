import { Copy, ArrowRight, X } from 'lucide-react';
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
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';

interface DiscoverDetailModalProps {
  preset: DiscoverPreset | null;
  open: boolean;
  onClose: () => void;
  onUsePrompt: (preset: DiscoverPreset) => void;
  relatedPresets: DiscoverPreset[];
  onSelectRelated: (preset: DiscoverPreset) => void;
}

export function DiscoverDetailModal({
  preset,
  open,
  onClose,
  onUsePrompt,
  relatedPresets,
  onSelectRelated,
}: DiscoverDetailModalProps) {
  if (!preset) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(preset.prompt);
    toast.success('Prompt copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{preset.title}</DialogTitle>
          <DialogDescription>Inspiration preset details</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
            <img
              src={preset.image_url}
              alt={preset.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{preset.category}</Badge>
              <Badge variant="outline">{preset.aspect_ratio}</Badge>
              {preset.quality === 'high' && (
                <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">HD</Badge>
              )}
            </div>

            {preset.model_name && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Model</p>
                <p className="text-sm">{preset.model_name}</p>
              </div>
            )}

            {preset.scene_name && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Scene</p>
                <p className="text-sm">{preset.scene_name}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Prompt</p>
              <div className="bg-muted/50 rounded-lg p-3 text-sm leading-relaxed border border-border/50">
                {preset.prompt}
              </div>
            </div>

            {preset.tags && preset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {preset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-auto pt-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Prompt
              </Button>
              <Button size="sm" onClick={() => onUsePrompt(preset)} className="flex-1">
                Use Prompt <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedPresets.length > 0 && (
          <div className="pt-4 border-t border-border mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              More like this
            </p>
            <div className="grid grid-cols-4 gap-2">
              {relatedPresets.map((rp) => (
                <button
                  key={rp.id}
                  onClick={() => onSelectRelated(rp)}
                  className="aspect-[3/4] rounded-lg overflow-hidden bg-muted hover:ring-2 ring-primary transition-all"
                >
                  <img
                    src={rp.image_url}
                    alt={rp.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
