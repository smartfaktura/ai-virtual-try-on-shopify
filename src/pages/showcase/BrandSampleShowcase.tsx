import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Clock, Images, Layers, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews';

type Img = { url: string; scene: string; category: 'Editorial' | 'Essentials' };

// Interleaved (Editorial / Essentials) so the grid feels mixed, not grouped.
const IMAGES: Img[] = [
  { url: `${BASE}/1776688400941-q8cin9.jpg`, scene: 'Front Portrait Dress Hero', category: 'Editorial' },
  { url: `${BASE}/1776688402417-ejlbft.jpg`, scene: 'Ghost Mannequin Shot', category: 'Essentials' },
  { url: `${BASE}/1776689322212-9lsvah.jpg`, scene: 'Super Editorial Campaign', category: 'Editorial' },
  { url: `${BASE}/1776688965090-edaogg.jpg`, scene: 'On-Model Front', category: 'Essentials' },
  { url: `${BASE}/1776689318257-yahkye.jpg`, scene: 'Flash Night Fashion Campaign', category: 'Editorial' },
  { url: `${BASE}/1776688401695-jqz1lj.jpg`, scene: 'Front View Flat Lay', category: 'Essentials' },
  { url: `${BASE}/1776688403670-i0t3r6.jpg`, scene: 'Golden Coast Dress', category: 'Editorial' },
  { url: `${BASE}/1776688963595-j220mh.jpg`, scene: 'On-Model Back', category: 'Essentials' },
  { url: `${BASE}/1776689319922-8yiolc.jpg`, scene: 'Old Money Outdoor Portrait', category: 'Editorial' },
  { url: `${BASE}/1776688964471-eu2q1w.jpg`, scene: 'On-Model Editorial', category: 'Essentials' },
  { url: `${BASE}/1776688418783-twv612.jpg`, scene: 'Seaside Terrace Dress', category: 'Editorial' },
  { url: `${BASE}/1776688962670-9gfjjt.jpg`, scene: 'Movement Shot', category: 'Essentials' },
  { url: `${BASE}/1776688422095-zu7d6c.jpg`, scene: 'Shadowed Wall Evening', category: 'Editorial' },
  { url: `${BASE}/1776688427092-tt9bum.jpg`, scene: 'Texture Detail', category: 'Essentials' },
  { url: `${BASE}/1776689317300-luvmhd.jpg`, scene: 'Flash Glamour Portrait', category: 'Editorial' },
  { url: `${BASE}/1776689321496-nclkyc.jpg`, scene: 'Side Lean Attitude Pose', category: 'Editorial' },
  { url: `${BASE}/1776689316419-90khdg.jpg`, scene: 'Desert Tailored Walk', category: 'Editorial' },
  { url: `${BASE}/1776689319074-0908hd.jpg`, scene: 'Luxury Door Statement', category: 'Editorial' },
  { url: `${BASE}/1776689320622-0lnst1.jpg`, scene: 'Power Mirror Statement Selfie', category: 'Editorial' },
  { url: `${BASE}/1776688404914-wwy92r.jpg`, scene: 'Mini Dress Studio Look', category: 'Editorial' },
  { url: `${BASE}/1776688411543-89ys3f.jpg`, scene: 'Open-Back Pose', category: 'Editorial' },
  { url: `${BASE}/1776688415791-80vl3l.jpg`, scene: 'Renaissance Dress', category: 'Editorial' },
  { url: `${BASE}/1776688414572-szxxt3.jpg`, scene: 'Quiet Luxury Residential Street', category: 'Editorial' },
  { url: `${BASE}/1776688399076-0n2cku.jpg`, scene: 'Dusk Stone Dress', category: 'Editorial' },
  { url: `${BASE}/1776688426422-2njaxi.jpg`, scene: 'Sunlit Sheer Knit', category: 'Editorial' },
  { url: `${BASE}/1776688417308-bhyzj1.jpg`, scene: 'Roman Fountain Noon', category: 'Editorial' },
  { url: `${BASE}/1776688420397-yz4gq0.jpg`, scene: 'Seated Dress Legline Portrait', category: 'Editorial' },
  { url: `${BASE}/1776688413055-z73arv.jpg`, scene: 'Quiet Luxury Museum Staircase', category: 'Editorial' },
  { url: `${BASE}/1776688423793-2i75mh.jpg`, scene: 'Side Profile Dress Study', category: 'Editorial' },
  { url: `${BASE}/1776688425138-l3h7za.jpg`, scene: 'Standing Dress Leg Accent', category: 'Editorial' },
];

const STATS = [
  { icon: Images, value: '30', label: 'Visuals' },
  { icon: Clock, value: '~60s', label: 'Made in' },
  { icon: Layers, value: '2', label: 'Scene Sets' },
];

export default function BrandSampleShowcase() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="A Sample Visual Library for Your Brand | VOVV.AI"
        description="A glimpse of what VOVV.AI could generate for your brand — built from our Dresses scene library."
        noindex
      />
      <LandingNav />

      {/* Hero */}
      <section className="pt-28 pb-14 lg:pt-40 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-5">
            For your brand
          </p>
          <h1 className="text-[#0f172a] text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight mb-5">
            Your product, your full campaign
          </h1>
          <p className="text-[#64748b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Send one photo of anything — a dress, a hat, an energy drink, a sofa. We return a complete editorial library. The sample below was built for a dress brand.
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
      <section className="pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20"
              >
                <img
                  src={getOptimizedUrl(img.url, { quality: 50 })}
                  alt={`${img.scene} — ${img.category}`}
                  loading={i < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium leading-tight">
                    {img.scene}
                  </p>
                  <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">
                    {img.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mid CTA strip */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#0f172a] text-lg sm:text-xl leading-relaxed font-medium">
            Yours would look like this — but with your products
          </p>
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
            <p className="text-white/50 text-xs mt-0.5">{IMAGES[lightbox].category}</p>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <section className="py-16 lg:py-28 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
            Want this for your brand?
          </h2>
          <p className="text-[#94a3b8] text-base sm:text-lg leading-relaxed mb-10">
            Send one product photo. We'll build the rest
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
