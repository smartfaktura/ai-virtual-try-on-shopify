import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Compass, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useFeaturedItems, useToggleFeatured } from '@/hooks/useFeaturedItems';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { mockTryOnPoses } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved' },
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

// Stop words for keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'are', 'was',
  'were', 'this', 'that', 'has', 'have', 'had', 'not', 'no', 'can',
  'will', 'do', 'does', 'did', 'its', 'your', 'our', 'their',
]);

function getItemId(item: DiscoverItem): string {
  return item.type === 'preset' ? item.data.id : item.data.poseId;
}

function getItemCategory(item: DiscoverItem): string {
  return item.data.category;
}

function getItemName(item: DiscoverItem): string {
  return item.type === 'preset' ? item.data.title : item.data.name;
}

function getItemTags(item: DiscoverItem): string[] {
  if (item.type === 'preset') return item.data.tags ?? [];
  return [item.data.category];
}

function getItemDescription(item: DiscoverItem): string {
  return item.type === 'preset' ? item.data.prompt : item.data.description;
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
}

function scoreSimilarity(a: DiscoverItem, b: DiscoverItem): number {
  let score = 0;
  const aCat = getItemCategory(a);
  const bCat = getItemCategory(b);
  if (aCat === bCat) score += 2;
  if (a.type === b.type) score += 1;

  // Scene-to-scene bonus
  if (a.type === 'scene' && b.type === 'scene') score += 3;

  // Tag overlap
  const aTags = getItemTags(a);
  const bTags = getItemTags(b);
  for (const t of aTags) {
    if (bTags.includes(t)) score += 1;
  }

  // Cross-type category overlap via scene mapping
  if (a.type !== b.type) {
    const sceneCat = a.type === 'scene' ? aCat : bCat;
    const presetCat = a.type === 'preset' ? aCat : bCat;
    const mapped = SCENE_CATEGORY_MAP[sceneCat] ?? [];
    if (mapped.includes(presetCat)) score += 2;
  }

  // Description keyword overlap
  const aWords = extractKeywords(getItemDescription(a));
  const bWords = new Set(extractKeywords(getItemDescription(b)));
  let kwOverlap = 0;
  for (const w of aWords) {
    if (bWords.has(w)) kwOverlap++;
  }
  score += Math.min(kwOverlap * 0.5, 4); // cap at 4 to prevent domination

  return score;
}

