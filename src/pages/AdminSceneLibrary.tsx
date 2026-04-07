import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useSceneRecipes, usePromptOutputs } from '@/hooks/useSceneRecipes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Copy, Archive, Sparkles, Loader2, Grid, List } from 'lucide-react';
import { TREND_CATEGORIES } from '@/components/app/trend-watch/constants';
import { format } from 'date-fns';

export default function AdminSceneLibrary() {
  const { isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { recipes, isLoading, updateRecipe, duplicateRecipe, generatePrompts } = useSceneRecipes();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return (recipes || []).filter((r: any) => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return r.name?.toLowerCase().includes(s) || r.aesthetic_family?.toLowerCase().includes(s) || r.tags?.some((t: string) => t.toLowerCase().includes(s));
      }
      return true;
    });
  }, [recipes, search, categoryFilter, statusFilter]);

  if (adminLoading) return <div className="p-8"><Skeleton className="h-8 w-48" /></div>;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      archived: 'bg-muted text-muted-foreground',
    };
    return map[status] || map.draft;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Scene Library</h1>
        <p className="text-sm text-muted-foreground">Manage reusable scene recipes and prompt outputs</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scenes…" className="pl-9 h-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TREND_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button size="icon" variant={viewMode === 'grid' ? 'default' : 'ghost'} className="h-9 w-9" onClick={() => setViewMode('grid')}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button size="icon" variant={viewMode === 'list' ? 'default' : 'ghost'} className="h-9 w-9" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No scene recipes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Analyze posts in Trend Watch to create scene recipes</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe: any) => (
            <div
              key={recipe.id}
              className="rounded-xl border bg-card p-4 space-y-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setSelectedRecipe(recipe); setEditDrawerOpen(true); }}
            >
              {recipe.preview_image_url && (
                <img src={recipe.preview_image_url} alt="" className="w-full h-32 object-cover rounded-lg" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{recipe.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusBadge(recipe.status)}`}>{recipe.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{recipe.category}{recipe.aesthetic_family ? ` · ${recipe.aesthetic_family}` : ''}</p>
                {recipe.short_description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recipe.short_description}</p>}
              </div>
              {recipe.tags?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {recipe.tags.slice(0, 4).map((t: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => { e.stopPropagation(); duplicateRecipe.mutate(recipe.id); }}>
                  <Copy className="w-3 h-3 mr-1" /> Duplicate
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => {
                  e.stopPropagation();
                  updateRecipe.mutate({ id: recipe.id, status: recipe.status === 'archived' ? 'draft' : 'archived' });
                }}>
                  <Archive className="w-3 h-3 mr-1" /> {recipe.status === 'archived' ? 'Restore' : 'Archive'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((recipe: any) => (
            <div
              key={recipe.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => { setSelectedRecipe(recipe); setEditDrawerOpen(true); }}
            >
              {recipe.preview_image_url && (
                <img src={recipe.preview_image_url} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{recipe.name}</span>
                <p className="text-xs text-muted-foreground">{recipe.category} · {recipe.aesthetic_family || 'No family'}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${statusBadge(recipe.status)}`}>{recipe.status}</Badge>
              <span className="text-xs text-muted-foreground">{format(new Date(recipe.created_at), 'MMM d')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Edit Drawer */}
      <SceneEditDrawer
        recipe={selectedRecipe}
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        onUpdate={(updates) => { updateRecipe.mutate({ id: selectedRecipe?.id, ...updates }); }}
        onGeneratePrompts={(id) => generatePrompts.mutate({ sceneRecipeId: id })}
        isGenerating={generatePrompts.isPending}
      />
    </div>
  );
}

function SceneEditDrawer({ recipe, open, onOpenChange, onUpdate, onGeneratePrompts, isGenerating }: {
  recipe: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: any) => void;
  onGeneratePrompts: (id: string) => void;
  isGenerating: boolean;
}) {
  const { data: promptOutput } = usePromptOutputs(recipe?.id);
  const [edits, setEdits] = useState<Record<string, any>>({});

  const getValue = (field: string) => edits[field] ?? recipe?.[field] ?? '';

  const handleSave = () => {
    onUpdate(edits);
    setEdits({});
  };

  if (!recipe) return null;

  const TEXT_FIELDS = [
    'name', 'category', 'subcategory', 'aesthetic_family', 'scene_type',
    'short_description', 'scene_goal', 'lighting', 'background',
    'composition', 'crop', 'camera_feel', 'mood', 'styling_tone',
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Edit Scene Recipe</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {recipe.preview_image_url && (
            <img src={recipe.preview_image_url} alt="" className="w-full h-40 object-cover rounded-lg" />
          )}

          {TEXT_FIELDS.map(field => (
            <div key={field}>
              <Label className="text-xs capitalize">{field.replace(/_/g, ' ')}</Label>
              {field === 'short_description' || field === 'scene_goal' ? (
                <Textarea
                  value={getValue(field)}
                  onChange={e => setEdits(prev => ({ ...prev, [field]: e.target.value }))}
                  className="text-xs"
                  rows={2}
                />
              ) : (
                <Input
                  value={getValue(field)}
                  onChange={e => setEdits(prev => ({ ...prev, [field]: e.target.value }))}
                  className="h-8 text-xs"
                />
              )}
            </div>
          ))}

          <div>
            <Label className="text-xs">Status</Label>
            <Select value={getValue('status')} onValueChange={v => setEdits(prev => ({ ...prev, status: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" onClick={handleSave}>Save Changes</Button>

          <Separator />

          {/* Prompt Outputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Prompt Outputs</h4>
              <Button size="sm" variant="outline" onClick={() => onGeneratePrompts(recipe.id)} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
                Generate Prompts
              </Button>
            </div>
            {promptOutput ? (
              <div className="space-y-2">
                {['master_scene_prompt', 'environment_prompt', 'lighting_prompt', 'composition_prompt', 'styling_prompt', 'negative_prompt', 'consistency_prompt'].map(field => (
                  <div key={field}>
                    <Label className="text-[10px] capitalize text-muted-foreground">{field.replace(/_/g, ' ')}</Label>
                    <p className="text-xs bg-muted p-2 rounded whitespace-pre-wrap">{promptOutput[field] || '—'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No prompts generated yet</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
