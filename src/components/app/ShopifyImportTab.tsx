import { useState, useMemo } from 'react';
import { ShoppingBag, Loader2, Check, AlertCircle, ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ShopifyImportTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

interface ShopifyListProduct {
  id: number;
  title: string;
  product_type: string;
  thumbnail: string;
}

type Step = 'connect' | 'select' | 'importing' | 'done';

export function ShopifyImportTab({ onProductAdded, onClose }: ShopifyImportTabProps) {
  const { user } = useAuth();
  const [shop, setShop] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [step, setStep] = useState<Step>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ShopifyListProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Import progress
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.title.toLowerCase().includes(q) || p.product_type.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleConnect = async () => {
    if (!shop.trim() || !accessToken.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('shopify-sync', {
        body: { action: 'list', shop: shop.trim(), access_token: accessToken.trim() },
      });

      if (fnError) throw new Error(fnError.message);
      if (data.error) throw new Error(data.error);

      setProducts(data.products || []);
      setStep('select');
      if (data.total === 0) {
        toast.info('No products found in this store.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
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

    // Process in batches of 10 from frontend side too
    const BATCH = 10;
    let totalImported = 0;
    let totalFailed = 0;

    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('shopify-sync', {
          body: {
            action: 'import',
            shop: shop.trim(),
            access_token: accessToken.trim(),
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

  // Connect step
  if (step === 'connect') {
    return (
      <div className="space-y-5">
        {/* Setup instructions */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
          <p className="text-sm font-medium flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            How to connect your Shopify store
          </p>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>In your Shopify admin, go to <span className="font-medium text-foreground">Settings → Apps → Develop apps</span></li>
            <li>Create an app and enable <span className="font-medium text-foreground">read_products</span> access scope</li>
            <li>Copy your <span className="font-medium text-foreground">Admin API access token</span> and paste it below</li>
          </ol>
          <a
            href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Shopify setup guide <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="shopify-domain">Store domain</Label>
            <Input
              id="shopify-domain"
              placeholder="mystore.myshopify.com"
              value={shop}
              onChange={(e) => { setShop(e.target.value); setError(null); }}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shopify-token">Admin API access token</Label>
            <Input
              id="shopify-token"
              type="password"
              placeholder="shpat_xxxxxxxxxxxx"
              value={accessToken}
              onChange={(e) => { setAccessToken(e.target.value); setError(null); }}
              disabled={isLoading}
            />
          </div>
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
            onClick={handleConnect}
            disabled={isLoading || !shop.trim() || !accessToken.trim()}
            className="rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading products…
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Connect & Load Products
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Select step
  if (step === 'select') {
    const allSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pb-1">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            id="select-all"
          />
          <Label htmlFor="select-all" className="text-xs cursor-pointer">
            Select all ({filteredProducts.length})
          </Label>
          {selectedIds.size > 0 && (
            <span className="text-xs text-primary font-medium ml-auto">
              {selectedIds.size} selected
            </span>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto space-y-1 -mx-1 px-1">
          {filteredProducts.map((product) => (
            <label
              key={product.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedIds.has(product.id)}
                onCheckedChange={() => toggleSelect(product.id)}
              />
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                {product.thumbnail ? (
                  <ShimmerImage
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    aspectRatio="1/1"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{product.title}</p>
                {product.product_type && (
                  <p className="text-[11px] text-muted-foreground truncate">{product.product_type}</p>
                )}
              </div>
            </label>
          ))}
          {filteredProducts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No products match your search.</p>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={() => setStep('connect')} className="rounded-xl" size="sm">
            ← Back
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.size === 0}
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
        <Button variant="outline" onClick={() => { setStep('select'); setSelectedIds(new Set()); }} className="rounded-xl">
          Import More
        </Button>
        <Button onClick={onClose} className="rounded-xl">
          Done
        </Button>
      </div>
    </div>
  );
}