export default function Discover() {
  const navigate = useNavigate();
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const { isSaved, toggleSave, savedItems } = useSavedItems();
  const { isAdmin } = useIsAdmin();
  const { isFeatured, featuredMap } = useFeaturedItems();
  const toggleFeatured = useToggleFeatured();
  const { asPoses: customScenePoses } = useCustomScenes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);
  const [similarTo, setSimilarTo] = useState<DiscoverItem | null>(null);

  // Track views when modal opens
  useEffect(() => {
    if (selectedItem) {
      supabase.from('discover_item_views').insert({
        item_type: selectedItem.type,
        item_id: getItemId(selectedItem),
      }).then();
    }
  }, [selectedItem]);

  // Fetch view count for selected item
  const { data: viewCount } = useQuery({
    queryKey: ['discover-view-count', selectedItem?.type, selectedItem ? getItemId(selectedItem) : null],
    queryFn: async () => {
      if (!selectedItem) return 0;
      const { count } = await supabase
        .from('discover_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', selectedItem.type)
        .eq('item_id', getItemId(selectedItem));
      return count ?? 0;
    },
    enabled: !!selectedItem,
  });

  const savedCount = savedItems.length;

  // Build unified feed
  const allItems = useMemo<DiscoverItem[]>(() => {
    const presetItems: DiscoverItem[] = presets.map((p) => ({ type: 'preset', data: p }));
    const sceneItems: DiscoverItem[] = [...mockTryOnPoses, ...customScenePoses].map((s) => ({ type: 'scene', data: s }));
    return [...presetItems, ...sceneItems];
  }, [presets, customScenePoses]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      // Similar filter
      if (similarTo) {
        const simCat = getItemCategory(similarTo);
        const itemCat = getItemCategory(item);
        if (itemCat !== simCat) return false;
        if (similarTo.type === 'preset' && item.type === 'preset') {
          const simTags = similarTo.data.tags ?? [];
          const itemTags = item.data.tags ?? [];
          if (simTags.length > 0 && itemTags.length > 0) {
            const overlap = simTags.some((t) => itemTags.includes(t));
            if (!overlap) return false;
          }
        }
        if (item.type === similarTo.type && getItemId(item) === getItemId(similarTo)) return false;
        return true;
      }

      // Saved filter
      if (selectedCategory === 'saved') {
        const itemType = item.type;
        const itemId = getItemId(item);
        return isSaved(itemType, itemId);
      }

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
            item.data.tags?.some((t) => t.toLowerCase().includes(q))
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
  }, [allItems, selectedCategory, searchQuery, similarTo, isSaved, savedItems]);

  // Sort: featured items first (by created_at desc), then rest
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

  // Improved "More Like This" with scoring + keywords
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    return allItems
      .filter((i) => !(i.type === selectedItem.type && getItemId(i) === getItemId(selectedItem)))
      .map((i) => ({ item: i, score: scoreSimilarity(selectedItem, i) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((x) => x.item);
  }, [allItems, selectedItem]);

  const handleItemClick = (item: DiscoverItem) => {
    setSelectedItem(item);
  };

  const handleUseItem = (item: DiscoverItem) => {
    if (item.type === 'scene') {
      navigate(`/app/freestyle?scene=${item.data.poseId}`);
    } else {
      const params = new URLSearchParams({
        prompt: item.data.prompt,
        ratio: item.data.aspect_ratio,
        quality: item.data.quality,
      });
      navigate(`/app/freestyle?${params.toString()}`);
    }
  };

  const handleSearchSimilar = (item: DiscoverItem) => {
    setSimilarTo(item);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleToggleSave = (item: DiscoverItem) => {
    toggleSave.mutate({ itemType: item.type, itemId: getItemId(item) });
  };

  const handleToggleFeatured = (item: DiscoverItem) => {
    const itemId = getItemId(item);
    toggleFeatured.mutate({ itemType: item.type, itemId, currentlyFeatured: isFeatured(item.type, itemId) });
  };

  return (
    <div className="space-y-8 py-8 px-1">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Discover</h1>
        <p className="text-sm text-muted-foreground">Browse curated prompts and styles for inspiration</p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60" />
        <Input
          placeholder="Search prompts, scenes, tags..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setSimilarTo(null); }}
          className="pl-11 h-12 rounded-2xl border-border/50 bg-muted/30 text-sm placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Similar-to chip */}
      {similarTo && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Similar to: {getItemName(similarTo)}
            <button onClick={() => setSimilarTo(null)} className="ml-1.5 hover:text-primary/70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Category filter bar */}
      {!similarTo && (
        <div className="flex flex-wrap gap-2">
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
              {cat.id === 'saved' && savedCount > 0 && (
                <span className="ml-1.5 text-xs opacity-70">· {savedCount}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Masonry grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground mb-1">No results found</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs">
            Try different keywords or{' '}
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSimilarTo(null); }}
              className="text-primary hover:underline"
            >
              browse all
            </button>
          </p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-1">
          {filtered.map((item) => (
            <DiscoverCard
              key={item.type === 'preset' ? `p-${item.data.id}` : `s-${item.data.poseId}`}
              item={item}
              onClick={() => handleItemClick(item)}
              isSaved={isSaved(item.type, getItemId(item))}
              onToggleSave={() => handleToggleSave(item)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      <DiscoverDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onUseItem={handleUseItem}
        onSearchSimilar={handleSearchSimilar}
        relatedItems={relatedItems}
        onSelectRelated={setSelectedItem}
        isSaved={selectedItem ? isSaved(selectedItem.type, getItemId(selectedItem)) : false}
        onToggleSave={selectedItem ? () => handleToggleSave(selectedItem) : undefined}
        viewCount={viewCount ?? undefined}
      />
    </div>
  );
}
