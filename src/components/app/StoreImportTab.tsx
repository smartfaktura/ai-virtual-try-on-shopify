import { useState } from 'react';
import { Globe, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StoreImportTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

interface ExtractedProduct {
  title: string;
  image_url: string;
  product_type: string;
  description: string;
  storage_path: string;
}

export function StoreImportTab({ onProductAdded, onClose }: StoreImportTabProps) {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url.trim()) return;
    setIsImporting(true);
    setExtracted(null);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in first');

      const response = await supabase.functions.invoke('import-product', {
        body: { url: url.trim() },
      });

      if (response.error) throw new Error(response.error.message);

      const data = response.data;
      if (data.error) throw new Error(data.error);

      setExtracted(data as ExtractedProduct);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSave = async () => {
    if (!user || !extracted) return;
    setIsSaving(true);

    try {
      const { error: insertError } = await supabase.from('user_products').insert({
        user_id: user.id,
        title: extracted.title,
        product_type: extracted.product_type || '',
        description: extracted.description || '',
        image_url: extracted.image_url,
      });

      if (insertError) throw new Error(insertError.message);

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

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="store-url">Product URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="store-url"
              placeholder="https://myshop.com/products/cool-tee"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); }}
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

      {/* Supported platforms hint */}
      <p className="text-xs text-muted-foreground">
        Works with Shopify, WooCommerce, Etsy, Amazon, and any page with product meta tags.
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isImporting && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Extracting product data…</p>
        </div>
      )}

      {/* Preview extracted product */}
      {extracted && !isImporting && (
        <div className="border rounded-lg p-4 space-y-3 animate-fade-in">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
              <img
                src={extracted.image_url}
                alt={extracted.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-medium text-sm truncate">{extracted.title}</p>
              {extracted.product_type && (
                <Badge variant="secondary" className="text-[10px]">{extracted.product_type}</Badge>
              )}
              {extracted.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{extracted.description}</p>
              )}
            </div>
          </div>

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

      {!extracted && !isImporting && (
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
