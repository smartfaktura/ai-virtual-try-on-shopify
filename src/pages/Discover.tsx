import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Compass, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { PageHeader } from '@/components/app/PageHeader';
import { DiscoverCategoryBar } from '@/components/app/DiscoverCategoryBar';
import { DiscoverSubCategoryBar } from '@/components/app/DiscoverSubCategoryBar';
import {
  getDiscoverFamilies,
  getDiscoverSubtypes,
  isMultiSubFamily,
  itemMatchesDiscoverFilter,
} from '@/lib/discoverTaxonomy';

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
import { toast } from '@/lib/brandedToast';
import { cn } from '@/lib/utils';
import { getItemSlug } from '@/lib/slugUtils';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  ...getDiscoverFamilies().map((f) => ({ id: f.id, label: f.label })),
] as const;

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
  if (item.data.category === productCat) return true;
  const cats = (item.data as any).discover_categories;
  return Array.isArray(cats) && cats.includes(productCat);
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

  // Cross-type category overlap
  if (a.type !== b.type) {
    if (getItemCategory(a) === getItemCategory(b)) score += 2;
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
              <AvatarImage src={getOptimizedUrl(member.avatar, { quality: 60 })} alt={member.name} />
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

// Family ids ARE discover category ids now (unified taxonomy).

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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('__all__');
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null);
  const [similarTo, setSimilarTo] = useState<DiscoverItem | null>(null);

  // Reset sub-tab whenever the family changes.
  useEffect(() => {
    setSelectedSubcategory('__all__');
  }, [selectedCategory]);

  // Load user prefs once for "For you" sort on the All tab.
  const [userPrefs, setUserPrefs] = useState<{ families: string[]; subtypes: string[] }>({
    families: [],
    subtypes: [],
  });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from('profiles')
        .select('product_categories, product_subcategories')
        .eq('user_id', u.user.id)
        .maybeSingle();
      if (cancelled) return;
      setUserPrefs({
        families: (data?.product_categories as string[] | null) ?? [],
        subtypes: (((data as any)?.product_subcategories as string[] | null) ?? []),
      });
    })();
    return () => { cancelled = true; };
  }, []);

  // Track views when modal opens (deduplicated per session)
  const viewedItemsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!selectedItem) return;
    const key = `${selectedItem.type}:${getItemId(selectedItem)}`;
    if (viewedItemsRef.current.has(key)) return;
    viewedItemsRef.current.add(key);
    supabase.from('discover_item_views').insert({
      item_type: selectedItem.type,
      item_id: getItemId(selectedItem),
    }).then();
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

  // Build unified feed — deduplicate scenes that have been promoted to presets
  const allItems = useMemo<DiscoverItem[]>(() => {
    const presetItems: DiscoverItem[] = presets.map((p) => ({ type: 'preset', data: p }));
    const presetTitles = new Set(presets.map((p) => p.title));
    const sceneItems: DiscoverItem[] = [...filterVisible(mockTryOnPoses), ...customScenePoses]
      .filter((s) => !presetTitles.has(s.name))
      .map((s) => ({ type: 'scene', data: s }));
    return [...presetItems, ...sceneItems];
  }, [presets, customScenePoses]);

  // Read ?similar= param from Dashboard's "Similar" button
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const similarScene = params.get('similar');
    if (similarScene && allItems.length > 0 && !similarTo) {
      const match = allItems.find(i =>
        (i.type === 'preset' ? i.data.scene_name : i.data.name) === similarScene
      );
      if (match) {
        setSimilarTo(match);
        params.delete('similar');
        navigate({ search: params.toString() }, { replace: true });
      }
    }
  }, [allItems, location.search]);

  // Auto-open item from URL param — supports slug, UUID, and scene- prefix
  useEffect(() => {
    if (!urlItemId || allItems.length === 0) return;
    const found = allItems.find((item) => {
      if (urlItemId.startsWith('scene-')) {
        return item.type === 'scene' && item.data.poseId === urlItemId.replace('scene-', '');
      }
      if (item.type === 'preset') {
        return item.data.slug === urlItemId || item.data.id === urlItemId;
      }
      return false;
    });
    if (found) {
      setSelectedItem(prev => {
        const prevId = prev ? getItemId(prev) : null;
        const foundId = getItemId(found);
        if (prevId === foundId && prev?.type === found.type) return prev;
        return found;
      });
    }
  }, [urlItemId, allItems]);

  const getItemUrl = useCallback((item: DiscoverItem): string => {
    return `/app/discover/${getItemSlug(item)}`;
  }, []);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      // Similar filter
      if (similarTo) {
        const simScene = similarTo.type === 'preset' ? similarTo.data.scene_name : similarTo.data.name;
        if (!simScene) return true;
        const itemScene = item.type === 'preset' ? item.data.scene_name : item.data.name;
        if (itemScene !== simScene) return false;
        if (item.type === similarTo.type && getItemId(item) === getItemId(similarTo)) return false;
        return true;
      }

      // Saved filter
      if (selectedCategory === 'saved') {
        const itemType = item.type;
        const itemId = getItemId(item);
        return isSaved(itemType, itemId);
      }

      // Family + sub-type filter (unified taxonomy)
      if (selectedCategory !== 'all') {
        const data = item.data as any;
        if (
          !itemMatchesDiscoverFilter(
            { category: data.category, subcategory: data.subcategory, discover_categories: data.discover_categories },
            selectedCategory,
            selectedSubcategory,
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, selectedCategory, selectedSubcategory, similarTo, isSaved, savedItems]);

  // Sort: featured items first → user-family bucket index → date DESC.
  // The user's onboarding families and sub-types take priority on the "All" tab.
  const sorted = useMemo(() => {
    const getDate = (item: DiscoverItem): number => {
      const d = item.type === 'preset' ? item.data.created_at : item.data.created_at;
      return d ? new Date(d).getTime() : 0;
    };

    // Family ids = onboarding family ids = discover category ids (unified).
    const userDiscoverCats: string[] = [];
    const seenFam = new Set<string>();
    for (const famId of userPrefs.families) {
      if (!seenFam.has(famId)) { seenFam.add(famId); userDiscoverCats.push(famId); }
    }
    const subtypeSet = new Set(userPrefs.subtypes.map(s => s.toLowerCase()));
    const useForYouOrder = selectedCategory === 'all' && userDiscoverCats.length > 0;

    const familyBucket = (item: DiscoverItem): number => {
      if (!useForYouOrder) return 0;
      const cat = getItemCategory(item);
      const cats = (item.data as any).discover_categories as string[] | undefined;
      const all = [cat, ...(Array.isArray(cats) ? cats : [])];
      for (let i = 0; i < userDiscoverCats.length; i++) {
        if (all.includes(userDiscoverCats[i])) return i;
      }
      return userDiscoverCats.length; // unmatched → after all user buckets
    };

    const subtypeRank = (item: DiscoverItem): number => {
      if (!useForYouOrder || subtypeSet.size === 0) return 1;
      const sub = ((item.data as any).subcategory ?? '').toLowerCase();
      return sub && subtypeSet.has(sub) ? 0 : 1;
    };

    return [...filtered].sort((a, b) => {
      const aKey = `${a.type}:${getItemId(a)}`;
      const bKey = `${b.type}:${getItemId(b)}`;
      const aFeat = featuredMap.get(aKey);
      const bFeat = featuredMap.get(bKey);
      if (aFeat && !bFeat) return -1;
      if (!aFeat && bFeat) return 1;
      if (aFeat && bFeat) return new Date(bFeat.created_at).getTime() - new Date(aFeat.created_at).getTime();

      // User family bucket (lower index = earlier)
      const aBucket = familyBucket(a);
      const bBucket = familyBucket(b);
      if (aBucket !== bBucket) return aBucket - bBucket;

      // Within bucket, sub-type matches first
      const aSub = subtypeRank(a);
      const bSub = subtypeRank(b);
      if (aSub !== bSub) return aSub - bSub;

      return getDate(b) - getDate(a);
    });
  }, [filtered, featuredMap, userPrefs, selectedCategory]);

  // Improved "More Like This" with scoring + keywords
  const relatedItems = useMemo(() => {
    if (!selectedItem) return [];
    
    // Prioritize same scene_name for presets
    if (selectedItem.type === 'preset' && selectedItem.data.scene_name) {
      const sameScene = allItems.filter((i) =>
        i.type === 'preset' &&
        i.data.scene_name === selectedItem.data.scene_name &&
        i.data.id !== selectedItem.data.id
      );
      if (sameScene.length >= 3) return sameScene.slice(0, 9);
    }
    
    return allItems
      .filter((i) => !(i.type === selectedItem.type && getItemId(i) === getItemId(selectedItem)))
      .map((i) => ({ item: i, score: scoreSimilarity(selectedItem, i) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((x) => x.item);
  }, [allItems, selectedItem]);

  const handleItemClick = (item: DiscoverItem) => {
    navigate(getItemUrl(item));
    setSelectedItem(item);
  };

  const handleClose = useCallback(() => {
    setSelectedItem(null);
    navigate('/app/discover', { replace: true });
  }, [navigate]);
  

  const handleUseItem = (item: DiscoverItem) => {
    if (item.type === 'scene') {
      // Scene-type Discover items always belong to product-images workflow
      const sp = new URLSearchParams();
      if (item.data.name) sp.set('scene', item.data.name);
      if (item.data.previewUrl) sp.set('sceneImage', item.data.previewUrl);
      if (item.data.name) sp.set('sceneName', item.data.name);
      // Pass origin category as a disambiguation hint for the resolver
      const sceneCat = (item.data as any).category;
      if (sceneCat) sp.set('sceneCategory', sceneCat);
      sp.set('fromDiscover', '1');
      navigate(`/app/generate/product-images?${sp.toString()}`);
    } else {
      const d = item.data;
      // If it's a workflow preset, route to Generate page with model/scene pre-filled
      if (d.workflow_slug) {
        const params = new URLSearchParams();
        if (d.model_name) params.set('model', d.model_name);
        if (d.scene_name) params.set('scene', d.scene_name);
        if (d.scene_image_url) params.set('sceneImage', d.scene_image_url);
        params.set('fromDiscover', '1');
        navigate(`/app/generate/${d.workflow_slug}?${params.toString()}`);
      } else {
        const params = new URLSearchParams({
          prompt: d.prompt,
          ratio: d.aspect_ratio,
          quality: d.quality,
        });
        if (d.model_name) params.set('model', d.model_name);
        if (d.scene_name) params.set('scene', d.scene_name);
        if (d.model_image_url) params.set('modelImage', d.model_image_url);
        if (d.scene_image_url) params.set('sceneImage', d.scene_image_url);
        params.set('fromDiscover', '1');
        navigate(`/app/freestyle?${params.toString()}`);
      }
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
    <PageHeader
      title="Explore"
      subtitle="Every result here was created by AI — yours can be next"
    >
      {isAdmin && adminPendingCount > 0 && (
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
          {adminPendingCount} pending
        </span>
      )}


      {/* Similar-to chip */}
      {similarTo && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium">
            Similar to: {similarTo.type === 'preset' ? (similarTo.data.scene_name || getItemName(similarTo)) : getItemName(similarTo)}
            <button onClick={() => setSimilarTo(null)} className="ml-1.5 hover:text-primary/70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Category filter bar + grid (tight grouping) */}
      <div className="space-y-3">
        {!similarTo && (
          <div className="space-y-2.5">
            <DiscoverCategoryBar
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              savedCount={savedCount}
            />
            {selectedCategory !== 'all' && selectedCategory !== 'saved' && isMultiSubFamily(selectedCategory) && (
              <DiscoverSubCategoryBar
                familyLabel={CATEGORIES.find((c) => c.id === selectedCategory)?.label ?? ''}
                subcategories={getDiscoverSubtypes(selectedCategory).map((s) => ({ id: s.slug, label: s.label }))}
                selectedSubcategory={selectedSubcategory}
                onSelectSubcategory={setSelectedSubcategory}
              />
            )}
          </div>
        )}

      {/* Masonry grid */}
      {isLoading ? (
        <DiscoverLoadingState />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Compass className="w-10 h-10 text-muted-foreground/30 mb-3" />
          {selectedCategory !== 'all' && selectedCategory !== 'saved' && selectedSubcategory !== '__all__' ? (
            <>
              <p className="text-sm font-medium text-muted-foreground mb-1">No items tagged for this sub-family yet</p>
              <p className="text-xs text-muted-foreground/70 max-w-xs">
                {isAdmin
                  ? 'Tag items individually in the admin drawer to surface them here.'
                  : 'Check back soon — new items are added regularly.'}{' '}
                <button
                  onClick={() => setSelectedSubcategory('__all__')}
                  className="text-primary hover:underline"
                >
                  View all
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground mb-1">No results found</p>
              <p className="text-xs text-muted-foreground/70 max-w-xs">
                Try a different category or{' '}
                <button
                  onClick={() => { setSelectedCategory('all'); setSimilarTo(null); }}
                  className="text-primary hover:underline"
                >
                  browse all
                </button>
              </p>
            </>
          )}
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
                        onRecreate={() => handleUseItem(item)}
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
      </div>

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
        onSelectRelated={(item) => { navigate(getItemUrl(item), { replace: true }); setSelectedItem(item); }}
        isSaved={selectedItem ? isSaved(selectedItem.type, getItemId(selectedItem)) : false}
        onToggleSave={selectedItem ? () => handleToggleSave(selectedItem) : undefined}
        viewCount={viewCount ?? undefined}
        isAdmin={isAdmin}
        isFeatured={selectedItem ? isFeatured(selectedItem.type, getItemId(selectedItem)) : false}
        onToggleFeatured={selectedItem ? () => handleToggleFeatured(selectedItem) : undefined}
        onDelete={selectedItem && isAdmin ? async () => {
          if (selectedItem.type === 'preset') {
            const presetTitle = (selectedItem.data as any).title;
            const { error } = await supabase.from('discover_presets').delete().eq('id', selectedItem.data.id);
            if (error) { toast.error('Failed to delete'); return; }
            // Also remove matching custom_scene by name
            if (presetTitle) {
              await supabase.from('custom_scenes').delete().eq('name', presetTitle);
            }
            toast.success('Deleted from Discover');
            queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
            queryClient.invalidateQueries({ queryKey: ['custom-scenes'] });
          } else {
            const poseId = (selectedItem.data as any).poseId ?? '';
            const sceneName = (selectedItem.data as any).name;
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
            // Also remove matching discover_preset by title
            if (sceneName) {
              await supabase.from('discover_presets').delete().eq('title', sceneName);
            }
            toast.success('Scene deleted');
            queryClient.invalidateQueries({ queryKey: ['custom-scenes'] });
            queryClient.invalidateQueries({ queryKey: ['discover-presets'] });
          }
          setSelectedItem(null);
        } : undefined}
      />
    </PageHeader>
  );
}
