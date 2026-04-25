import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Image with a built-in shimmer placeholder + fade-in on load.
 * Designed for the AI Product Photography category pages — drop-in
 * replacement for raw <img> tags inside aspect-ratio containers.
 *
 * The parent must define width/aspect — this component fills it absolutely.
 */
interface SmartImageProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

export function SmartImage({
  src,
  alt,
  srcSet,
  sizes,
  priority = false,
  className,
  imgClassName,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Shimmer skeleton */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-muted/40 transition-opacity duration-500',
          loaded ? 'opacity-0' : 'opacity-100',
        )}
        style={{
          backgroundImage:
            'linear-gradient(90deg, hsl(var(--muted) / 0.35) 0%, hsl(var(--muted) / 0.55) 50%, hsl(var(--muted) / 0.35) 100%)',
          backgroundSize: '200% 100%',
          animation: loaded ? 'none' : 'shimmer 1.6s ease-in-out infinite',
        }}
      />
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attribute not in React types
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
      />
    </div>
  );
}
