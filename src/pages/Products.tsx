import { useState, useMemo, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Ruler, UploadCloud } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil, Search, LayoutGrid, List, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/app/PageHeader';
import { EmptyStateCard } from '@/components/app/EmptyStateCard';
import { ProductsEmptyUpload, type EmptyUploadMethod } from '@/components/app/ProductsEmptyUpload';
import { AddProductModal, type AddProductTab } from '@/components/app/AddProductModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';
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

  // Add Product drawer state
  const [addOpen, setAddOpen] = useState(false);
  const [addInitialTab, setAddInitialTab] = useState<AddProductTab>('manual');
  const [addInitialFiles, setAddInitialFiles] = useState<File[] | undefined>(undefined);
  const [addCompact, setAddCompact] = useState(false);

  // Page-wide drag overlay
  const [pageDragActive, setPageDragActive] = useState(false);

  // Armed paste listening window (for "Paste image" empty-state action)
  const [pasteArmed, setPasteArmed] = useState(false);

  const openAddDrawer = (tab: AddProductTab = 'manual', files?: File[], compact = false) => {
    setAddInitialTab(tab);
    setAddInitialFiles(files);
    setAddCompact(compact);
    setAddOpen(true);
  };

  useEffect(() => { trackViewContent('Products', 'product_library'); gtagViewItem('Products', 'product_library'); }, []);

  // Window-level drag-and-drop: open drawer with files when user drops anywhere on the page
  useEffect(() => {
    let dragDepth = 0;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types || []).includes('Files');

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth++;
      setPageDragActive(true);
    };
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
    };
    const onDragLeave = () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) setPageDragActive(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth = 0;
      setPageDragActive(false);
      const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
      if (files.length) {
        setAddInitialTab('manual');
        setAddInitialFiles(files);
        setAddOpen(true);
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  // Window-level paste handler: capture image blobs from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      // Only act when target is not an editable element
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      const isEditable = tag === 'input' || tag === 'textarea' || (t && t.isContentEditable);
      if (isEditable) return;

      const items = Array.from(e.clipboardData?.items || []);
      const files: File[] = [];
      items.forEach((item) => {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const ext = item.type.split('/')[1] || 'png';
            files.push(new File([blob], `pasted-${Date.now()}.${ext}`, { type: item.type }));
          }
        }
      });
      if (files.length) {
        e.preventDefault();
        setAddInitialTab('manual');
        setAddInitialFiles(files);
        setAddOpen(true);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

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

  const headerActions = showToolbar && products.length > 0 ? (
    <Button
      onClick={() => openAddDrawer('manual', undefined, false)}
      className="hidden sm:inline-flex h-10"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Products
    </Button>
  ) : undefined;

  return (
    <PageHeader
      title="Products"
      subtitle="Upload once and reuse across every Visual Type"
      actions={headerActions}
    >
      <div className="space-y-3">
        {/* Desktop toolbar row: search (left) + view toggle (right) */}
        {showToolbar && (
          <div className="hidden sm:flex items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex items-center border border-border rounded-md shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-9 w-9 rounded-r-none text-muted-foreground', viewMode === 'grid' && 'bg-muted text-foreground')}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-9 w-9 rounded-l-none text-muted-foreground', viewMode === 'list' && 'bg-muted text-foreground')}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile search */}
        {showToolbar && (
          <div className="relative sm:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        )}

        {/* Mobile-only primary CTA — full width, dominant */}
        {showToolbar && products.length > 0 && (
          <Button
            onClick={() => openAddDrawer('manual', undefined, false)}
            className="sm:hidden w-full h-11 text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Products
          </Button>
        )}

        {/* Filter row — selects + mobile view toggle */}
        {showToolbar && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex sm:hidden items-center border rounded-md shrink-0">
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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[160px] h-9 sm:h-10 text-xs sm:text-sm">
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
            <SelectTrigger className="flex-1 sm:flex-none sm:w-[150px] h-9 sm:h-10 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name-asc">Name A–Z</SelectItem>
              <SelectItem value="name-desc">Name Z–A</SelectItem>
            </SelectContent>
          </Select>

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
            if (isFiltered) {
              return (
                <EmptyStateCard
                  heading="No products match your filters"
                  description="Try a different search term or clear filters"
                />
              );
            }
            // Truly empty: show active upload surface
            return (
              <ProductsEmptyUpload
                onFilesSelected={(files) => openAddDrawer('manual', files, false)}
                onMethodSelect={async (method) => {
                  if (method === 'paste') {
                    // Try clipboard read first; if image present, open compact drawer with files preloaded
                    try {
                      const items = await (navigator.clipboard as any)?.read?.();
                      const files: File[] = [];
                      if (items) {
                        for (const item of items) {
                          const imgType = item.types.find((t: string) => t.startsWith('image/'));
                          if (imgType) {
                            const blob = await item.getType(imgType);
                            const ext = imgType.split('/')[1] || 'png';
                            files.push(new File([blob], `pasted-${Date.now()}.${ext}`, { type: imgType }));
                          }
                        }
                      }
                      if (files.length) {
                        openAddDrawer('manual', files, true);
                        return;
                      }
                    } catch {
                      /* clipboard denied or unsupported */
                    }
                    // No image — arm 15s page-level paste listener, no drawer
                    setPasteArmed(true);
                    toast.info('Press Cmd/Ctrl+V to paste — listening…');
                    window.setTimeout(() => setPasteArmed(false), 15000);
                    return;
                  }
                  // URL / CSV / Shopify / Mobile → compact drawer for that method
                  openAddDrawer(method as AddProductTab, undefined, true);
                }}
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
      {!hasNoProducts && <FeedbackBanner />}

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

      <AddProductModal
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) setAddInitialFiles(undefined);
        }}
        onProductAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['user-products'] });
          queryClient.invalidateQueries({ queryKey: ['product-image-counts'] });
        }}
        initialTab={addInitialTab}
        initialFiles={addInitialFiles}
        compact={addCompact}
        onSwitchMethod={() => setAddCompact(false)}
      />

      {pageDragActive && (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0">
          <div className="rounded-2xl border-2 border-dashed border-primary/60 bg-card px-10 py-8 shadow-xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <p className="text-base font-semibold">Drop to add products</p>
            <p className="text-xs text-muted-foreground">Each image becomes a product</p>
          </div>
        </div>
      )}
    </PageHeader>
  );
}
