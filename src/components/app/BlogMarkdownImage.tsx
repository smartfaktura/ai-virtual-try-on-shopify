import { useState, useCallback } from 'react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface BlogMarkdownImageProps {
  src?: string;
  alt: string;
}

type Orientation = 'landscape' | 'portrait' | 'square';

function getOrientation(width: number, height: number): Orientation {
  const ratio = width / height;

  if (ratio >= 1.15) return 'landscape';
  if (ratio <= 0.85) return 'portrait';
  return 'square';
}

const widthByOrientation: Record<Orientation | 'default', string> = {
  default: 'max-w-[30rem] sm:max-w-[34rem]',
  landscape: 'max-w-[40rem] sm:max-w-[42rem]',
  portrait: 'max-w-[18rem] sm:max-w-[20rem] md:max-w-[22rem]',
  square: 'max-w-[24rem] sm:max-w-[26rem] md:max-w-[28rem]',
};

export function BlogMarkdownImage({ src, alt }: BlogMarkdownImageProps) {
  const [orientation, setOrientation] = useState<Orientation | null>(null);

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      setOrientation(getOrientation(image.naturalWidth, image.naturalHeight));
    }
  }, []);

  if (!src) {
    return null;
  }

  return (
    <figure className="my-8 flex justify-center">
      <ShimmerImage
        src={getOptimizedUrl(src, { width: 1200, quality: 78 })}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        wrapperClassName={cn(
          'mx-auto w-full rounded-xl',
          widthByOrientation[orientation ?? 'default'],
        )}
        className="w-full h-auto max-h-[70vh] rounded-xl object-contain"
      />
    </figure>
  );
}
