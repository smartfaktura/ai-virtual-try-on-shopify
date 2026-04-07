import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useWatchAccounts, useAllWatchPosts } from '@/hooks/useWatchAccounts';
import { useSceneRecipes } from '@/hooks/useSceneRecipes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Plus, Library, Search, RefreshCw, ImagePlus } from 'lucide-react';
import { TREND_CATEGORIES } from '@/components/app/trend-watch/constants';
import { WatchAccountCard } from '@/components/app/trend-watch/WatchAccountCard';
import { AddAccountModal } from '@/components/app/trend-watch/AddAccountModal';
import { AddImageDraftModal } from '@/components/app/trend-watch/AddImageDraftModal';
import { PostDetailDrawer } from '@/components/app/trend-watch/PostDetailDrawer';
import { DraftScenesPanel } from '@/components/app/trend-watch/DraftScenesPanel';
import { ReadyScenesPanel } from '@/components/app/trend-watch/ReadyScenesPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminTrendWatch() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { accounts, isLoading, addAccount, updateAccount, syncAccount, loadMorePosts } = useWatchAccounts();
  const { recipes, createRecipe } = useSceneRecipes();

  const draftCount = useMemo(() => recipes.filter((r: any) => r.status === 'draft').length, [recipes]);
  const readyCount = useMemo(() => recipes.filter((r: any) => r.status === 'ready').length, [recipes]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [pastedFile, setPastedFile] = useState<File | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [loadingMoreId, setLoadingMoreId] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(TREND_CATEGORIES));
  const [activeTab, setActiveTab] = useState('feed');

  // Global paste handler for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setPastedFile(file);
            setImageModalOpen(true);
            toast.info('Image pasted — ready to analyze');
            return;
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const activeAccounts = useMemo(() => {
    return (accounts || []).filter((a: any) => {
      if (!a.is_active) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return a.display_name?.toLowerCase().includes(s) || a.username?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [accounts, search, categoryFilter]);

  const accountIds = useMemo(() => activeAccounts.map((a: any) => a.id), [activeAccounts]);
  const { data: postsGrouped = {} } = useAllWatchPosts(accountIds);

  const categorized = useMemo(() => {
    const map: Record<string, any[]> = {};
    TREND_CATEGORIES.forEach(c => { map[c] = []; });
    activeAccounts.forEach((a: any) => {
      if (map[a.category]) map[a.category].push(a);
    });
    return map;
  }, [activeAccounts]);

  const handleSync = async (id: string, username: string) => {
    setSyncingId(id);
    try {
      await syncAccount.mutateAsync({ id, username });
    } finally {
      setSyncingId(null);
    }
  };

  const handleLoadMore = async (id: string, username: string) => {
    setLoadingMoreId(id);
    try {
      await loadMorePosts.mutateAsync({ id, username });
    } finally {
      setLoadingMoreId(null);
    }
  };

  const handleRefreshAll = async () => {
    const STALE_MS = 6 * 60 * 60 * 1000; // 6 hours
    const now = Date.now();
    const active = (accounts || []).filter((a: any) => a.is_active);
    if (active.length === 0) return;

    const stale = active.filter((a: any) => {
      if (!a.last_synced_at || a.sync_status === 'failed') return true;
      return now - new Date(a.last_synced_at).getTime() > STALE_MS;
    });

    if (stale.length === 0) {
      toast.info(`All ${active.length} accounts were synced in the last 6 hours — skipping`);
      return;
    }

    setRefreshingAll(true);
    for (const a of stale) {
      setSyncingId(a.id);
      try { await syncAccount.mutateAsync({ id: a.id, username: a.username }); } catch {}
    }
    setSyncingId(null);
    setRefreshingAll(false);

    const skipped = active.length - stale.length;
    if (skipped > 0) {
      toast.success(`Refreshed ${stale.length} accounts, skipped ${skipped} (recently synced)`);
    }
  };

  const handleDeactivate = (id: string) => {
    const account = accounts.find((a: any) => a.id === id);
    updateAccount.mutate({ id, is_active: !account?.is_active });
  };

  const handleCreateScene = (analysis: any, post: any) => {
    createRecipe.mutate({
      name: analysis.recommended_scene_name || 'New Scene',
      category: analysis.category || '',
      subcategory: analysis.subcategory || '',
      aesthetic_family: analysis.recommended_aesthetic_family || '',
      scene_type: analysis.scene_type || '',
      palette: analysis.palette || [],
      lighting: analysis.lighting_type || '',
      background: analysis.background_type || '',
      composition: analysis.composition_logic || '',
      crop: analysis.crop_type || '',
      camera_feel: analysis.camera_angle || '',
      props: analysis.props || [],
      mood: analysis.mood || '',
      styling_tone: analysis.styling_tone || '',
      premium_cues: analysis.premium_cues || [],
      avoid_terms: analysis.avoid_terms || [],
      source_type: 'instagram',
      source_reference_analysis_id: analysis.id,
      source_watch_post_id: post.id,
      preview_image_url: post.media_url || post.thumbnail_url,
      short_description: analysis.short_summary || '',
    });
    setDrawerOpen(false);
    setActiveTab('drafts');
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (adminLoading) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">VOVV Trend Watch + Scene Builder</h1>
        <p className="text-sm text-muted-foreground">Track visual direction and turn reference posts into reusable scene recipes</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="feed">Accounts Feed</TabsTrigger>
          <TabsTrigger value="drafts">Draft Scenes</TabsTrigger>
          <TabsTrigger value="ready">Ready Scenes</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search accounts…"
                className="pl-9 h-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TREND_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => { setEditingAccount(null); setAddModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Account
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setPastedFile(null); setImageModalOpen(true); }}>
              <ImagePlus className="w-4 h-4 mr-1" /> Add Image
            </Button>
            <Button size="sm" variant="outline" onClick={handleRefreshAll} disabled={refreshingAll} title="Syncs accounts not refreshed in the last 6 hours">
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshingAll ? 'animate-spin' : ''}`} /> Refresh All
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/admin/scene-library')}>
              <Library className="w-4 h-4 mr-1" /> Scene Library
            </Button>
          </div>

          {/* Category Sections */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {TREND_CATEGORIES.filter(cat => categoryFilter === 'all' || cat === categoryFilter).map(cat => {
                const catAccounts = categorized[cat] || [];
                if (catAccounts.length === 0 && categoryFilter === 'all') return null;
                return (
                  <Collapsible key={cat} open={openCategories.has(cat)} onOpenChange={() => toggleCategory(cat)}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-2 px-1 hover:bg-muted/50 rounded-lg transition-colors">
                      <ChevronDown className={`w-4 h-4 transition-transform ${openCategories.has(cat) ? '' : '-rotate-90'}`} />
                      <span className="font-medium text-sm">{cat}</span>
                      <span className="text-xs text-muted-foreground ml-1">({catAccounts.length})</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {catAccounts.length === 0 ? (
                        <div className="ml-6 py-4 text-xs text-muted-foreground">No accounts in this category yet</div>
                      ) : (
                        <div className="ml-2 space-y-2 mt-1">
                          {catAccounts.map((account: any) => (
                            <WatchAccountCard
                              key={account.id}
                              account={account}
                              posts={(postsGrouped as Record<string, any[]>)[account.id] || []}
                              onSync={handleSync}
                              onEdit={(account: any) => { setEditingAccount(account); setAddModalOpen(true); }}
                              onDeactivate={handleDeactivate}
                              onPostClick={(post) => { setSelectedPost(post); setDrawerOpen(true); }}
                              isSyncing={syncingId === account.id}
                              onLoadMore={handleLoadMore}
                              isLoadingMore={loadingMoreId === account.id}
                            />
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts">
          <div className="flex justify-end mb-4">
            <Button size="sm" variant="secondary" onClick={() => { setPastedFile(null); setImageModalOpen(true); }}>
              <ImagePlus className="w-4 h-4 mr-1" /> Add Image
            </Button>
          </div>
          <DraftScenesPanel />
        </TabsContent>

        <TabsContent value="ready">
          <ReadyScenesPanel />
        </TabsContent>
      </Tabs>

      <AddAccountModal
        open={addModalOpen}
        onOpenChange={(v) => { setAddModalOpen(v); if (!v) setEditingAccount(null); }}
        onAdd={(a) => addAccount.mutate(a)}
        onUpdate={(a) => { const { id, ...rest } = a; updateAccount.mutate({ id, ...rest }); }}
        editingAccount={editingAccount}
        isLoading={addAccount.isPending || updateAccount.isPending}
      />

      <PostDetailDrawer
        post={selectedPost}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreateScene={handleCreateScene}
      />

      <AddImageDraftModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        initialFile={pastedFile}
        onDraftCreated={() => setActiveTab('drafts')}
      />
    </div>
  );
}
