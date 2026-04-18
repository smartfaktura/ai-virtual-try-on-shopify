import { useState } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenePreviewThumbProps {
  url?: string | null;
  className?: string;
  iconClassName?: string;
  alt?: string;
}

/**
 * Robust scene preview thumbnail.
 * - Falls back to Camera icon on load error or missing URL.
 * - Routes external (non-Supabase Storage) URLs through image-proxy edge function
 *   so mobile browsers (iOS/Android) don't fail on referrer/CORS/hot-link blocks.
 */
export function ScenePreviewThumb({ url, className, iconClassName, alt = '' }: ScenePreviewThumbProps) {
  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    return (
      <div className={cn('flex items-center justify-center bg-muted', className)}>
        <Camera className={cn('w-6 h-6 text-muted-foreground/40', iconClassName)} />
      </div>
    );
  }

  const isSupabase = url.includes('supabase.co') || url.includes('supabase.in');
  const src = isSupabase
    ? url
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
