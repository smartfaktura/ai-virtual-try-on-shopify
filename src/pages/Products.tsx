import { useState, useMemo, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Ruler } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ImagePlus, Trash2, Pencil, Search, LayoutGrid, List, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { TEAM_MEMBERS } from '@/data/teamData';
import { trackViewContent } from '@/lib/fbPixel';
import { FeedbackBanner } from '@/components/app/FeedbackBanner';
import { gtagViewItem } from '@/lib/gtag';

interface UserProduct {
  id: string;
  user_id: string;
  title: string;
  description: string;
  product_type: string;
  image_url: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export default function Products() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => { trackViewContent('Products', 'product_library'); gtagViewItem('Products', 'product_library'); }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['user-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserProduct[];
    },
    enabled: !!user,
  });

  // Fetch image counts per product
  const { data: imageCounts = {} } = useQuery({
    queryKey: ['product-image-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('product_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((row: { product_id: string }) => {
        counts[row.product_id] = (counts[row.product_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-image-counts'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  // Unique product types for filter
  const productTypes = useMemo(() => {
    const types = new Set(products.map(p => p.product_type).filter(Boolean));
    return Array.from(types).sort();
  }, [products]);

  // Filter & sort
  const filtered = useMemo(() => {
    let result = products.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.product_type.toLowerCase().includes(search.toLowerCase())
    );

    if (typeFilter !== 'all') {
      result = result.filter(p => p.product_type === typeFilter);
    }

    switch (sortBy) {
      case 'oldest':
        result = [...result].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name-asc':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result = [...result].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
      default:
        result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [products, search, typeFilter, sortBy]);

  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0);
  const hasNoProducts = !isLoading && products.length === 0;
  const showToolbar = !hasNoProducts;

  return (
    <PageHeader
      title="Products"
      subtitle="Manage your products. Upload once and use them across Visual Types."
    >
      <div className="space-y-4">
        {/* Top bar — hidden when user has zero products */}
        {showToolbar && (
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-9 w-9 rounded-r-none', viewMode === 'grid' && 'bg-muted')}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-9 w-9 rounded-l-none', viewMode === 'list' && 'bg-muted')}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            {products.length > 0 && (
              <Button onClick={() => navigate('/app/products/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Products
              </Button>
            )}
          </div>
        </div>
        )}

        {/* Filter bar — hidden when user has zero products */}
        {showToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {productTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A–Z</SelectItem>
              <SelectItem value="name-desc">Name Z–A</SelectItem>
            </SelectContent>
          </Select>

          {/* Active filter badges */}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setTypeFilter('all')}>
              {typeFilter}
              <X className="w-3 h-3" />
            </Badge>
          )}

          {activeFilterCount > 0 && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { setTypeFilter('all'); setSortBy('newest'); }}
            >
              Clear filters
            </button>
          )}
        </div>
        )}

        {/* Products */}
        {isLoading ? (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
              : 'space-y-2'
          )}>
            {[1, 2, 3, 4, 5].map(i => (
              viewMode === 'grid' ? (
                <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
              ) : (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              )
            ))}
          </div>
        ) : filtered.length === 0 ? (
          (() => {
            const isFiltered = !!(search || typeFilter !== 'all');
            const sophia = TEAM_MEMBERS.find(m => m.name === 'Sophia');
            return (
              <EmptyStateCard
                heading={isFiltered ? 'No products match your filters' : 'No products yet'}
                description={isFiltered ? 'Try a different search term or clear filters.' : ''}
                action={!isFiltered ? { content: 'Add Products', onAction: () => navigate('/app/products/new') } : undefined}
                icon={
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <ImagePlus className="w-8 h-8 text-primary/60" />
                  </div>
                }
                teamMember={!isFiltered && sophia ? { name: sophia.name, role: sophia.role, avatar: sophia.avatar, quote: "Upload your first product to start creating studio-quality visuals." } : undefined}
              />
            );
          })()
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(product => {
              const imgCount = imageCounts[product.id] || 0;
              const displayType = product.product_type?.includes(':')
                ? product.product_type.split(':').pop()
                : product.product_type;
              return (
                <Card key={product.id} className="group overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    <img
                      src={getOptimizedUrl(product.image_url, { quality: 70 })}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Image count badge */}
                    {imgCount > 1 && (
                      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-foreground">{imgCount}</span>
                      </div>
                    )}
                    <div className={cn(
                      "absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center",
                      isMobile ? "opacity-100 bg-gradient-to-t from-black/60 via-transparent to-transparent items-end justify-end pb-2 pr-2" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <div className="flex gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => navigate(`/app/products/${product.id}/edit`)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => setDeleteTarget(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-1.5">
                    <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {displayType && (
                        <Badge variant="secondary" className="text-[10px] max-w-[120px] truncate">{displayType}</Badge>
                      )}
                      {(product as any).dimensions && (
                        <Badge variant="outline" className="text-[10px] gap-0.5">
                          <Ruler className="w-2.5 h-2.5" />
                          {(product as any).dimensions}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="border rounded-lg divide-y">
            {filtered.map(product => {
              const imgCount = imageCounts[product.id] || 0;
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={getOptimizedUrl(product.image_url, { quality: 70 })}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">{product.title}</p>
                    <div className="flex items-center gap-2">
                      {product.product_type && (
                        <Badge variant="secondary" className="text-[10px]">{product.product_type}</Badge>
                      )}
                      {product.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</span>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    {imgCount > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {imgCount} {imgCount === 1 ? 'photo' : 'photos'}
                      </span>
                    )}
                    {(product as any).dimensions && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {(product as any).dimensions}
                      </span>
                    )}
                    <span>{format(new Date(product.created_at), 'MMM d, yyyy')}</span>
                  </div>

                  {/* Actions */}
                  <div className={cn("flex items-center gap-1 transition-opacity shrink-0", isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/app/products/${product.id}/edit`)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(product.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <FeedbackBanner />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product and all its images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageHeader>
  );
}
