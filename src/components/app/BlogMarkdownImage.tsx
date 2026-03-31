import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface BlogMarkdownImageProps {
  src?: string;
  alt: string;
}

export function BlogMarkdownImage({ src, alt }: BlogMarkdownImageProps) {
  if (!src) {
    return null;
  }

  return (
    <figure className="my-8 flex justify-center px-0">
      <ShimmerImage
        src={getOptimizedUrl(src, { width: 1600, quality: 82 })}
        alt={alt}
        loading="lazy"
        decoding="async"
        wrapperClassName="mx-auto h-auto w-fit max-w-full rounded-xl"
        className="block h-auto w-auto max-w-full max-h-[80vh] rounded-xl object-contain"
      />
    </figure>
  );
}
