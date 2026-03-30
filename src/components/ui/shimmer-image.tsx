import { useState, useCallback, forwardRef, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** CSS aspect-ratio value for the placeholder, e.g. "3/4", "1/1", "16/9" */
  aspectRatio?: string;
  /** Additional wrapper className */
  wrapperClassName?: string;
  /** Additional wrapper inline styles */
  wrapperStyle?: React.CSSProperties;
  /** fetchpriority hint for LCP images */
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Image component with a shimmer loading placeholder.
 * Shows an animated gradient sweep while the image loads,
 * then crossfades to the real image over 300ms.
 */
export const ShimmerImage = forwardRef<HTMLImageElement, ShimmerImageProps>(
  function ShimmerImage(
    {
      src,
      alt,
      className,
      aspectRatio,
      wrapperClassName,
      wrapperStyle,
      onLoad,
      onError,
      style,
      fetchPriority,
      ...rest
    },
    forwardedRef,
  ) {
    // Eagerly check browser cache to avoid shimmer flash on remount
    // Skip the probe for lazy images — it defeats native lazy loading by
    // creating a phantom request for every off-screen image.
    const [loaded, setLoaded] = useState(() => {
      if (!src || typeof window === 'undefined') return false;
      const img = new Image();
      img.src = src;
      return img.complete && img.naturalWidth > 0;
    });
    const [errored, setErrored] = useState(false);

    // Ref callback: if the image is already cached, skip shimmer immediately
    const imgRef = useCallback(
      (node: HTMLImageElement | null) => {
        if (node && node.complete && node.naturalWidth > 0) {
          setLoaded(true);
        }
        // Merge with forwarded ref
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    return (
      <div
        className={cn('relative overflow-hidden w-full h-full', wrapperClassName)}
        style={{
          ...(aspectRatio ? { aspectRatio } : undefined),
          ...wrapperStyle,
        }}
      >
        {/* Shimmer placeholder */}
        {!loaded && !errored && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] animate-shimmer"
            style={aspectRatio ? { aspectRatio } : undefined}
          />
        )}

        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={rest.loading ?? 'lazy'}
          decoding="async"
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          style={style}
          fetchPriority={fetchPriority}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setErrored(true);
            setLoaded(true);
            onError?.(e);
          }}
          {...rest}
        />
      </div>
    );
  },
);
