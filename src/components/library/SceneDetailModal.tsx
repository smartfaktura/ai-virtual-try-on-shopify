import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Sparkles } from 'lucide-react';
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

  if (!scene) return null;

  const subLabel = getCollectionLabel(scene.category_collection);
  const heroUrl = scene.preview_image_url
    ? getOptimizedUrl(scene.preview_image_url, { quality: 75 })
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
      <DialogContent className="max-w-3xl border-none bg-background p-0 sm:rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{scene.title}</DialogTitle>
        <div className="grid gap-0 md:grid-cols-[5fr_6fr]">
          {/* Hero */}
          <div className="relative aspect-[4/5] w-full bg-muted/40">
            <div className="absolute inset-0 flex items-center justify-center text-foreground/15">
              <ImageIcon className="h-10 w-10" />
            </div>
            {heroUrl && (
              <img
                src={heroUrl}
                alt={scene.title}
                loading="eager"
                decoding="async"
                className="relative z-[1] h-full w-full object-cover animate-in fade-in duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {familyLabel && (
                <Badge variant="secondary" className="rounded-full bg-foreground/[0.06] text-foreground/70 border-none font-medium">
                  {familyLabel}
                </Badge>
              )}
              <Badge variant="outline" className="rounded-full border-foreground/10 text-foreground/60 font-medium">
                {subLabel}
              </Badge>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] leading-tight">
              {scene.title}
            </h2>

            <p className="text-sm leading-relaxed text-foreground/65">
              {description}
            </p>

            <div className="mt-auto space-y-3 pt-4">
              <Button
                onClick={handleCta}
                size="lg"
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold h-[3.25rem]"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {user ? 'Create this visual' : 'Sign up and create free'}
              </Button>
              <p className="text-center text-xs text-foreground/50">
                Upload your product photo and VOVV.AI will adapt this look.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
