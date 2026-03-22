import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Compass, X } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { DiscoverCard, type DiscoverItem } from '@/components/app/DiscoverCard';
import { DiscoverDetailModal } from '@/components/app/DiscoverDetailModal';
import { useDiscoverPresets, type DiscoverPreset } from '@/hooks/useDiscoverPresets';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useFeaturedItems, useToggleFeatured } from '@/hooks/useFeaturedItems';
import { useCustomScenes } from '@/hooks/useCustomScenes';
import { useAdminSubmissions } from '@/hooks/useDiscoverSubmissions';
import { AdminSubmissionsPanel } from '@/components/app/AdminSubmissionsPanel';
import { mockTryOnPoses } from '@/data/mockData';
import { useHiddenScenes } from '@/hooks/useHiddenScenes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports' },
  { id: 'supplements', label: 'Health' },
] as const;

// Map old style-based categories → new product categories
const PRODUCT_CATEGORY_MAP: Record<string, string[]> = {
  // Preset style categories
  editorial: ['fashion', 'fragrances', 'jewelry'],
  commercial: ['fashion', 'jewelry', 'accessories', 'electronics', 'beauty'],
  lifestyle: ['home', 'food', 'accessories', 'fashion'],
  fashion: ['fashion', 'accessories'],
  campaign: ['fashion', 'sports', 'beauty', 'electronics'],
  cinematic: ['fashion', 'fragrances', 'jewelry'],
  photography: ['fashion', 'jewelry', 'accessories', 'electronics', 'beauty'],
  styling: ['fashion', 'accessories', 'jewelry'],
  ads: ['fashion', 'sports', 'beauty', 'electronics'],
  // Scene categories
  studio: ['fashion', 'jewelry', 'accessories', 'electronics', 'beauty'],
  streetwear: ['fashion', 'accessories'],
  fitness: ['sports', 'supplements'],
  athletic: ['sports', 'supplements'],
  gym: ['sports', 'supplements'],
  beauty: ['beauty', 'fragrances'],
  desert: ['fashion', 'fragrances'],
  outdoor: ['sports', 'home', 'fashion'],
  beach: ['fashion', 'accessories'],
  garden: ['home', 'beauty', 'fragrances'],
  industrial: ['electronics', 'fashion'],
  urban: ['fashion', 'accessories'],
  rooftop: ['fashion', 'food'],
  cafe: ['food', 'home'],
  mirror: ['beauty', 'fashion'],
  casual: ['fashion', 'accessories'],
  cozy: ['home', 'fashion'],
  professional: ['electronics', 'accessories'],
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

function resolveCategory(cat: string): string {
  return cat;
}

function itemMatchesProductCategory(item: DiscoverItem, productCat: string): boolean {
  const itemCat = item.data.category;
  const mapped = PRODUCT_CATEGORY_MAP[itemCat] ?? [];
  if (mapped.includes(productCat)) return true;
  // Also check tags for presets
  if (item.type === 'preset' && item.data.tags) {
    return item.data.tags.some((t: string) => {
      const tagMapped = PRODUCT_CATEGORY_MAP[t.toLowerCase()] ?? [];
      return tagMapped.includes(productCat);
    });
  }
  return false;
}

function scoreSimilarity(a: DiscoverItem, b: DiscoverItem): number {
  let score = 0;
  const aCat = resolveCategory(getItemCategory(a));
  const bCat = resolveCategory(getItemCategory(b));
  if (aCat === bCat) score += 2;
  if (a.type === b.type) score += 1;

  // Scene-to-scene bonus
  if (a.type === 'scene' && b.type === 'scene') score += 3;

  // Tag overlap (weighted)
  const aTags = getItemTags(a);
  const bTags = getItemTags(b);
  for (const t of aTags) {
    if (bTags.includes(t)) score += 1.5;
  }

  // Workflow slug match
  if (a.type === 'preset' && b.type === 'preset') {
    if (a.data.workflow_slug && a.data.workflow_slug === b.data.workflow_slug) score += 2;
  }

  // Cross-type category overlap via product mapping
  if (a.type !== b.type) {
    const sceneCat = a.type === 'scene' ? getItemCategory(a) : getItemCategory(b);
    const presetCat = a.type === 'preset' ? getItemCategory(a) : getItemCategory(b);
    const mapped = PRODUCT_CATEGORY_MAP[sceneCat] ?? [];
    const presetMapped = PRODUCT_CATEGORY_MAP[presetCat] ?? [];
    const overlap = mapped.some((c) => presetMapped.includes(c));
    if (overlap) score += 2;
  }

  // Description keyword overlap
  const aWords = extractKeywords(getItemDescription(a));
  const bWords = new Set(extractKeywords(getItemDescription(b)));
  let kwOverlap = 0;
  for (const w of aWords) {
    if (bWords.has(w)) kwOverlap++;
  }
  score += Math.min(kwOverlap * 0.5, 4);

  return score;
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

function DiscoverLoadingState() {
  const team = useMemo(() => [...TEAM_MEMBERS].sort(() => 0.5 - Math.random()).slice(0, 5), []);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveIdx((i) => (i + 1) % 5), 2500);
    return () => clearInterval(timer);
  }, []);

  const activeMember = team[activeIdx];

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      {/* Avatar row */}
      <div className="flex items-center gap-3">
        {team.map((member, i) => (
          <div
            key={member.name}
            className="transition-all duration-500"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <Avatar
              className={cn(
                'w-11 h-11 border-2 transition-all duration-500 animate-fade-in',
                i === activeIdx
                  ? 'border-primary ring-2 ring-primary/30 scale-110'
                  : 'border-border/40 opacity-50 grayscale-[30%]'
              )}
            >
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        ))}
      </div>

      {/* Rotating status text */}
      <p
        key={activeMember.name}
        className="text-sm text-muted-foreground animate-fade-in"
      >
        <span className="font-medium text-foreground">{activeMember.name}</span>{' '}
        is curating your feed…
      </p>

      {/* Shimmer progress bar */}
      <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 animate-shimmer bg-[length:200%_100%]" />
      </div>
    </div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { itemId: urlItemId } = useParams<{ itemId: string }>();
  const { data: presets = [], isLoading } = useDiscoverPresets();
  const { isSaved, toggleSave, savedItems } = useSavedItems();
  const { isAdmin } = useIsAdmin();
  const { isFeatured, featuredMap } = useFeaturedItems();
  const toggleFeatured = useToggleFeatured();
  const { asPoses: customScenePoses } = useCustomScenes();
  const { filterVisible, hideScene } = useHiddenScenes();
  const { pendingCount: adminPendingCount } = useAdminSubmissions();
  const columnCount = useColumnCount();
  
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
    const sceneItems: DiscoverItem[] = [...filterVisible(mockTryOnPoses), ...customScenePoses].map((s) => ({ type: 'scene', data: s }));
    return [...presetItems, ...sceneItems];
  }, [presets, customScenePoses]);

  // Auto-open item from URL param
  useEffect(() => {
    if (!urlItemId || allItems.length === 0) return;
    const found = allItems.find((item) => {
      if (urlItemId.startsWith('scene-')) {
        return item.type === 'scene' && item.data.poseId === urlItemId.replace('scene-', '');
      }
      return item.type === 'preset' && item.data.id === urlItemId;
    });
    if (found) setSelectedItem(found);
  }, [urlItemId, allItems]);

  const getItemUrl = useCallback((item: DiscoverItem): string => {
    const id = item.type === 'scene' ? `scene-${item.data.poseId}` : item.data.id;
    return `/app/discover/${id}`;
  }, []);

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
        if (!itemMatchesProductCategory(item, selectedCategory)) return false;
      }

      return true;
    });
  }, [allItems, selectedCategory, similarTo, isSaved, savedItems]);

  // Sort: featured items first (by created_at desc), then newest first
  const sorted = useMemo(() => {
    const getDate = (item: DiscoverItem): number => {
      const d = item.type === 'preset' ? item.data.created_at : item.data.created_at;
      return d ? new Date(d).getTime() : 0;
    };
    return [...filtered].sort((a, b) => {
      const aKey = `${a.type}:${getItemId(a)}`;
      const bKey = `${b.type}:${getItemId(b)}`;
      const aFeat = featuredMap.get(aKey);
      const bFeat = featuredMap.get(bKey);
      if (aFeat && !bFeat) return -1;
      if (!aFeat && bFeat) return 1;
      if (aFeat && bFeat) return new Date(bFeat.created_at).getTime() - new Date(aFeat.created_at).getTime();
      return getDate(b) - getDate(a);
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
    window.history.pushState(null, '', getItemUrl(item));
    setSelectedItem(item);
  };

  const handleClose = useCallback(() => {
    setSelectedItem(null);
    window.history.replaceState(null, '', '/app/discover');
  }, []);
  

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
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Discover</h1>
          {isAdmin && adminPendingCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {adminPendingCount} pending
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Browse curated prompts and styles for inspiration</p>
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
        <div className="flex flex-wrap justify-center gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-6 py-2.5 rounded-full text-[15px] font-medium tracking-wide transition-all duration-200 whitespace-nowrap shrink-0',
                selectedCategory === cat.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted/20 text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground'
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
        <DiscoverLoadingState />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground mb-1">No results found</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs">
            Try different keywords or{' '}
            <button
              onClick={() => { setSelectedCategory('all'); setSimilarTo(null); }}
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
                  {col.map((item) => {
                    const itemId = getItemId(item);
                    return (
                      <DiscoverCard
                        key={item.type === 'preset' ? `p-${item.data.id}` : `s-${item.data.poseId}`}
                        item={item}
                        onClick={() => handleItemClick(item)}
                        isSaved={isSaved(item.type, itemId)}
                        onToggleSave={() => handleToggleSave(item)}
                        isFeatured={isFeatured(item.type, itemId)}
                        isAdmin={isAdmin}
                        onToggleFeatured={() => handleToggleFeatured(item)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()
      )}

      {/* Admin submissions panel */}
      {isAdmin && (
        <div className="pt-8 border-t border-border/30">
          <AdminSubmissionsPanel />
        </div>
      )}

      {/* Detail modal */}
      <DiscoverDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={handleClose}
        onUseItem={handleUseItem}
        onSearchSimilar={handleSearchSimilar}
        relatedItems={relatedItems}
        onSelectRelated={(item) => { window.history.replaceState(null, '', getItemUrl(item)); setSelectedItem(item); }}
        isSaved={selectedItem ? isSaved(selectedItem.type, getItemId(selectedItem)) : false}
        onToggleSave={selectedItem ? () => handleToggleSave(selectedItem) : undefined}
        viewCount={viewCount ?? undefined}
        isAdmin={isAdmin}
        isFeatured={selectedItem ? isFeatured(selectedItem.type, getItemId(selectedItem)) : false}
        onToggleFeatured={selectedItem ? () => handleToggleFeatured(selectedItem) : undefined}
        onDelete={selectedItem && isAdmin ? async () => {
          if (selectedItem.type === 'preset') {
            const { error } = await supabase.from('discover_presets').delete().eq('id', selectedItem.data.id);
            if (error) { toast.error('Failed to delete'); return; }
            toast.success('Deleted from Discover');
            queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
          } else {
            const poseId = (selectedItem.data as any).poseId ?? '';
            if (!poseId.startsWith('custom-')) {
              // Hide built-in scene via hidden_scenes table
              await hideScene.mutateAsync(poseId);
              toast.success('Scene hidden from feed');
              setSelectedItem(null);
              return;
            }
            const sceneId = poseId.replace('custom-', '');
            const { error } = await supabase.from('custom_scenes').delete().eq('id', sceneId);
            if (error) { toast.error('Failed to delete scene'); return; }
            toast.success('Scene deleted');
            queryClient.invalidateQueries({ queryKey: ['custom-scenes'] });
          }
          setSelectedItem(null);
        } : undefined}
      />
    </div>
  );
}
