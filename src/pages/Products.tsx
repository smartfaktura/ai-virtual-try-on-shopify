import { useState, useMemo } from 'react';
import { Ruler } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, Trash2, Pencil, Search, LayoutGrid, List, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { AddProductModal } from '@/components/app/AddProductModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TEAM_MEMBERS } from '@/data/teamData';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UserProduct | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

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

  return (
    <PageHeader
      title="Products"
      subtitle="Manage your product library. Upload products here and use them across workflows."
    >
      <div className="space-y-4">
        {/* Top bar */}
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
            <Button onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filter bar */}
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

        {/* Products */}
        {isLoading ? (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
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
                description={isFiltered ? 'Try a different search term or clear filters.' : 'Upload your first product to start generating professional visuals.'}
                action={!isFiltered ? { content: 'Add Product', onAction: () => setModalOpen(true) } : undefined}
                icon={isFiltered ? <Package className="w-10 h-10 text-muted-foreground" /> : undefined}
                teamMember={!isFiltered && sophia ? { name: sophia.name, role: sophia.role, avatar: sophia.avatar, quote: "Upload your first product and I'll handle the rest — studio-quality shots, every angle." } : undefined}
              />
            );
          })()
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(product => {
              const imgCount = imageCounts[product.id] || 0;
              return (
                <Card key={product.id} className="group overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    <img
                      src={product.image_url}
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
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => { setEditingProduct(product); setModalOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteMutation.mutate(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3 space-y-1">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {product.product_type && (
                        <Badge variant="secondary" className="text-[10px]">{product.product_type}</Badge>
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
                      src={product.image_url}
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
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingProduct(product); setModalOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(product.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddProductModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingProduct(null); }}
        onProductAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['user-products'] });
          queryClient.invalidateQueries({ queryKey: ['product-image-counts'] });
        }}
        editingProduct={editingProduct}
      />
    </PageHeader>
  );
}
