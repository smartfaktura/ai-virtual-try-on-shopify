import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import { ShimmerImage } from '@/components/ui/shimmer-image';

interface PublicDiscoverDetailModalProps {
  item: DiscoverItem | null;
  open: boolean;
  onClose: () => void;
  relatedItems: DiscoverItem[];
  onSelectRelated: (item: DiscoverItem) => void;
}

export function PublicDiscoverDetailModal({
  item,
  open,
  onClose,
  relatedItems,
  onSelectRelated,
}: PublicDiscoverDetailModalProps) {
  const navigate = useNavigate();

  // Lock body scroll when open
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

  if (!open || !item) return null;

  const isPreset = item.type === 'preset';
  const imageUrl = isPreset ? item.data.image_url : item.data.previewUrl;
  const title = isPreset ? item.data.title : item.data.name;
  const description = isPreset ? item.data.prompt : item.data.description;
  const category = isPreset ? item.data.category : item.data.category;

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
          {/* Close button */}
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
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">{title}</h2>
              {isPreset && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{item.data.aspect_ratio}</span>
                  {item.data.quality === 'high' && (
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">· HD</span>
                  )}
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
                {item.data.tags.map((tag: string) => (
                  <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground/70 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Primary CTA — Sign Up */}
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 rounded-xl text-sm font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              Create account for free to generate results like this
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-center text-muted-foreground/60">
              Sign up to access prompts, scenes and generate AI fashion photography
            </p>

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
