import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { LayoutGrid, Timer, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE =
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';

type Img = { url: string; scene: string; category: 'Editorial' | 'Essentials' };

// Interleaved across padel / tennis / clay / aesthetic / studio so adjacent cards
// alternate between court action, lifestyle, detail and on-model essentials.
const IMAGES: Img[] = [
  { url: `${BASE}/5c0e5f97-384d-4e88-897f-a290aedbf359/0-0.jpg`, scene: 'Padel Glass Wall Hero', category: 'Editorial' },
  { url: `${BASE}/7bf0ae1c-aff4-47e5-8b8f-bf99cdb7aa77/0-0.jpg`, scene: 'On-Model Front', category: 'Essentials' },
  
  { url: `${BASE}/2baf5ccc-107d-493c-aa3b-9fbb51120504/0-0.jpg`, scene: 'Clay Court Warm-Up', category: 'Editorial' },
  { url: `${BASE}/5b98ac2f-65a7-4bf0-b7d4-2e184913b3ee/0-0.jpg`, scene: 'Aesthetic Sport Hero', category: 'Editorial' },
  { url: `${BASE}/c2ca9966-2fca-4f47-98a6-17bcbebb2b7c/0-0.jpg`, scene: 'Aesthetic Set Flat Lay', category: 'Essentials' },
  { url: `${BASE}/b2b4cf95-2e9f-4ccf-9610-45cb41bad255/0-0.jpg`, scene: 'Blue Hard Court Stride', category: 'Editorial' },
  { url: `${BASE}/44936548-51a5-40a9-a690-bfb4d09e3cff/0-0.jpg`, scene: 'Court Walk Entrance', category: 'Editorial' },
  { url: `${BASE}/0c9b5bd8-26ac-45a2-87d0-2c6b97ac3eda/0-0.jpg`, scene: 'On-Model Back', category: 'Essentials' },
  { url: `${BASE}/878ae10f-6b86-4be7-95e7-679f0545b45d/0-0.jpg`, scene: 'Padel Net Volley Ready', category: 'Editorial' },
  { url: `${BASE}/7bfa6d5b-0ed0-45da-b112-ebd435eacb9a/0-0.jpg`, scene: 'Clay Court Bench Rest', category: 'Editorial' },
  { url: `${BASE}/b3ec1799-1077-4442-85fb-7eef0f3717c2/0-0.jpg`, scene: 'Terracotta Sunset', category: 'Editorial' },
  { url: `${BASE}/c94616fa-2b9e-4b20-8244-f9d9539f5c8f/0-0.jpg`, scene: 'Grass Court Volley Ready', category: 'Editorial' },
  { url: `${BASE}/72bfc0b8-312e-4995-9935-1eb4fce6625b/0-0.jpg`, scene: 'Aesthetic UGC Mirror', category: 'Editorial' },
  { url: `${BASE}/852f4419-2b96-404a-81c1-3c5524002a39/0-0.jpg`, scene: 'Body Detail Activewear Crop', category: 'Essentials' },
  { url: `${BASE}/3595dfdb-367f-4fab-8f0d-0db0db89bc29/0-0.jpg`, scene: 'Serve Prep at Baseline', category: 'Editorial' },
  { url: `${BASE}/51f878ff-6cba-423e-adfe-a0f3e123333d/0-0.jpg`, scene: 'Tennis Club Lounge', category: 'Editorial' },
  { url: `${BASE}/9c2b7eea-3dd6-4ea7-a974-0279cd250275/0-0.jpg`, scene: 'Sunlit Floor Ease', category: 'Editorial' },
  { url: `${BASE}/cdbc7d6c-939b-4d7f-9ac1-6cb17937f395/0-0.jpg`, scene: 'Blue Court Warm-Up', category: 'Editorial' },
  { url: `${BASE}/1387cc1e-3953-487b-90ae-c98bd76815cd/0-0.jpg`, scene: 'On-Model Editorial', category: 'Essentials' },
  { url: `${BASE}/a6464bd5-7440-4619-a55e-8960ee5c5486/0-0.jpg`, scene: 'Clay Court Net Lean', category: 'Editorial' },
  { url: `${BASE}/4f7f9e4d-6334-4dbf-bcf8-5a3c046e25a0/0-0.jpg`, scene: 'Aesthetic Soft Gym', category: 'Editorial' },
  { url: `${BASE}/5f341f6f-9df1-4cfc-9deb-6922be064190/0-0.jpg`, scene: 'Skatepark Golden Hour', category: 'Editorial' },
  { url: `${BASE}/92295dcb-e8f2-4f06-a047-e7959185121e/0-0.jpg`, scene: 'Blue Hard Court Serve Prep', category: 'Editorial' },
  { url: `${BASE}/16683e03-26db-4714-bf41-dc8e176a3056/0-0.jpg`, scene: 'Studio Motion Sculpt', category: 'Editorial' },
  { url: `${BASE}/ac2d3bf8-438e-49ee-8c31-a20d1f120f0e/0-0.jpg`, scene: 'Post-Match Glass Lean', category: 'Editorial' },
  
  { url: `${BASE}/15883712-24d6-4de7-b44b-a87d3e84a538/0-0.jpg`, scene: 'Clay Court Between Points', category: 'Editorial' },
  { url: `${BASE}/d508abc0-bb4c-4e53-9da3-0fc4e1ab3d76/0-0.jpg`, scene: 'Mirror UGC Fit', category: 'Editorial' },
  { url: `${BASE}/77b8e4ff-aa90-4634-b549-26751e492122/0-0.jpg`, scene: 'Tennis Court Baseline', category: 'Editorial' },
  
  { url: `${BASE}/87faf94b-fca1-4037-9616-1a1e352c4848/0-0.jpg`, scene: 'Padel Club Bench Rest', category: 'Editorial' },
  { url: `${BASE}/e383ae4f-6977-4baa-af23-29076b444883/0-0.jpg`, scene: 'Aesthetic Court Story', category: 'Editorial' },
  { url: `${BASE}/81762bb1-79a8-45a1-8101-65cf30187d3e/0-0.jpg`, scene: 'Sunlit Sculpt', category: 'Editorial' },
  { url: `${BASE}/08f1b197-5c66-4402-912c-d66c21c5c174/0-0.jpg`, scene: 'Back Glass Recovery', category: 'Editorial' },
  { url: `${BASE}/4e014379-fed1-4996-a6a7-a09d5bba5726/0-0.jpg`, scene: 'Urban Concrete', category: 'Editorial' },
  { url: `${BASE}/d218cd72-2a05-49d9-a7a6-55c0b0239d80/0-0.jpg`, scene: 'Sunlit Flow', category: 'Editorial' },
  { url: `${BASE}/32bc6a31-6069-411c-9fbc-b2d6179e27f2/0-0.jpg`, scene: 'Sunlit Active Pause', category: 'Editorial' },
  { url: `${BASE}/65627f7e-9adb-4b8d-a97d-d08d5f2c1892/0-0.jpg`, scene: 'Aesthetic Sport Portrait', category: 'Editorial' },
];

const STATS = [
  { icon: LayoutGrid, value: '37', label: 'Visuals' },
  { icon: Timer, value: '53s', label: 'Made in' },
];

export default function SixOApparelShowcase() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="A Sample Visual Library for 6o Apparel | VOVV.AI"
        description="A glimpse of what VOVV.AI could generate for 6o Apparel — built from one product photo of the Red Sports Bra and Skirt Set."
        noindex
      />
      <LandingNav />

      {/* Hero */}
      <section className="pt-28 pb-14 lg:pt-40 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-5">
            For 6o Apparel
          </p>
          <h1 className="text-[#0f172a] text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight mb-5">
            Your activewear, your full campaign
          </h1>
          <p className="text-[#64748b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Send one photo of any product — a sports bra, a tennis skirt, a jacket. We return a complete editorial library across court, studio, lifestyle and aesthetic. The sample below was built from a single shot of the Red Sports Bra and Skirt Set.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-12 lg:pb-20">
        <div className="max-w-xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-6 px-3"
              >
                <s.icon size={20} strokeWidth={1.75} className="text-[#0f172a]/70" />
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
            Ready to make this real for 6o Apparel?
          </h2>
          <p className="text-[#94a3b8] text-base sm:text-lg leading-relaxed mb-10">
            Create your account and we'll generate your full set from your own product photos
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
