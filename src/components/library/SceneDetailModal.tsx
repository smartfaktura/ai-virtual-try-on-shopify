import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, X } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { useAuth } from '@/contexts/AuthContext';
import type { PublicScene } from '@/hooks/usePublicSceneLibrary';
import { getCollectionLabel } from '@/hooks/usePublicSceneLibrary';

interface SceneDetailModalProps {
  scene: PublicScene | null;
  familyLabel?: string;
  onClose: () => void;
}

export function SceneDetailModal({ scene, familyLabel, onClose }: SceneDetailModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const open = !!scene;
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset image load state whenever the scene changes.
  useEffect(() => {
    setImgLoaded(false);
  }, [scene?.scene_id]);

  if (!scene) return null;

  const subLabel = getCollectionLabel(scene.category_collection);
  const heroUrl = scene.preview_image_url
    ? getOptimizedUrl(scene.preview_image_url, { quality: 75 })
    : null;
  // Smaller, cheap-to-fetch placeholder we render first for instant paint.
  const placeholderUrl = scene.preview_image_url
    ? getOptimizedUrl(scene.preview_image_url, { quality: 20 })
    : null;

  const handleCta = () => {
    const target = `/app/generate/product-images?scene=${encodeURIComponent(scene.scene_id)}`;
    if (user) {
      navigate(target);
    } else {
      navigate(`/auth?next=${encodeURIComponent(target)}`);
    }
    onClose();
  };

  const description =
    scene.description?.trim() ||
    'A ready-to-create visual direction. Upload your own product photo and VOVV.AI will adapt this look to your brand.';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[26rem] sm:max-w-3xl md:max-w-5xl lg:max-w-6xl border-none bg-background p-0 rounded-3xl sm:rounded-[2rem] max-h-[94dvh] sm:max-h-[92vh] overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">{scene.title}</DialogTitle>
        <div className="grid gap-0 md:grid-cols-[7fr_5fr] max-h-[94dvh] sm:max-h-[92vh] overflow-y-auto">
          {/* Hero — fills edge-to-edge, no white letterbox bands */}
          <div className="relative aspect-[4/5] md:aspect-auto md:max-h-none w-full overflow-hidden bg-muted/40">
            {/* Skeleton shimmer */}
            {!imgLoaded && (
              <Skeleton className="absolute inset-0 z-[1] rounded-none" />
            )}

            {/* Tiny low-quality placeholder for instant paint */}
            {placeholderUrl && (
              <img
                src={placeholderUrl}
                alt=""
                aria-hidden
                className={`absolute inset-0 z-[2] h-full w-full object-cover blur-xl scale-110 transition-opacity duration-300 ${
                  imgLoaded ? 'opacity-0' : 'opacity-80'
                }`}
              />
            )}

            {/* Full quality hero — cover everywhere so the modal frame stays clean */}
            {heroUrl && (
              <img
                src={heroUrl}
                alt={scene.title}
                loading="eager"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
                className={`relative z-[3] h-full w-full object-cover transition-opacity duration-500 ${
                  imgLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}

            {/* Floating close — high contrast over hero */}
            <DialogClose
              aria-label="Close"
              className="absolute top-4 right-4 z-[4] flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </DialogClose>
          </div>

          {/* Body — generous VOVV spacing */}
          <div className="flex flex-col p-6 sm:p-10 md:p-12">
            <div className="flex flex-wrap items-center gap-2">
              {familyLabel && (
                <Badge variant="secondary" className="rounded-full bg-foreground/[0.06] text-foreground/70 border-none font-medium px-3 py-1">
                  {familyLabel}
                </Badge>
              )}
              <Badge variant="outline" className="rounded-full border-foreground/10 text-foreground/60 font-medium px-3 py-1">
                {subLabel}
              </Badge>
            </div>

            <h2 className="mt-6 sm:mt-8 text-2xl sm:text-3xl md:text-[2.125rem] font-semibold tracking-tight text-foreground leading-[1.15]">
              {scene.title}
            </h2>

            <p className="mt-5 sm:mt-6 text-[0.95rem] sm:text-base leading-relaxed text-foreground/60 max-w-prose">
              {description}
            </p>

            <div className="mt-10 sm:mt-12 md:mt-auto md:pt-12 space-y-3">
              <Button
                onClick={handleCta}
                size="lg"
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold h-[3.5rem] text-[0.95rem]"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {user ? 'Create this visual' : 'Sign up and create free'}
              </Button>
              <p className="text-center text-xs text-foreground/50 leading-relaxed">
                Upload your product photo and VOVV.AI will adapt this look
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
