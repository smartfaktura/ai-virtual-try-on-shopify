import { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, Loader2, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getQRCodeURL } from '@/lib/qrCode';

interface MobileUploadTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

const PRODUCT_TYPES = [
  'T-Shirt', 'Hoodie', 'Dress', 'Jacket', 'Pants', 'Leggings', 'Shorts',
  'Sneakers', 'Boots', 'Sandals', 'Bag', 'Hat', 'Jewelry', 'Watch',
  'Serum', 'Cream', 'Lipstick', 'Foundation', 'Supplement', 'Candle',
  'Mug', 'Pillow', 'Lamp', 'Food', 'Beverage', 'Other',
];

export function MobileUploadTab({ onProductAdded, onClose }: MobileUploadTabProps) {
  const { user } = useAuth();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [productType, setProductType] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSessionCreatedRef = useRef<number>(0);

  const createSession = useCallback(async () => {
    if (!user) return;
    // Debounce: don't create a new session if one was created less than 30s ago
    const now = Date.now();
    if (now - lastSessionCreatedRef.current < 30000 && sessionToken) return;

    setIsCreating(true);
    setError(null);
    setUploadedImageUrl(null);
    setSessionToken(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in first');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/mobile-upload?action=create-session`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create session');
      }

      const data = await res.json();
      setSessionToken(data.session_token);
      lastSessionCreatedRef.current = Date.now();

      // Build the mobile upload URL
      const uploadUrl = `${window.location.origin}/upload/${data.session_token}`;
      setQrUrl(getQRCodeURL(uploadUrl, 280));

      // Start polling
      startPolling(data.session_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  }, [user]);

  const startPolling = (token: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/mobile-upload?action=status&token=${token}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'uploaded' && data.image_url) {
          setUploadedImageUrl(data.image_url);
          if (pollRef.current) clearInterval(pollRef.current);
          toast.success('Photo received from mobile!');
        } else if (data.status === 'expired') {
          if (pollRef.current) clearInterval(pollRef.current);
          setError('Session expired. Please create a new one.');
          setSessionToken(null);
        }
      } catch {
        // Silent retry
      }
    }, 2000);
  };

  useEffect(() => {
    createSession();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [createSession]);

  const handleSave = async () => {
    if (!user || !uploadedImageUrl || !title.trim()) {
      toast.error('Please provide a product name');
      return;
    }

    setIsSaving(true);
    try {
      const { error: insertError } = await supabase.from('user_products').insert({
        user_id: user.id,
        title: title.trim().substring(0, 200),
        product_type: productType || '',
        description: '',
        image_url: uploadedImageUrl,
      });

      if (insertError) throw new Error(insertError.message);

      toast.success('Product added!');
      onProductAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  // After image received — show form
  if (uploadedImageUrl) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 text-sm">
          <Check className="w-5 h-5 text-primary shrink-0" />
          <span>Photo received! Fill in the details below.</span>
        </div>

        <div className="flex justify-center">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted">
            <img src={uploadedImageUrl} alt="Mobile upload" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="mobile-title">Product Name *</Label>
            <Input
              id="mobile-title"
              placeholder="e.g. Black Yoga Leggings"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>
          <div>
            <Label htmlFor="mobile-type">Product Type</Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Add Product
          </Button>
        </div>
      </div>
    );
  }

  // QR code view
  return (
    <div className="space-y-5">
      {error ? (
        <div className="flex flex-col items-center py-6 gap-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={createSession}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      ) : isCreating ? (
        <div className="flex flex-col items-center py-10 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Creating secure session…</p>
        </div>
      ) : qrUrl ? (
        <div className="flex flex-col items-center gap-5 py-2">
          <div className="bg-background p-4 rounded-2xl border shadow-md">
            <img src={qrUrl} alt="Scan QR code" className="w-[200px] h-[200px]" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium flex items-center gap-2 justify-center">
              <Smartphone className="w-4 h-4" />
              Scan with your phone
            </p>
            <p className="text-[11px] text-muted-foreground">
              Take a photo or pick from camera roll
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/40 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] text-muted-foreground">Waiting for upload…</span>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
