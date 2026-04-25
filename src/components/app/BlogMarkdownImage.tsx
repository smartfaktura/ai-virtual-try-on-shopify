import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface BlogMarkdownImageProps {
  src?: string;
  alt: string;
}

export function BlogMarkdownImage({ src, alt }: BlogMarkdownImageProps) {
  if (!src) return null;

  const showCaption = alt && alt.trim().length > 0;

  return (
    <figure className="my-10 flex flex-col items-center">
      <div className="rounded-2xl overflow-hidden border border-[#f0efed] bg-[#f5f4f1] max-w-full">
        <ShimmerImage
          src={getOptimizedUrl(src, { width: 1600, quality: 82 })}
          alt={alt}
          loading="lazy"
          decoding="async"
          wrapperClassName="!h-auto"
          className="block w-auto h-auto max-w-full max-h-[70vh] object-contain"
        />
      </div>
      {showCaption && (
        <figcaption className="blog-figcaption max-w-[90%]">{alt}</figcaption>
      )}
    </figure>
  );
}
