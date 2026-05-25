import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowRight, Mountain, Sparkles, Users, Layers, Trash2, Wand2, Lock } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { canCreateBrandScenes } from '@/features/brand-scenes/access';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface BrandSceneRow {
  id: string;
  scene_id: string;
  title: string;
  description: string | null;
  preview_image_url: string | null;
  created_at: string;
  brand_scene_module: string | null;
}

export default function BrandScenes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, openBuyModal } = useCredits();
  const canCreate = canCreateBrandScenes(plan);
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<BrandSceneRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['brand-scenes', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<BrandSceneRow[]> => {
      const { data, error } = await supabase
        .from('product_image_scenes')
        .select('id, scene_id, title, description, preview_image_url, created_at, brand_scene_module')
        .eq('is_brand_scene', true)
        .eq('owner_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as BrandSceneRow[];
    },
  });

  const scenes = data ?? [];
  const hasScenes = scenes.length > 0;

  const handleUse = (scene: BrandSceneRow) => {
    navigate(`/app/generate/product-images?sceneRef=${encodeURIComponent(scene.scene_id)}`);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    const { error } = await supabase
      .from('product_image_scenes')
      .delete()
      .eq('id', target.id);
    if (error) {
      toast.error('Could not delete scene');
      return;
    }
    toast.success('Scene deleted');
    queryClient.invalidateQueries({ queryKey: ['brand-scenes', user?.id] });
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <SEOHead title="Brand Scenes — VOVV.AI" description="Your custom brand scenes" noindex />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Brand Scenes</h1>
          <p className="text-base text-muted-foreground mt-1.5 max-w-xl">
            Your custom signature scenes — use them on any product
          </p>
        </div>
        {hasScenes && (
          <Button
            onClick={() => navigate('/app/brand-scenes/new')}
            className="rounded-full font-semibold gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New brand scene
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : hasScenes ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onUse={() => handleUse(scene)}
              onDelete={() => setPendingDelete(scene)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreate={() => navigate('/app/brand-scenes/new')} />
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this brand scene?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete?.title}" will be permanently removed from your scene library. Credits already spent are not refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SceneCard({
  scene,
  onUse,
  onDelete,
}: {
  scene: BrandSceneRow;
  onUse: () => void;
  onDelete: () => void;
}) {
  const imgSrc = scene.preview_image_url
    ? getOptimizedUrl(scene.preview_image_url, { quality: 70 })
    : null;

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-card flex flex-col">
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={scene.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete brand scene"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3.5 flex flex-col gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground tracking-tight truncate">
            {scene.title}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {new Date(scene.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            {scene.brand_scene_module ? ` · ${scene.brand_scene_module}` : ''}
          </p>
        </div>

        <Button
          size="sm"
          onClick={onUse}
          className="rounded-full gap-1.5 h-8 px-3 text-xs w-full sm:w-auto sm:self-start"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Use scene
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 max-w-3xl">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
        <Mountain className="w-6 h-6 text-primary" />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
        Design your first brand scene
      </h2>
      <p className="text-base text-muted-foreground mt-3 leading-relaxed">
        Brand scenes are your signature backgrounds, environments, and moods — generated from your references or a prompt and saved to use across every product.
      </p>

      <div className="mt-8 space-y-3">
        {[
          { icon: Sparkles, text: 'Design from a reference image or a written prompt' },
          { icon: Layers, text: 'Save and reuse across all your products' },
          { icon: Users, text: 'Stays private to your account' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.text} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pt-1">{item.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center gap-3">
        <Button onClick={onCreate} className="rounded-full font-semibold gap-2">
          <Plus className="w-4 h-4" />
          Create your first brand scene
        </Button>
        <Button
          variant="ghost"
          onClick={() => (window.location.href = '/app/workflows')}
          className="rounded-full font-medium gap-2"
        >
          Or explore ready-made scenes
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
