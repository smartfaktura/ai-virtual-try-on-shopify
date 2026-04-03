import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const FALLBACK_GALLERY_IMAGES = [
  getOptimizedUrl(getLandingAssetUrl('auth/auth-hero.jpg'), { quality: 60 }),
  getOptimizedUrl(getLandingAssetUrl('showcase/fashion-camel-coat.png'), { quality: 60 }),
  getOptimizedUrl(getLandingAssetUrl('showcase/skincare-serum-marble.png'), { quality: 60 }),
  getOptimizedUrl(getLandingAssetUrl('showcase/home-candle-evening.png'), { quality: 60 }),
  getOptimizedUrl(getLandingAssetUrl('showcase/food-cocktail-bar.png'), { quality: 60 }),
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function AuthHeroGallery() {
  const [images, setImages] = useState<string[]>(FALLBACK_GALLERY_IMAGES);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadImages() {
      try {
        const { data, error } = await supabase.storage
          .from('landing-assets')
          .list('auth', { limit: 100 });
        if (error || !data || data.length === 0) return;

        const urls = data
          .filter((f) => !f.id?.endsWith('/') && /\.(jpg|jpeg|png|webp)$/i.test(f.name))
          .map((f) =>
            getOptimizedUrl(getLandingAssetUrl(`auth/${f.name}`), { quality: 60 })
          );

        if (urls.length > 0) {
          setImages(shuffleArray(urls));
        }
      } catch {
        // Fallback to default images if storage fetch fails
      }
    }
    loadImages();
  }, []);

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
