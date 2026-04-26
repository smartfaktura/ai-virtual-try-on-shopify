import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Check, Loader2 } from 'lucide-react';
import { usePublicSceneLibrary, type PublicScene } from '@/hooks/usePublicSceneLibrary';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';
import type { SeoVisualSlot } from '@/data/seoPageVisualSlots';

interface ScenePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageLabel: string;
  slot: SeoVisualSlot;
  currentSceneId?: string | null;
  onSelect: (scene: PublicScene) => void;
}

const PAGE_SIZE = 60;

function matchesTags(scene: PublicScene, tags: string[]): boolean {
  if (tags.length === 0) return true;
  const haystack = [
    scene.category_collection ?? '',
    scene.sub_category ?? '',
    scene.title ?? '',
    scene.description ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return tags.some((t) => haystack.includes(t.toLowerCase()));
}

export function ScenePickerModal({
  open,
  onOpenChange,
  pageLabel,
  slot,
  currentSceneId,
  onSelect,
}: ScenePickerModalProps) {
  const { scenes, isLoading } = usePublicSceneLibrary();
  const [search, setSearch] = useState('');
  const [recommendedOnly, setRecommendedOnly] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return scenes.filter((sc) => {
      if (!sc.preview_image_url) return false;
      if (s) {
        const hay = `${sc.title} ${sc.category_collection ?? ''} ${sc.sub_category ?? ''}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      if (recommendedOnly && !matchesTags(sc, slot.recommendedTags)) return false;
      return true;
    });
  }, [scenes, search, recommendedOnly, slot.recommendedTags]);

  const visible = filtered.slice(0, visibleCount);

  const selectedScene = scenes.find((s) => s.scene_id === pendingId);

  const handleSelect = () => {
    if (!selectedScene) return;
    onSelect(selectedScene);
    setPendingId(null);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setPendingId(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-5xl max-h-[88vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Select visual from Product Visuals library
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Page: <span className="font-medium text-foreground">{pageLabel}</span>{' · '}
            Section: <span className="font-medium text-foreground">{slot.section}</span>{' · '}
            Slot: <span className="font-medium text-foreground">{slot.label}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
            {slot.recommendedTags.slice(0, 6).map((t) => (
              <Badge key={t} variant="outline" className="font-normal">
                {t}
              </Badge>
            ))}
            <span className="text-muted-foreground ml-1">
              · Recommended ratio: {slot.recommendedAspectRatio}
            </span>
          </div>
        </DialogHeader>

        <div className="px-6 py-3 border-b flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by scene name or category…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Switch
              id="rec-only"
              checked={recommendedOnly}
              onCheckedChange={(v) => {
                setRecommendedOnly(v);
                setVisibleCount(PAGE_SIZE);
              }}
            />
            <label htmlFor="rec-only" className="cursor-pointer text-muted-foreground">
              Recommended for this slot
            </label>
          </div>
          <div className="text-xs text-muted-foreground">
            {filtered.length.toLocaleString()} scenes
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading scene library…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-20">
              No Product Visuals found. Try removing filters or searching a broader term.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {visible.map((sc) => {
                  const isCurrent = currentSceneId === sc.scene_id;
                  const isPending = pendingId === sc.scene_id;
                  return (
                    <button
                      key={sc.scene_id}
                      type="button"
                      onClick={() => setPendingId(sc.scene_id)}
                      className={cn(
                        'group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border-2 transition-all text-left',
                        isPending
                          ? 'border-primary ring-2 ring-primary/30'
                          : isCurrent
                          ? 'border-foreground/40'
                          : 'border-transparent hover:border-foreground/20',
                      )}
                    >
                      <img
                        src={getOptimizedUrl(sc.preview_image_url!, { quality: 55 })}
                        alt={sc.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="text-[11px] text-white font-medium leading-tight truncate">
                          {sc.title}
                        </div>
                        {sc.sub_category && (
                          <div className="text-[10px] text-white/70 truncate">
                            {sc.sub_category}
                          </div>
                        )}
                      </div>
                      {isCurrent && !isPending && (
                        <Badge className="absolute top-1.5 left-1.5 text-[10px] py-0 h-4">
                          Current
                        </Badge>
                      )}
                      {isPending && (
                        <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {visibleCount < filtered.length && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Load more ({filtered.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t px-6 py-3 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedScene}>
            Select image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
