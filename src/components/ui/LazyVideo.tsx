import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

/**
 * Mounts a <video> only while it's near the viewport, and unmounts
 * once it scrolls far away. This caps the number of simultaneously
 * decoding videos and keeps fast-scroll smooth on pages with many
 * autoplay clips.
 */
export function LazyVideo({ src, className, poster }: LazyVideoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mount/unmount based on a wide margin (prevents thrash at edges).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsNear(entry.isIntersecting),
      { rootMargin: '600px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Play/pause based on actual visibility (saves frame decoding while scrolling past).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25, 0.5] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isVisible) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isVisible, isNear]);

  return (
    <div ref={ref} className={cn('w-full h-full bg-muted', className)}>
      {isNear && (
        <video
          ref={videoRef}
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
