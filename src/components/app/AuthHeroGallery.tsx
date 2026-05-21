import { useState, useEffect } from 'react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const CURATED_IMAGES = [
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776018020221-aehe8n.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776102176417-iih747.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776667380105-z2dtni.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1777996832895-0e40jt.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0544388b-9cb9-4a2d-b101-c8c85640e67e.png',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776689317300-luvmhd.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776689319074-0908hd.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776753256682-343bsf.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776842392261-39paz7.jpg',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776192312181-3v0u0t.jpg',
].map((url) => getOptimizedUrl(url, { quality: 60 }));

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function AuthHeroGallery() {
  const [images] = useState<string[]>(() => shuffleArray(CURATED_IMAGES));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images]);

  useEffect(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const img = new Image();
    img.src = images[nextIndex];
  }, [currentIndex, images]);

  return (
    <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="AI-generated product photography showcase"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === currentIndex ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-8 left-8 right-8">
        <p className="text-white/90 text-sm font-medium">
          Generated with VOVV.AI
        </p>
      </div>
    </div>
  );
}
