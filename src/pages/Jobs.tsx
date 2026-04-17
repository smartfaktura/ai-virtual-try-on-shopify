import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/app/PageHeader';
import { buildLibraryFileName } from '@/lib/downloadFileName';
import { useNavigate } from 'react-router-dom';
import { Search, Image, ImagePlus, Loader2, Download, CheckSquare, X, Sparkles, RefreshCw, Maximize, LayoutGrid, Layers, SlidersHorizontal, Trash2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LibraryImageCard, type LibraryItem } from '@/components/app/LibraryImageCard';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { TEAM_MEMBERS } from '@/data/teamData';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLibraryItems, type LibrarySortBy, type LibrarySourceFilter } from '@/hooks/useLibraryItems';
import { useGenerationQueue } from '@/hooks/useGenerationQueue';
import { useAuth } from '@/contexts/AuthContext';
import { useLibraryFavorites } from '@/hooks/useLibraryFavorites';
import { useLibraryAssetStatus, type AssetStatus } from '@/hooks/useLibraryAssetStatus';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { FeedbackBanner } from '@/components/app/FeedbackBanner';
import { toast } from '@/lib/brandedToast';
import JSZip from 'jszip';
import { UpscaleModal } from '@/components/app/UpscaleModal';
import type { UpscaleItem } from '@/hooks/useUpscaleImages';

const SORTS: { id: LibrarySortBy; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
];

const SOURCE_FILTERS: { id: LibrarySourceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'freestyle', label: 'Freestyle' },
  { id: 'workflow', label: 'Workflow' },
];

type SmartView = 'all' | 'favorites' | 'brand_ready' | 'ready_to_publish';

const SMART_VIEWS: { id: SmartView; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'brand_ready', label: 'Brand Ready' },
  { id: 'ready_to_publish', label: 'Ready to Publish' },
];

type DeviceType = 'mobile' | 'tablet' | 'desktop';

function getDeviceType(w: number): DeviceType {
  if (w < 768) return 'mobile';
  if (w < 1280) return 'tablet';
  return 'desktop';
}

const COLUMN_OPTIONS: Record<DeviceType, number[]> = {
  mobile: [1, 2],
  tablet: [2, 3, 4],
  desktop: [3, 4, 5],
};

const COLUMN_DEFAULTS: Record<DeviceType, number> = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
};

