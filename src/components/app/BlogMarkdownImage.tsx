import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface BlogMarkdownImageProps {
  src?: string;
  alt: string;
}

type Orientation = 'landscape' | 'portrait' | 'square';

function getOrientation(w: number, h: number): Orientation {
  const ratio = w / h;
  if (ratio > 1.15) return 'landscape';
  if (ratio < 0.85) return 'portrait';
  return 'square';
}

const orientationClasses: Record<Orientation, string> = {
  landscape: 'max-w-full',
  portrait: 'max-w-[420px]',
  square: 'max-w-[520px]',
};

export function BlogMarkdownImage({ src, alt }: BlogMarkdownImageProps) {
  const [orientation, setOrientation] = useState<Orientation>('landscape');
  const [loaded, setLoaded] = useState(false);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setOrientation(getOrientation(img.naturalWidth, img.naturalHeight));
    setLoaded(true);
  }, []);

  const optimizedSrc = src ? getOptimizedUrl(src, { width: 1000, quality: 78 }) : '';

  return (
    <figure className="my-8 flex justify-center">
      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        className={cn(
          'rounded-xl h-auto object-contain transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          orientationClasses[orientation],
        )}
      />
    </figure>
  );
}
