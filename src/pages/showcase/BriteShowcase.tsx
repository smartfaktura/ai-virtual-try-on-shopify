import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Clock, Images, Layers, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE = 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';

const IMAGES: { url: string; scene: string; model?: string }[] = [
  { url: `${BASE}/8b6e608f-cb2c-4020-8be1-71e1580e3d41/0-0.jpg`, scene: 'Dynamic Water Splash' },
  { url: `${BASE}/b127598d-c6d9-4bb2-904b-4a7e6bc4bdc4/0-0.jpg`, scene: 'Fisheye Portrait', model: 'Zara' },
  { url: `${BASE}/38c402f4-0e1f-45cd-b867-b23367202513/0-0.jpg`, scene: 'Red Gradient Embrace' },
  { url: `${BASE}/ada5bbb6-8a0f-49d5-9614-a74562ec616e/0-0.jpg`, scene: 'Tennis Court Drink Moment', model: 'Freya' },
  { url: `${BASE}/1fbe01ae-7fd0-4ef3-bec6-99ceea17f97f/0-0.jpg`, scene: 'Dramatic Red Spotlight' },
  { url: '/images/showcase/brite-riviera-zara.jpg', scene: 'Riviera Pop Escape', model: 'Zara' },
  { url: `${BASE}/bd3ec14c-41c9-48d5-8953-e74cbb4cfed8/0-0.jpg`, scene: 'Frozen Aura' },
  { url: `${BASE}/49dc3eff-c2ef-4468-a6fd-1a6c5dc0888e/0-0.jpg`, scene: 'Golden Splash Cheers', model: 'Zara' },
  { url: `${BASE}/be9ef728-7368-427d-bea8-dd4d9cf9d890/0-0.jpg`, scene: 'Aquatic Reflection' },
  { url: `${BASE}/81bdab7f-2e12-46ed-b1e3-abe2ced11af4/0-0.jpg`, scene: 'Sport Flash Soda Energy', model: 'Freya' },
  { url: `${BASE}/a6a5d3ed-453a-448a-b97b-c89ab2f4d4e0/0-0.jpg`, scene: 'Amber Glow Studio' },
  { url: `${BASE}/1dd003e0-3a7f-413b-b803-f8a90f58b593/0-0.jpg`, scene: 'Close Face Drink Hold', model: 'Zara' },
  { url: `${BASE}/d682917a-e90b-4e04-8199-e4fd12d29555/0-0.jpg`, scene: 'Reflective Floral Display' },
  { url: `${BASE}/da8c4f3a-1cdf-4e48-ba1e-ca667b9d1197/0-0.jpg`, scene: 'Fisheye Portrait', model: 'Freya' },
  { url: `${BASE}/e062775b-9a7c-4602-91a7-ba08e6830f18/0-0.jpg`, scene: 'Dynamic Splash Product' },
  { url: `${BASE}/f2f71b11-79cf-4640-9474-a1dfea809f8e/0-0.jpg`, scene: 'Sunburn Editorial Sip', model: 'Freya' },
  { url: `${BASE}/806779c0-3e0c-4cd3-b4cb-1aa93639142c/0-0.jpg`, scene: 'Frozen Surface Product' },
  { url: `${BASE}/61bb71c0-dd72-4dda-be6c-4364535d8e6f/0-0.jpg`, scene: 'Tennis Court Drink Moment', model: 'Zara' },
  { url: `${BASE}/289603fb-e776-4d29-86dc-61ddf2c242e4/0-0.jpg`, scene: 'Botanical Oasis' },
  { url: `${BASE}/c7796b62-a24c-45c3-96b0-38e43d42ad1d/0-0.jpg`, scene: 'Sunburn Editorial Sip', model: 'Zara' },
  { url: `${BASE}/a88b3bee-7606-4a36-bbbb-3c3e53169e87/0-0.jpg`, scene: 'Earthy Glow Stage' },
  { url: `${BASE}/f0690faf-1e15-4176-8dbb-a27f05c01917/0-0.jpg`, scene: 'Close Face Drink Hold', model: 'Freya' },
  { url: `${BASE}/33027cb8-556d-4dee-997f-5939a30d9178/0-0.jpg`, scene: 'Volcanic Sunset' },
  { url: `${BASE}/f3f9592f-84bf-4122-82ea-1ecd0010305f/0-0.jpg`, scene: 'Sport Flash Soda Energy', model: 'Zara' },
  { url: `${BASE}/6e7b2aa3-9530-4ac9-9aa0-9f964ceaaeb8/0-0.jpg`, scene: 'Shadow Grid Repeat' },
  { url: `${BASE}/75eb476c-5d02-48f1-8cc7-17406c60e152/0-0.jpg`, scene: 'Golden Splash Cheers', model: 'Freya' },
  { url: `${BASE}/9a1d354d-f1ce-47ca-a785-08b72036008a/0-0.jpg`, scene: 'Ice-Crushed Cold Product Shot' },
  { url: `${BASE}/7cfbde91-a262-4944-a114-a8f7c3af3139/0-0.jpg`, scene: 'Sport Sun Shadow', model: 'Freya' },
  { url: `${BASE}/cd98a5ba-5bb5-494e-b524-e59b2b1256ce/0-0.jpg`, scene: 'Court Color Energy' },
  { url: '/images/showcase/brite-riviera-freya.jpg', scene: 'Riviera Pop Escape', model: 'Freya' },
  { url: `${BASE}/ec824afd-3808-42f0-b7bb-2403d63cb8f7/0-0.jpg`, scene: 'Split Citrus Balance' },
  { url: `${BASE}/51ba6ba9-16a9-4dc4-977e-680a8fba8a1f/0-0.jpg`, scene: 'Sport Sun Shadow', model: 'Zara' },
  { url: `${BASE}/b1b344a8-484e-4761-944c-935e338f0857/0-0.jpg`, scene: 'Reflected Sip' },
  { url: `${BASE}/a614397b-8444-44d7-a2f2-d48e88153afa/0-0.jpg`, scene: 'Sky Grip Pop', model: 'Zara' },
  { url: `${BASE}/4fa791b7-2020-4731-bd11-89a0156074da/0-0.jpg`, scene: 'Shopping Basket Story' },
];

