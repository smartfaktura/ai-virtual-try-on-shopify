import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DiscoverItem } from '@/components/app/DiscoverCard';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { SharePopover } from '@/components/app/SharePopover';
import { SITE_URL } from '@/lib/constants';
import { getItemSlug } from '@/lib/slugUtils';

interface PublicDiscoverDetailModalProps {
  item: DiscoverItem | null;
  open: boolean;
  onClose: () => void;
  relatedItems: DiscoverItem[];
  onSelectRelated: (item: DiscoverItem) => void;
  onRecreate?: (item: DiscoverItem) => void;
}

export function PublicDiscoverDetailModal({
  item,
  open,
  onClose,
  relatedItems,
  onSelectRelated,
  onRecreate,
}: PublicDiscoverDetailModalProps) {
  const navigate = useNavigate();
  const [isRecreating, setIsRecreating] = useState(false);
  useEffect(() => { if (!open) setIsRecreating(false); }, [open]);

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

  const workflowLabel = isPreset && item.data.workflow_name
    ? item.data.workflow_name.replace(/\bSet$/i, 'Workflow')
    : isPreset ? 'Freestyle' : 'Product Visuals';

  return createPortal(
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
      >
        {/* Left — Image showcase */}
        <div className="w-full md:w-[60%] h-[45vh] md:h-full flex items-center justify-center p-6 md:p-12">
          <ShimmerImage
            src={imageUrl}
            alt={title}
            wrapperClassName="flex items-center justify-center"
            className="max-w-full max-h-[calc(45vh-2rem)] md:max-h-[calc(100vh-6rem)] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right — Controls panel */}
        <div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20" onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-7 h-7" strokeWidth={2} />
          </button>

          <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">{title}</h2>
            </div>

            {/* Created with section */}
            {(isPreset || item.type === 'scene') && (
              <div className="space-y-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
                    Created with
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
                    {workflowLabel}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {item.type === 'scene' && (
                    <div className="flex items-center gap-2.5">
                      {(item.data as any).previewUrl && (
                        <img
                          src={getOptimizedUrl((item.data as any).previewUrl, { quality: 60 })}
                          alt={(item.data as any).name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{(item.data as any).name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Scene</p>
                      </div>
                    </div>
                  )}
                  {isPreset && item.data.scene_name && (
                    <div className="flex items-center gap-2.5">
                      {item.data.scene_image_url && (
                         <img
                          src={getOptimizedUrl(item.data.scene_image_url, { quality: 60 })}
                          alt={item.data.scene_name}
           className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.data.scene_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Scene</p>
                      </div>
                    </div>
                  )}
                  {isPreset && item.data.model_name && (
                    <div className="flex items-center gap-2.5">
                      {item.data.model_image_url && (
                          <img
                           src={getOptimizedUrl(item.data.model_image_url, { quality: 60 })}
                           alt={item.data.model_name}
           className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.data.model_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Model</p>
                      </div>
                    </div>
                  )}
                  {(item.data as any).product_name && (
                    <div className="flex items-center gap-2.5">
                      {(item.data as any).product_image_url && (
                         <img
                          src={getOptimizedUrl((item.data as any).product_image_url, { quality: 60 })}
                          alt={(item.data as any).product_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{(item.data as any).product_name}</p>
                        <p className="text-[10px] text-muted-foreground/60">Product</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Primary CTA — Sign Up */}
            <Button
              disabled={isRecreating}
              onClick={() => {
                if (isRecreating) return;
                setIsRecreating(true);
                if (onRecreate && item) {
                  onRecreate(item);
                  return;
                }
                if (isPreset && item.data.workflow_slug) {
                  const params = new URLSearchParams();
                  if (item.data.model_name) params.set('model', item.data.model_name);
                  if (item.data.scene_name) params.set('scene', item.data.scene_name);
                  navigate(`/auth?redirect=/app/generate/${item.data.workflow_slug}?${params.toString()}`);
                } else if (isPreset) {
                  const params = new URLSearchParams();
                  if (item.data.prompt) params.set('prompt', item.data.prompt);
                  if (item.data.aspect_ratio) params.set('ratio', item.data.aspect_ratio);
                  if (item.data.model_name) params.set('model', item.data.model_name);
                  if (item.data.scene_name) params.set('scene', item.data.scene_name);
                  if (item.data.model_image_url) params.set('modelImage', item.data.model_image_url);
                  if (item.data.scene_image_url) params.set('sceneImage', item.data.scene_image_url);
                  params.set('fromDiscover', '1');
                  navigate(`/auth?redirect=/app/freestyle?${params.toString()}`);
                } else if (item.type === 'scene') {
                  const params = new URLSearchParams();
                  params.set('scene', (item.data as any).poseId || '');
                  if ((item.data as any).previewUrl) params.set('sceneImage', (item.data as any).previewUrl);
                  if ((item.data as any).name) params.set('sceneName', (item.data as any).name);
                  params.set('fromDiscover', '1');
                  navigate(`/auth?redirect=/app/freestyle?${params.toString()}`);
                } else {
                  navigate('/auth');
                }
              }}
              className="w-full h-[3.25rem] rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
            >
              {onRecreate ? 'Recreate This' : (
                <>
                  <span className="sm:hidden">Try this for free</span>
                  <span className="hidden sm:inline">Create account to recreate this</span>
                </>
              )}
              {isRecreating ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>

            <div className="flex">
              <SharePopover
                url={`${SITE_URL}/discover/${getItemSlug(item)}`}
                title={title}
                variant="action"
              />
            </div>

            <p className="text-[13px] text-center text-muted-foreground/75 leading-relaxed px-2">
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
                        <ShimmerImage src={getOptimizedUrl(riImage, { quality: 60 })} alt={riTitle} className="w-full h-full object-cover" aspectRatio="3/4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
