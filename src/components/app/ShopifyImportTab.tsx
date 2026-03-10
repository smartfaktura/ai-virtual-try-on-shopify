import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Loader2, Check, AlertCircle, Search, Info, Unlink, Link, FolderOpen, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

interface ShopifyImportTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

interface ShopifyListProduct {
  id: number;
  title: string;
  product_type: string;
  thumbnail: string;
  image_count: number;
  tags: string[];
}

interface ShopifyCollection {
  id: number;
  title: string;
  handle: string;
  type: string;
}

interface ShopifyConnection {
  id: string;
  shop_domain: string;
  scope: string;
  created_at: string;
}

type Step = 'loading' | 'connect' | 'select' | 'importing' | 'done';
const MAX_SHOPIFY_BATCH = 100;

export function ShopifyImportTab({ onProductAdded, onClose }: ShopifyImportTabProps) {
  const { user, session } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('loading');
  const [connection, setConnection] = useState<ShopifyConnection | null>(null);
  const [shop, setShop] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ShopifyListProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Collections
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  // Import progress
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // Check for existing connection on mount
  useEffect(() => {
    async function checkConnection() {
      if (!user) return;
      const { data, error } = await supabase
        .from('shopify_connections')
        .select('id, shop_domain, scope, created_at')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setConnection(data);
        setShop(data.shop_domain);
        if (searchParams.get('shopify') === 'connected') {
          searchParams.delete('shopify');
          setSearchParams(searchParams, { replace: true });
          toast.success('Shopify store connected!');
          loadProducts(data.shop_domain);
        } else {
          setStep('connect');
        }
      } else {
        setStep('connect');
      }
    }
    checkConnection();
  }, [user]);

  const loadCollections = async (shopDomain: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('shopify-sync', {
        body: { action: 'collections', shop: shopDomain },
      });
      if (!fnError && data?.collections) {
        setCollections(data.collections);
      }
    } catch {
      // Collections are optional, don't block on failure
    }
  };

  const loadProducts = async (shopDomain?: string, collectionId?: number, isCollectionSwitch = false) => {
    const domain = shopDomain || shop.trim();
    if (!domain) return;
    setIsLoading(true);
    setError(null);

    try {
      // Load collections in parallel on first load
      if (collections.length === 0 && !collectionId) {
        loadCollections(domain);
      }

      const body: Record<string, unknown> = { action: 'list', shop: domain };
      if (collectionId) body.collection_id = collectionId;

      const { data, error: fnError } = await supabase.functions.invoke('shopify-sync', { body });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      setProducts(data.products || []);
      setStep('select');
      if (data.total === 0) {
        toast.info('No products found.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load products';
      setError(msg);
      toast.error(msg);
      // Only reset to connect screen on initial load, not during collection switches
      if (!isCollectionSwitch) {
        setStep('connect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionChange = (value: string) => {
    setSelectedCollection(value);
    setSelectedIds(new Set());
    setSearch('');
    const domain = connection?.shop_domain || shop.trim();
    setIsLoadingCollection(true);
    const collectionId = value === 'all' ? undefined : Number(value);
    loadProducts(domain, collectionId, true).finally(() => setIsLoadingCollection(false));
  };

  const handleConnectOAuth = () => {
    if (!shop.trim() || !session?.access_token) return;
    const cleanShop = `${shop.trim()}.myshopify.com`;
    const baseUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/shopify-oauth`;
    // Pass origin in state so callback redirects to the correct environment
    const statePayload = JSON.stringify({ token: session.access_token, origin: window.location.origin });
    const url = `${baseUrl}?action=authorize&shop=${encodeURIComponent(cleanShop)}&token=${encodeURIComponent(statePayload)}`;
    window.location.href = url;
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await supabase.functions.invoke('shopify-oauth', {
        body: {},
        headers: { 'x-action': 'disconnect' },
      });
      await supabase.from('shopify_connections').delete().eq('user_id', user!.id);

      setConnection(null);
      setProducts([]);
      setSelectedIds(new Set());
      setCollections([]);
      setSelectedCollection('all');
      setShop('');
      setStep('connect');
      toast.success('Shopify store disconnected.');
    } catch {
      toast.error('Failed to disconnect.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) ||
        p.product_type.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [products, search]);

  const atLimit = selectedIds.size >= MAX_SHOPIFY_BATCH;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SHOPIFY_BATCH) next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size > 0 && selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      const toSelect = filteredProducts.slice(0, MAX_SHOPIFY_BATCH).map((p) => p.id);
      setSelectedIds(new Set(toSelect));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setStep('importing');
    setImportTotal(ids.length);
    setImportProgress(0);
    setImportedCount(0);
    setFailedCount(0);

    const BATCH = 10;
    let totalImported = 0;
    let totalFailed = 0;

    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('shopify-sync', {
          body: {
            action: 'import',
            shop: connection?.shop_domain || shop.trim(),
            product_ids: batch,
          },
        });

        if (fnError) throw new Error(fnError.message);
        if (data.error) throw new Error(data.error);

        totalImported += data.imported || 0;
        totalFailed += data.failed || 0;
      } catch (err) {
        totalFailed += batch.length;
        console.error('Batch import error:', err);
      }

      setImportProgress(Math.min(i + batch.length, ids.length));
      setImportedCount(totalImported);
      setFailedCount(totalFailed);
    }

    setStep('done');
    onProductAdded();
    if (totalImported > 0) {
      toast.success(`${totalImported} product${totalImported > 1 ? 's' : ''} imported!`);
    }
    if (totalFailed > 0) {
      toast.error(`${totalFailed} product${totalFailed > 1 ? 's' : ''} failed to import.`);
    }
  };

  // Loading state
  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Connect step
  if (step === 'connect') {
    return (
      <div className="space-y-5">
        {connection ? (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{connection.shop_domain}</p>
                <p className="text-xs text-muted-foreground">Connected · {connection.scope}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="text-destructive hover:text-destructive shrink-0"
              >
                {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                Disconnect
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
              <Button onClick={() => loadProducts(connection.shop_domain)} disabled={isLoading} className="rounded-xl">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Load Products</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
              <p className="text-sm font-medium flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Connect your Shopify store
              </p>
              <p className="text-xs text-muted-foreground">
                Enter your store domain and authorize access. We only request <span className="font-medium text-foreground">read_products</span> permission — your store data stays safe.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shopify-domain">Your Shopify store</Label>
              <div className="flex items-center w-fit">
                <Input
                  id="shopify-domain"
                  placeholder="my-store"
                  value={shop}
                  onChange={(e) => { setShop(e.target.value.replace(/\.myshopify\.com$/i, '').replace(/[^a-zA-Z0-9-]/g, '')); setError(null); }}
                  disabled={isLoading}
                  className="rounded-r-none border-r-0 w-44"
                />
                <span className="inline-flex items-center px-3 h-10 border border-l-0 border-input rounded-r-md bg-muted text-muted-foreground text-sm whitespace-nowrap">
                  .myshopify.com
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Enter just your store name, without .myshopify.com</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
              <Button
                onClick={handleConnectOAuth}
                disabled={!shop.trim()}
                className="rounded-xl"
              >
                <Link className="w-4 h-4" />
                Connect Shopify Store
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Select step
  if (step === 'select') {
    const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;
    const selectAllDisabled = filteredProducts.length > MAX_SHOPIFY_BATCH && selectedIds.size === 0;

    return (
      <div className="space-y-4">
        {/* Header with product count */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} found
            {connection && <span className="text-xs"> · {connection.shop_domain}</span>}
          </p>
        </div>

        {/* Collection filter + Search bar */}
        <div className="flex items-center gap-2">
          {collections.length > 0 && (
            <Select value={selectedCollection} onValueChange={handleCollectionChange} disabled={isLoadingCollection}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={String(col.id)}>
                    <span className="truncate">{col.title}</span>
                    <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                      {col.type}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, type, or tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        {isLoadingCollection && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">Loading collection…</span>
          </div>
        )}

        {!isLoadingCollection && (
          <>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                id="select-all"
                disabled={selectAllDisabled}
              />
              <Label htmlFor="select-all" className={`text-xs cursor-pointer ${selectAllDisabled ? 'text-muted-foreground/60' : ''}`}>
                {filteredProducts.length <= MAX_SHOPIFY_BATCH
                  ? `Select all (${filteredProducts.length})`
                  : `Select first ${MAX_SHOPIFY_BATCH}`}
              </Label>
              <span className={`text-xs font-medium ml-auto ${atLimit ? 'text-amber-500' : 'text-primary'}`}>
                {selectedIds.size}/{MAX_SHOPIFY_BATCH}
              </span>
            </div>

            {products.length > MAX_SHOPIFY_BATCH && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                <span>Maximum {MAX_SHOPIFY_BATCH} products per import. You can import more in additional batches.</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto p-1">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                const isDisabled = atLimit && !isSelected;
                return (
                  <div
                    key={product.id}
                    onClick={() => !isDisabled && toggleSelect(product.id)}
                    className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="absolute top-2 left-2 z-10 bg-background/90 rounded-md shadow-sm p-0.5">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => toggleSelect(product.id)}
                      />
                    </div>
                    <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-muted">
                      {product.thumbnail ? (
                        <ShimmerImage
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          aspectRatio="1/1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      {product.image_count > 1 && (
                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
                          <ImageIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-medium text-muted-foreground">{product.image_count}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{product.title}</p>
                    {product.product_type && (
                      <p className="text-[10px] text-muted-foreground truncate">{product.product_type}</p>
                    )}
                    {product.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {product.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">+{product.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8 col-span-full">No products match your search.</p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={() => setStep('connect')} className="rounded-xl" size="sm">
            ← Back
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.size === 0 || isLoadingCollection}
            className="rounded-xl"
          >
            <ShoppingBag className="w-4 h-4" />
            Import Selected ({selectedIds.size})
          </Button>
        </div>
      </div>
    );
  }

  // Importing step
  if (step === 'importing') {
    const pct = importTotal > 0 ? Math.round((importProgress / importTotal) * 100) : 0;
    return (
      <div className="flex flex-col items-center py-10 gap-5">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <div className="w-full max-w-xs space-y-2">
          <Progress value={pct} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Importing {importProgress} of {importTotal} products…
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Downloading images & saving to your library
        </p>
      </div>
    );
  }

  // Done step
  return (
    <div className="flex flex-col items-center py-10 gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="w-6 h-6 text-primary" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-medium">Import Complete</p>
        <p className="text-sm text-muted-foreground">
          {importedCount} product{importedCount !== 1 ? 's' : ''} imported successfully
          {failedCount > 0 && `, ${failedCount} failed`}
        </p>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => {
          setSelectedIds(new Set());
          // Re-fetch products so already-imported items can be visually up-to-date
          const domain = connection?.shop_domain || shop.trim();
          loadProducts(domain);
        }} className="rounded-xl">
          Import More
        </Button>
        <Button onClick={onClose} className="rounded-xl">
          Done
        </Button>
      </div>
    </div>
  );
}
