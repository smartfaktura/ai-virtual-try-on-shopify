import { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useWatchAccounts, useAllWatchPosts } from '@/hooks/useWatchAccounts';
import { useSceneRecipes } from '@/hooks/useSceneRecipes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Plus, Library, Search } from 'lucide-react';
import { TREND_CATEGORIES } from '@/components/app/trend-watch/constants';
import { WatchAccountCard } from '@/components/app/trend-watch/WatchAccountCard';
import { AddAccountModal } from '@/components/app/trend-watch/AddAccountModal';
import { PostDetailDrawer } from '@/components/app/trend-watch/PostDetailDrawer';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminTrendWatch() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { accounts, isLoading, addAccount, updateAccount, syncAccount } = useWatchAccounts();
  const { createRecipe } = useSceneRecipes();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(TREND_CATEGORIES));

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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
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
        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Account
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
                          onEdit={() => {}}
                          onDeactivate={handleDeactivate}
                          onPostClick={(post) => { setSelectedPost(post); setDrawerOpen(true); }}
                          isSyncing={syncingId === account.id}
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

      <AddAccountModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdd={(a) => addAccount.mutate(a)}
        isLoading={addAccount.isPending}
      />

      <PostDetailDrawer
        post={selectedPost}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreateScene={handleCreateScene}
      />
    </div>
  );
}
