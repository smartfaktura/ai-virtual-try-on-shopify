import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

/**
 * Mounts a <video> only when it scrolls into the viewport.
 * Reduces initial bandwidth + avoids the "loading again" feel
 * when many autoplay videos are stacked on a page.
 */
export function LazyVideo({ src, className, poster }: LazyVideoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn('w-full h-full bg-muted', className)}>
      {shouldMount && (
        <video
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
