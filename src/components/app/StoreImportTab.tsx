import { useState } from 'react';
import { Globe, Loader2, Check, AlertCircle, Image as ImageIcon, Upload, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface StoreImportTabProps {
  onProductAdded: () => void;
  onClose: () => void;
  onSwitchToUpload?: () => void;
}

interface ExtractedProduct {
  title: string;
  image_url: string;
  image_urls?: string[];
  storage_paths?: string[];
  product_type: string;
  description: string;
  storage_path: string;
  dimensions?: string | null;
}

interface ImportError {
  code: string;
  message: string;
}

const ERROR_INFO: Record<string, { title: string; explanation: string; tip: string }> = {
  site_blocked: {
    title: 'Import blocked by website',
    explanation: 'This website has bot protection (like Cloudflare or similar) that prevents us from accessing the product page automatically.',
    tip: 'Use the Upload tab to add this product manually — just save the product images from the website and upload them directly.',
  },
  no_product_data: {
    title: 'No product found on this page',
    explanation: "We couldn't detect any product data on this page. This usually means the link goes to a collection, homepage, or a page that doesn't contain a single product.",
    tip: 'Make sure you are linking directly to a product page (e.g. myshop.com/products/cool-tee), not a collection or category page.',
  },
  images_protected: {
    title: 'Product images are protected',
    explanation: "We found the product but couldn't download its images. The site may be using hotlink protection or requiring authentication to access images.",
    tip: 'Try right-click saving the product images from the website, then upload them via the Upload tab.',
  },
  extraction_failed: {
    title: 'Could not read product page',
    explanation: "This page uses dynamic rendering (like heavy JavaScript) that our importer can't process yet. Some modern websites load product data after the initial page load.",
    tip: 'Try the Upload tab instead — it works with any product. You can also try a different URL for the same product.',
  },
  invalid_url: {
    title: 'Invalid URL',
    explanation: "The URL you entered doesn't appear to be a valid web address.",
    tip: 'Make sure the URL starts with https:// and points to a real product page.',
  },
  unauthorized: {
    title: 'Session expired',
    explanation: 'Your session has expired and you need to sign in again.',
    tip: 'Please refresh the page and sign in to continue importing.',
  },
  unknown: {
    title: 'Something went wrong',
    explanation: "An unexpected error occurred while importing this product. This might be a temporary issue.",
    tip: 'Try again in a moment, or use the Upload tab to add the product manually.',
  },
};

function getErrorInfo(code: string, rawMessage: string) {
  // Try exact code match first
  if (ERROR_INFO[code]) return ERROR_INFO[code];

  // Fallback: pattern-match on message for older responses without error_code
  const msg = rawMessage.toLowerCase();
  if (msg.includes('403') || msg.includes('blocking automated') || msg.includes('could not access'))
    return ERROR_INFO.site_blocked;
  if (msg.includes('could not find product') || msg.includes('title or images'))
    return ERROR_INFO.no_product_data;
  if (msg.includes('could not download') || msg.includes('images may be protected'))
    return ERROR_INFO.images_protected;
  if (msg.includes('could not extract') || msg.includes('dynamic rendering'))
    return ERROR_INFO.extraction_failed;

  return ERROR_INFO.unknown;
}

export function StoreImportTab({ onProductAdded, onClose, onSwitchToUpload }: StoreImportTabProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [importError, setImportError] = useState<ImportError | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [backImageIndex, setBackImageIndex] = useState<number | null>(null);
  const [sideImageIndex, setSideImageIndex] = useState<number | null>(null);
  const [packagingImageIndex, setPackagingImageIndex] = useState<number | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setIsImporting(true);
    setExtracted(null);
    setImportError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in first');

      const response = await supabase.functions.invoke('import-product', {
        body: { url: url.trim() },
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      if (data.error) {
        setImportError({ code: data.error_code || 'unknown', message: data.error });
        return;
      }

      setExtracted(data as ExtractedProduct);
      setSelectedImageIndex(0);
      setBackImageIndex(null);
      setSideImageIndex(null);
      setPackagingImageIndex(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setImportError({ code: 'unknown', message: msg });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = async () => {
    if (!user || !extracted) return;
    setIsSaving(true);

    try {
      const imageUrls = extracted.image_urls || [extracted.image_url];
      const primaryImageUrl = imageUrls[selectedImageIndex] || extracted.image_url;

      const backUrl = backImageIndex !== null ? imageUrls[backImageIndex] || null : null;
      const sideUrl = sideImageIndex !== null ? imageUrls[sideImageIndex] || null : null;
      const packUrl = packagingImageIndex !== null ? imageUrls[packagingImageIndex] || null : null;

      const { data: productData, error: insertError } = await supabase
        .from('user_products')
        .insert({
          user_id: user.id,
          title: extracted.title,
          product_type: extracted.product_type || '',
          description: extracted.description || '',
          image_url: primaryImageUrl,
          dimensions: extracted.dimensions || null,
          back_image_url: backUrl,
          side_image_url: sideUrl,
          packaging_image_url: packUrl,
        } as any)
        .select('id')
        .single();

      if (insertError) throw new Error(insertError.message);

      const storagePaths = extracted.storage_paths || [extracted.storage_path];

      const imageRows = imageUrls.map((imgUrl, i) => {
        let position = i;
        if (i === selectedImageIndex) position = 0;
        else if (i < selectedImageIndex) position = i + 1;

        return {
          product_id: productData.id,
          user_id: user.id,
          image_url: imgUrl,
          storage_path: storagePaths[i] || '',
          position,
        };
      });

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageRows);

      if (imagesError) {
        console.error('Failed to insert product images:', imagesError);
      }

      toast.success('Product imported!');
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const detectPlatform = (u: string): string | null => {
    if (u.includes('shopify.com') || u.includes('/products/')) return 'Shopify';
    if (u.includes('etsy.com')) return 'Etsy';
    if (u.includes('amazon.')) return 'Amazon';
    if (u.includes('woocommerce') || u.includes('/product/')) return 'WooCommerce';
    return null;
  };

  const platform = url ? detectPlatform(url) : null;
  const imageCount = extracted?.image_urls?.length || (extracted ? 1 : 0);

  const errorInfo = importError ? getErrorInfo(importError.code, importError.message) : null;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="store-url">Product URL</Label>
        <div className="flex gap-2 min-w-0">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="store-url"
              placeholder="https://myshop.com/products/cool-tee"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setImportError(null); }}
              className="pl-9"
              disabled={isImporting}
            />
          </div>
          <Button onClick={handleImport} disabled={isImporting || !url.trim()}>
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Import'}
          </Button>
        </div>
        {platform && (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">{platform}</Badge>
            <span className="text-xs text-muted-foreground">detected</span>
          </div>
        )}
      </div>

      {/* Supported platforms */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['Shopify', 'Etsy', 'Amazon', 'WooCommerce'].map((p) => (
          <Badge key={p} variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
            {p}
          </Badge>
        ))}
        <span className="text-[11px] text-muted-foreground">+ any product page</span>
      </div>

      {/* Error card */}
      {errorInfo && !isImporting && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{errorInfo.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{errorInfo.explanation}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-background/60 rounded-lg p-3 border border-border/50">
            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              <span className="font-medium text-foreground">VOVV.AI tip:</span>{' '}
              {errorInfo.tip}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {onSwitchToUpload && importError?.code !== 'unauthorized' && importError?.code !== 'invalid_url' && (
              <Button
                size="sm"
                variant="default"
                onClick={onSwitchToUpload}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Try Manual Upload
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setImportError(null); setUrl(''); }}
            >
              Try Another URL
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isImporting && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Extracting product data & all images…</p>
        </div>
      )}

      {/* Preview extracted product */}
      {extracted && !isImporting && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-3 animate-fade-in overflow-hidden">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
              <img
                src={getOptimizedUrl((extracted.image_urls?.[selectedImageIndex]) || extracted.image_url, { quality: 60 })}
                alt={extracted.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-medium text-sm truncate">{extracted.title}</p>
              <div className="flex items-center gap-2">
                {extracted.product_type && (
                  <Badge variant="secondary" className="text-[10px]">{extracted.product_type}</Badge>
                )}
                {imageCount > 1 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {imageCount} images
                  </span>
                )}
              </div>
              {extracted.dimensions && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  📐 {extracted.dimensions}
                </Badge>
              )}
              {extracted.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{extracted.description}</p>
              )}
            </div>
          </div>

          {/* Show all extracted images as thumbnails */}
          {extracted.image_urls && extracted.image_urls.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Click to set primary image:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {extracted.image_urls.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-14 h-14 rounded-md overflow-hidden bg-muted shrink-0 border-2 transition-all ${
                      i === selectedImageIndex
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Product image ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === selectedImageIndex && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                        <Check className="w-4 h-4 text-primary-foreground drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setExtracted(null)}>
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Check className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save Product
            </Button>
          </div>
        </div>
      )}

      {!extracted && !isImporting && !importError && (
        <div className="flex justify-end pt-6">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
        </div>
      )}
    </div>
  );
}