function useColumnCount() {
  const [device, setDevice] = useState<DeviceType>(() => getDeviceType(window.innerWidth));
  const [userPref, setUserPref] = useState<number | null>(() => {
    const stored = localStorage.getItem('library-columns');
    return stored ? parseInt(stored, 10) : null;
  });

  useEffect(() => {
    const update = () => setDevice(getDeviceType(window.innerWidth));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const options = COLUMN_OPTIONS[device];
  const count = userPref && options.includes(userPref) ? userPref : COLUMN_DEFAULTS[device];

  const setColumns = (n: number) => {
    setUserPref(n);
    localStorage.setItem('library-columns', String(n));
  };

  return { count, options, setColumns };
}

export default function Jobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<LibrarySortBy>('newest');
  const [sourceFilter, setSourceFilter] = useState<LibrarySourceFilter>('all');
  const [smartView, setSmartView] = useState<SmartView>('all');
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isZipping, setIsZipping] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LibraryItem | null>(null);
  const [upscaleModalOpen, setUpscaleModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  const { favoriteIds, toggleFavorite, bulkFavorite } = useLibraryFavorites();
  const { getStatus, setStatus, setStatusMany } = useLibraryAssetStatus();

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useLibraryItems(sortBy, searchQuery, sourceFilter);
  const allItems = data?.pages.flatMap(p => p.items) ?? [];

  // Apply smart view filter client-side
  const items = useMemo(() => {
    if (smartView === 'all') return allItems;
    if (smartView === 'favorites') return allItems.filter(i => favoriteIds.has(i.id));
    if (smartView === 'brand_ready') return allItems.filter(i => getStatus(i.id) === 'brand_ready');
    if (smartView === 'ready_to_publish') return allItems.filter(i => getStatus(i.id) === 'ready_to_publish');
    return allItems;
  }, [allItems, smartView, favoriteIds, getStatus]);

  const { lastCompletedAt } = useGenerationQueue();
  const { count: columnCount, options: columnOptions, setColumns } = useColumnCount();

  // Track which images are currently being upscaled
  const { data: upscalingSourceIds = new Set<string>() } = useQuery({
    queryKey: ['upscaling-jobs', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data } = await supabase
        .from('generation_queue')
        .select('payload')
        .eq('user_id', user.id)
        .eq('job_type', 'upscale')
        .in('status', ['queued', 'processing']);
      if (!data || data.length === 0) return new Set<string>();
      const ids = new Set<string>();
      for (const row of data) {
        const payload = row.payload as Record<string, unknown> | null;
        const sourceId = payload?.sourceId as string | undefined;
        if (sourceId) ids.add(sourceId);
      }
      return ids;
    },
    enabled: !!user?.id,
    refetchInterval: 4000,
  });

  // Listen for library:focus-grid event from GlobalGenerationBar
  useEffect(() => {
    const handler = () => {
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ['library'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('library:focus-grid', handler);
    return () => window.removeEventListener('library:focus-grid', handler);
  }, [queryClient]);

  const [showIncomingBanner, setShowIncomingBanner] = useState(false);

  useEffect(() => {
    if (!lastCompletedAt) return;
    const elapsed = Date.now() - new Date(lastCompletedAt).getTime();
    if (elapsed < 30_000) {
      setShowIncomingBanner(true);
      const timer = setTimeout(() => setShowIncomingBanner(false), 30_000 - elapsed);
      return () => clearTimeout(timer);
    }
  }, [lastCompletedAt]);

  const columns: typeof items[] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => {
    columns[i % columnCount].push(item);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDownload = async () => {
    setIsZipping(true);
    const selected = items.filter(i => selectedIds.has(i.id));
    const total = selected.length;
    let succeeded = 0;
    let failed = 0;

    toast.info(`Preparing ${total} images…`);

    try {
      const zip = new JSZip();
      const proxyBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-proxy`;

      for (let idx = 0; idx < total; idx++) {
        const item = selected[idx];
        try {
          const proxyUrl = `${proxyBase}?url=${encodeURIComponent(item.imageUrl)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) { failed++; continue; }
          const contentType = res.headers.get('content-type') || '';
          let ext = '.png';
          if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';
          else if (contentType.includes('webp')) ext = '.webp';
          const blob = await res.blob();
          zip.file(`${buildLibraryFileName(item)}${ext}`, blob);
          succeeded++;
        } catch {
          failed++;
        }
      }

      if (succeeded === 0) {
        toast.error('All downloads failed — please try again');
        return;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'library-images.zip';
      a.click();
      URL.revokeObjectURL(url);

      if (failed > 0) {
        toast.warning(`Downloaded ${succeeded}/${total} images (${failed} failed)`);
      } else {
        toast.success(`Downloaded ${succeeded} images`);
      }
    } catch (err) {
      toast.error('Download failed — please try again');
    } finally {
      setIsZipping(false);
    }
  };

  const cancelSelect = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let deleted = 0;
    try {
      for (const id of Array.from(selectedIds)) {
        const item = allItems.find(i => i.id === id);
        if (!item) continue;
        try {
          if (item.source === 'freestyle') {
            const { error } = await supabase.from('freestyle_generations').delete().eq('id', item.id);
            if (error) throw error;
          } else {
            const dashIndex = item.id.lastIndexOf('-');
            const jobId = item.id.substring(0, dashIndex);
            const imageIndex = parseInt(item.id.substring(dashIndex + 1), 10);
            const { data: job } = await supabase
              .from('generation_jobs')
              .select('results')
              .eq('id', jobId)
              .maybeSingle();
            if (job) {
              const results = job.results as any[];
              if (results.length <= 1) {
                const { error } = await supabase.from('generation_jobs').delete().eq('id', jobId);
                if (error) throw error;
              } else {
                const updated = results.filter((_, i) => i !== imageIndex);
                const { error } = await supabase.from('generation_jobs').update({ results: updated }).eq('id', jobId);
                if (error) throw error;
              }
            }
          }
          deleted++;
        } catch (err) {
          console.error(`[Library] Failed to delete ${id}:`, err);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['library'] });
      setSelectedIds(new Set());
      setSelectMode(false);
      toast.success(`${deleted} image${deleted !== 1 ? 's' : ''} deleted`);
    } catch (err) {
      console.error('[Library] Bulk delete failed:', err);
      toast.error('Failed to delete images');
    } finally {
      setBulkDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  const handleDeleteItem = useCallback((item: LibraryItem) => {
    setDeleteTarget(item);
  }, []);

  const confirmDelete = async () => {
    const item = deleteTarget;
    if (!item) return;
    try {
      if (item.source === 'freestyle') {
        const { error } = await supabase.from('freestyle_generations').delete().eq('id', item.id);
        if (error) throw error;
      } else {
        const dashIndex = item.id.lastIndexOf('-');
        const jobId = item.id.substring(0, dashIndex);
        const imageIndex = parseInt(item.id.substring(dashIndex + 1), 10);
        const { data: job } = await supabase
          .from('generation_jobs')
          .select('results')
          .eq('id', jobId)
          .maybeSingle();
        if (job) {
          const results = job.results as any[];
          if (results.length <= 1) {
            const { error } = await supabase.from('generation_jobs').delete().eq('id', jobId);
            if (error) throw error;
          } else {
            const updated = results.filter((_, i) => i !== imageIndex);
            const { error } = await supabase.from('generation_jobs').update({ results: updated }).eq('id', jobId);
            if (error) throw error;
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Image deleted');
    } catch (err) {
      console.error('[Library] Delete failed:', err);
      toast.error('Failed to delete image');
    } finally {
      setDeleteTarget(null);
    }
  };

  const activeFilterCount = (sourceFilter !== 'all' ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);
  // True only on initial fetch with no data yet — drives skeleton vs. content/empty-state decision
  const isInitialLoading = (isLoading || isFetching) && allItems.length === 0;
  const isTrulyEmpty = !isInitialLoading && allItems.length === 0 && !searchQuery && activeFilterCount === 0 && smartView === 'all';

  return (
    <PageHeader
      title="Library"
      subtitle="All your generated visuals, in one place."
    >

        {/* Smart Views */}
        {!isTrulyEmpty && !isInitialLoading && (
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide">
          {SMART_VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setSmartView(v.id)}
              className={cn(
                'px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                smartView === v.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        )}

        {/* Incoming images banner */}
        {showIncomingBanner && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/30 border border-border/50">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">
              Your latest images are being processed and will appear here shortly.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => { setShowIncomingBanner(false); queryClient.invalidateQueries({ queryKey: ['library'] }); }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        )}

        {/* Search + Filters + Columns + Select */}
        {!isTrulyEmpty && !isInitialLoading && (
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="relative w-full sm:max-w-lg sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-muted/30 border-0 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Filter popover */}
            <div className="relative group">
              <button
                onClick={() => setFilterOpen(o => !o)}
                className={cn(
                  'px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
                  activeFilterCount > 0
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                  <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-50 w-56 rounded-2xl bg-popover border border-border shadow-xl p-4 space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Type</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SOURCE_FILTERS.map(f => (
                          <button
                            key={f.id}
                            onClick={() => setSourceFilter(f.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                              sourceFilter === f.id
                                ? 'bg-foreground text-background shadow-sm'
                                : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                            )}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sort</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SORTS.map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSortBy(s.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                              sortBy === s.id
                                ? 'bg-foreground text-background shadow-sm'
                                : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                            )}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-5 bg-border/50 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground mr-0.5" />
              {columnOptions.map(n => (
                <button
                  key={n}
                  onClick={() => setColumns(n)}
                  className={cn(
                    'w-7 h-7 rounded-full text-xs font-medium transition-all flex items-center justify-center',
                    columnCount === n
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-border/50 mx-1 hidden sm:block" />

            <button
              onClick={() => selectMode ? cancelSelect() : setSelectMode(true)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
                selectMode
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Select
            </button>
          </div>
        </div>
        )}

        {/* Content */}
        {isInitialLoading ? (
          <LibrarySkeletonGrid columnCount={columnCount} />
        ) : items.length === 0 ? (
          (() => {
            if (smartView !== 'all' && allItems.length > 0) {
              const emptyLabel = smartView === 'favorites' ? 'No favorites yet' : smartView === 'brand_ready' ? 'No brand-ready assets' : 'No publish-ready assets';
              const emptyDesc = smartView === 'favorites'
                ? 'Hover over any image and tap the heart to save it here.'
                : 'Mark assets as ready using the hover actions or select mode.';
              return (
                <div className="py-8">
                  <EmptyStateCard
                    heading={emptyLabel}
                    description={emptyDesc}
                    icon={<Heart className="w-7 h-7 text-muted-foreground" />}
                    action={{ content: 'View All', onAction: () => setSmartView('all') }}
                  />
                </div>
              );
            }
            return (
              <div className="py-8">
                {!searchQuery ? (
                  <EmptyStateCard
                    heading="Your library is empty"
                    description="Generated visuals land here, ready to review, favorite, and publish."
                    icon={<ImagePlus className="w-8 h-8 text-muted-foreground" />}
                    actions={[
                      { content: 'Open Visual Studio', onAction: () => navigate('/app/workflows'), variant: 'default', icon: <Sparkles className="w-4 h-4" /> },
                      { content: 'Try Freestyle', onAction: () => navigate('/app/freestyle'), variant: 'outline' },
                    ]}
                  />
                ) : (
                  <EmptyStateCard
                    heading="No results found"
                    description="No results match your search."
                    action={{ content: 'Clear search', onAction: () => setSearchQuery('') }}
                    icon={<Image className="w-7 h-7 text-muted-foreground" />}
                  />
                )}
              </div>
            );
          })()
        ) : (
          <>
            <div className="relative">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 z-10 flex items-start justify-center pointer-events-none">
                  <div className="sticky top-[40vh]">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {columns.map((col, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-2">
                    {col.map(item => (
                      <LibraryImageCard
                        key={item.id}
                        item={item}
                        selectMode={selectMode}
                        selected={selectedIds.has(item.id)}
                        isUpscaling={upscalingSourceIds.has(item.id)}
                        isAdmin={isAdmin}
                        isFavorited={favoriteIds.has(item.id)}
                        assetStatus={getStatus(item.id)}
                        onToggleFavorite={(e) => {
                          e.stopPropagation();
                          toggleFavorite.mutate(item.id);
                        }}
                        onSetStatus={(status) => {
                          setStatus.mutate({ imageId: item.id, status });
                          toast.success(status === 'brand_ready' ? 'Marked as Brand Ready' : 'Marked as Ready to Publish');
                        }}
                        onClick={() => {
                          if (selectMode) {
                            toggleSelect(item.id);
                          } else {
                            setSelectedItem(item);
                          }
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {hasNextPage && (
              <div className="flex justify-center pt-6 pb-2">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-full px-6"
                >
                  {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}

      {/* Floating action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background shadow-2xl">
          <span className="text-sm font-medium mr-1">{selectedIds.size} selected</span>

          <Button
            size="sm"
            variant="secondary"
            className="text-xs"
            onClick={() => {
              bulkFavorite.mutate(Array.from(selectedIds));
              toast.success('Added to favorites');
            }}
          >
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            Favorite
          </Button>


          <div className="w-px h-5 bg-background/20 mx-1" />

          <Button
            size="sm"
            onClick={() => {
              const nonUpscaled = allItems.filter(i => selectedIds.has(i.id) && !i.quality?.startsWith('upscaled_') && i.quality !== 'upscaled');
              if (nonUpscaled.length === 0) {
                toast.info('All selected images are already upscaled');
                return;
              }
              if (nonUpscaled.length > 10) {
                toast.error('Maximum 10 images per upscale batch');
                return;
              }
              setUpscaleModalOpen(true);
            }}
            variant="secondary"
            className="text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Enhance
          </Button>

          <Button
            size="sm"
            onClick={handleBulkDownload}
            disabled={isZipping}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
          >
            {isZipping ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
            Download
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="text-xs"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </Button>

          <button onClick={cancelSelect} className="ml-1 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <UpscaleModal
        open={upscaleModalOpen}
        onClose={() => setUpscaleModalOpen(false)}
        items={allItems
          .filter(i => selectedIds.has(i.id) && !i.quality?.startsWith('upscaled_') && i.quality !== 'upscaled')
          .map(i => ({
            imageUrl: i.imageUrl,
            sourceType: i.source as 'freestyle' | 'generation',
            sourceId: i.id,
          }))}
        onComplete={() => {
          cancelSelect();
          queryClient.invalidateQueries({ queryKey: ['library'] });
        }}
      />

      <LibraryDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        isUpscaling={selectedItem ? upscalingSourceIds.has(selectedItem.id) : false}
        items={items}
        initialIndex={selectedItem ? items.findIndex(i => i.id === selectedItem.id) : 0}
      />

      {allItems.length > 0 && <FeedbackBanner />}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this image?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The image will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} image{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. {selectedIds.size} image{selectedIds.size !== 1 ? 's' : ''} will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {bulkDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageHeader>
  );
}
