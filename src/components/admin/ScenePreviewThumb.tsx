import { useState } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface ScenePreviewThumbProps {
  url?: string | null;
  className?: string;
  iconClassName?: string;
  alt?: string;
  /** Max CSS pixel dimension for the thumbnail. Doubles for retina. Default 120. */
  thumbSize?: number;
}

/**
 * Robust scene preview thumbnail.
 * - Uses Supabase render endpoint to serve appropriately-sized thumbnails.
 * - Falls back to Camera icon on load error or missing URL.
 * - Routes external (non-Supabase Storage) URLs through image-proxy edge function.
 */
export function ScenePreviewThumb({ url, className, iconClassName, alt = '', thumbSize = 120 }: ScenePreviewThumbProps) {
  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    return (
      <div className={cn('flex items-center justify-center bg-muted', className)}>
        <Camera className={cn('w-6 h-6 text-muted-foreground/40', iconClassName)} />
      </div>
    );
  }

  const isSupabase = url.includes('supabase.co') || url.includes('supabase.in');

  // For Supabase Storage URLs, request a properly sized thumbnail instead of full-res.
  // thumbSize is doubled for retina displays.
  const src = isSupabase
    ? getOptimizedUrl(url, { width: thumbSize * 2, height: thumbSize * 2, quality: 50, resize: 'cover' })
    : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(url)}`;

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={cn('object-cover', className)}
    />
  );
}
