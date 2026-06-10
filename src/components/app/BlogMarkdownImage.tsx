import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface BlogMarkdownImageProps {
  src?: string;
  alt: string;
}

export function BlogMarkdownImage({ src, alt }: BlogMarkdownImageProps) {
  if (!src) return null;

  const showCaption = alt && alt.trim().length > 0;

  // Collage syntax: ![alt](url1|url2|url3)
  if (src.includes('|')) {
    const urls = src.split('|').map((u) => u.trim()).filter(Boolean);
    if (urls.length >= 2) {
      const cols = urls.length >= 3 ? 'grid-cols-3' : 'grid-cols-2';
      return (
        <figure className="my-10 flex flex-col items-center">
          <div className={`grid ${cols} gap-1 sm:gap-1.5 rounded-2xl overflow-hidden border border-[#f0efed] bg-[#f5f4f1] max-w-full w-full`}>
            {urls.map((u, i) => (
              <div key={i} className="aspect-[4/5] overflow-hidden">
                <ShimmerImage
                  src={getOptimizedUrl(u, { quality: 80 })}
                  alt={`${alt} — ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          {showCaption && (
            <figcaption className="blog-figcaption max-w-[90%]">{alt}</figcaption>
          )}
        </figure>
      );
    }
  }

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
