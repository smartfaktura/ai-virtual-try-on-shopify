import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';

interface ProductThumbnailProps {
  imageUrl: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fit?: 'cover' | 'contain';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-8 h-8',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

export function ProductThumbnail({ imageUrl, alt, size = 'md', fit = 'cover', className }: ProductThumbnailProps) {
  const sizeClass = SIZE_MAP[size];
  const optimizeWidth = size === 'sm' ? 64 : size === 'md' ? 112 : 160;
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div className={cn(sizeClass, 'rounded-lg overflow-hidden bg-muted/30 border border-border/40 flex-shrink-0', className)}>
      <ShimmerImage
        src={getOptimizedUrl(imageUrl, { width: optimizeWidth, quality: 70 })}
        alt={alt}
        className={cn('w-full h-full', fitClass)}
      />
    </div>
  );
}