const STATS = [
  { icon: Images, value: '35', label: 'Visuals Generated' },
  { icon: Clock, value: '73s', label: 'Total Time' },
  { icon: Layers, value: '18', label: 'Unique Scenes' },
];

export default function BriteShowcase() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Brite Blood Orange — Your AI Visuals | VOVV.AI"
        description="35 product visuals generated for Brite Blood Orange Energy Drink."
        noindex
      />
      <LandingNav />

      {/* Hero */}
      <section className="pt-28 pb-14 lg:pt-40 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-5">
            Prepared for Brite
          </p>
          <h1 className="text-[#0f172a] text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight mb-5">
            Your Brite Blood Orange
            <br className="hidden sm:block" />
            Visual Collection
          </h1>
          <p className="text-[#64748b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            From a single product photo, VOVV.AI generated 35 ready-to-use visuals across 18 distinct scenes — editorial, lifestyle, and product-only — in just 73 seconds.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-6 px-3"
              >
                <s.icon size={18} className="text-[#94a3b8]" />
                <span className="text-[#0f172a] text-2xl sm:text-3xl font-semibold tracking-tight">
                  {s.value}
                </span>
                <span className="text-[#94a3b8] text-xs sm:text-sm text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20"
              >
                <img
                  src={getOptimizedUrl(img.url, { quality: 50 })}
                  alt={`${img.scene}${img.model ? ` with ${img.model}` : ''}`}
                  loading={i < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium leading-tight">
                    {img.scene}
                  </p>
                  {img.model && (
                    <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">
                      Model: {img.model}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors z-10"
          >
            <X size={24} />
          </button>
          <img
            src={getOptimizedUrl(IMAGES[lightbox].url, { quality: 80 })}
            alt={IMAGES[lightbox].scene}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white text-sm font-medium">{IMAGES[lightbox].scene}</p>
            {IMAGES[lightbox].model && (
              <p className="text-white/50 text-xs mt-0.5">Model: {IMAGES[lightbox].model}</p>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="py-16 lg:py-28 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
            Ready to create yours?
          </h2>
          <p className="text-[#94a3b8] text-base sm:text-lg leading-relaxed mb-10">
            Upload one product photo and get a full visual library in minutes
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#0f172a] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
            >
              Try free now
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/discover"
              className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              Explore more examples
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
