import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { PublicDiscoverDetailModal } from '@/components/app/PublicDiscoverDetailModal';
import { useDiscoverPresets } from '@/hooks/useDiscoverPresets';
import { useFeaturedItems } from '@/hooks/useFeaturedItems';
import { mockTryOnPoses } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/landing/PageLayout';
import type { TryOnPose, PoseCategory } from '@/types';

interface PublicCustomScene {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  is_active: boolean;
}

function toTryOnPose(scene: PublicCustomScene): TryOnPose {
  return {
    poseId: `custom-${scene.id}`,
    name: scene.name,
    category: scene.category as PoseCategory,
    description: scene.description,
    promptHint: scene.description,
    previewUrl: scene.image_url,
  };
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'photography', label: 'Photography' },
  { id: 'styling', label: 'Styling' },
  { id: 'ads', label: 'Ads' },
  { id: 'lifestyle', label: 'Lifestyle' },
] as const;

const SCENE_CATEGORY_MAP: Record<string, string[]> = {
  studio: ['commercial', 'photography'],
  lifestyle: ['lifestyle'],
  editorial: ['cinematic', 'photography'],
  streetwear: ['styling', 'lifestyle'],
};

function getItemId(item: DiscoverItem): string {
  return item.type === 'preset' ? item.data.id : item.data.poseId;
}

function getItemCategory(item: DiscoverItem): string {
  return item.data.category;
}

function useColumnCount() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w < 640) return 2;
    if (w < 1024) return 3;
    return 4;
  });
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCount(2);
      else if (w < 1024) setCount(3);
      else setCount(4);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

export default function PublicDiscover() {
  const navigate = useNavigate();
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const { featuredMap } = useFeaturedItems();
  const columnCount = useColumnCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);

  // Fetch custom scenes publicly (no auth required with new RLS)
  const { data: customScenes = [] } = useQuery({
    queryKey: ['public-custom-scenes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_scenes' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as PublicCustomScene[]) ?? [];
    },
  });

  const customScenePoses = useMemo(() => customScenes.map(toTryOnPose), [customScenes]);

  // Build unified feed
  const allItems = useMemo<DiscoverItem[]>(() => {
    const presetItems: DiscoverItem[] = presets.map((p) => ({ type: 'preset', data: p }));
    const sceneItems: DiscoverItem[] = [...mockTryOnPoses, ...customScenePoses].map((s) => ({ type: 'scene', data: s }));
    return [...presetItems, ...sceneItems];
  }, [presets, customScenePoses]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (item.type === 'scene') {
          const sceneCat = item.data.category;
          const mappedCategories = SCENE_CATEGORY_MAP[sceneCat] ?? [];
          if (!mappedCategories.includes(selectedCategory)) return false;
        } else {
          if (item.data.category !== selectedCategory) return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (item.type === 'preset') {
          return (
            item.data.title.toLowerCase().includes(q) ||
            item.data.prompt.toLowerCase().includes(q) ||
            item.data.tags?.some((t: string) => t.toLowerCase().includes(q))
          );
        } else {
          return (
            item.data.name.toLowerCase().includes(q) ||
            item.data.description.toLowerCase().includes(q) ||
            item.data.category.toLowerCase().includes(q)
          );
        }
      }
      return true;
    });
  }, [allItems, selectedCategory, searchQuery]);

  // Sort: featured items first
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aKey = `${a.type}:${getItemId(a)}`;
      const bKey = `${b.type}:${getItemId(b)}`;
      const aFeat = featuredMap.get(aKey);
      const bFeat = featuredMap.get(bKey);
      if (aFeat && !bFeat) return -1;
      if (!aFeat && bFeat) return 1;
      if (aFeat && bFeat) return new Date(bFeat.created_at).getTime() - new Date(aFeat.created_at).getTime();
      return 0;
    });
  }, [filtered, featuredMap]);

  // Related items for modal
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    const selCat = getItemCategory(selectedItem);
    return allItems
      .filter((i) => {
        if (i.type === selectedItem.type && getItemId(i) === getItemId(selectedItem)) return false;
        return getItemCategory(i) === selCat;
      })
      .slice(0, 9);
  }, [allItems, selectedItem]);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Discover
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Browse curated AI fashion photography — prompts, scenes and styles
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
          <Input
            placeholder="Search prompts, scenes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-2xl border-border/50 bg-muted/30 text-sm placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Category filter bar */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                selectedCategory === cat.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-shimmer bg-[length:200%_100%]" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground mb-1">No results found</p>
            <p className="text-xs text-muted-foreground/70 max-w-xs">
              Try different keywords or{' '}
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-primary hover:underline"
              >
                browse all
              </button>
            </p>
          </div>
        ) : (
          (() => {
            const columns: DiscoverItem[][] = Array.from({ length: columnCount }, () => []);
            sorted.forEach((item, i) => {
              columns[i % columnCount].push(item);
            });
            return (
              <div className="flex gap-1">
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex-1 flex flex-col gap-1">
                    {col.map((item) => (
                      <DiscoverCard
                        key={item.type === 'preset' ? `p-${item.data.id}` : `s-${item.data.poseId}`}
                        item={item}
                        onClick={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })()
        )}

        {/* Detail modal */}
        <PublicDiscoverDetailModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          relatedItems={relatedItems}
          onSelectRelated={setSelectedItem}
        />
      </div>
    </PageLayout>
  );
}
