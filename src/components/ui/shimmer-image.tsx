import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ShimmerImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** CSS aspect-ratio value for the placeholder, e.g. "3/4", "1/1", "16/9" */
  aspectRatio?: string;
  /** Additional wrapper className */
  wrapperClassName?: string;
  /** Additional wrapper inline styles */
  wrapperStyle?: React.CSSProperties;
}

/**
 * Image component with a shimmer loading placeholder.
 * Shows an animated gradient sweep while the image loads,
 * then crossfades to the real image over 300ms.
 */
export function ShimmerImage({
  src,
  alt,
  className,
  aspectRatio,
  wrapperClassName,
  wrapperStyle,
  onLoad,
  onError,
  style,
  ...rest
}: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn('relative overflow-hidden w-full h-full', wrapperClassName)}
      style={{
        ...(aspectRatio && !loaded ? { aspectRatio } : undefined),
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
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        style={style}
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
}
