import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { LayoutGrid, Timer, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Img = { url: string; scene: string };

const IMAGES: Img[] = [
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/4c16e874-dde8-44e9-922b-5fd3db442647/0-0.jpg', scene: "Platform Presentation" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/e8f44b8c-219e-4467-a14d-0f9c846bf163/0-0.jpg', scene: "Paired Objects Composition" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1e3adc14-03a9-4a8b-b707-9bb7819b45ef/0-0.jpg', scene: "Bedside or Side Table Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/90cc8e13-fbb2-496e-a3f5-a9b87fef0425/0-0.jpg', scene: "Window Light Object Portrait" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/71c5e182-4f3b-4563-a765-d646d8ec9c02/0-0.jpg', scene: "Shadow Object Hero" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/77a9f719-5a87-4c39-b83a-b420220c7c84/0-0.jpg', scene: "Coffee Table Decor Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/482f5cba-f16e-460a-9f1b-3109ca3ee39e/0-0.jpg', scene: "Dining Sideboard Styling" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/80681042-d00a-46cd-8632-573aed0e4304/0-0.jpg', scene: "Empty Space Object Hero" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/da4b0f28-2449-4d1b-9378-02974007bc36/0-0.jpg', scene: "Window Light Object Portrait" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/fcb11931-1738-4433-afca-05a058134f69/0-0.jpg', scene: "Empty Space Object Hero" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/bf6d45be-9037-455b-a744-5150c45f41e4/0-0.jpg', scene: "Platform Presentation" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/69f00a12-537e-4f80-ac9e-9014f492596a/0-0.jpg', scene: "Textile and Object Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cc6d1125-edae-4b3a-a8f1-798c9f9f8926/0-0.jpg', scene: "Coffee Table Decor Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/49fa3ca1-b537-47fa-bcac-4f954ba33d39/0-0.jpg', scene: "Console Placement Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1b5fc275-0e2b-4e5a-8d62-4d5e5d109f9c/0-0.jpg', scene: "Dining Sideboard Styling" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/37cc42e0-d805-4236-b2a3-1beafdddc992/0-0.jpg', scene: "Console Placement Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/79739dd7-69d9-4867-8954-6da6cd775d40/0-0.jpg', scene: "Shadow Object Hero" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/126c3600-2730-403d-98f6-fe779f96b643/0-0.jpg', scene: "Textile and Object Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/45fb6960-a82f-40f8-9f58-4b715a0ca25c/0-0.jpg', scene: "Bedside or Side Table Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/afeaf4c7-2a7d-4bee-a2b3-683d84d9c250/0-0.jpg', scene: "Paired Objects Composition" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3e01aaca-1802-441f-9d48-9a431241b7eb/0-0.jpg', scene: "Earthy Glow Stage" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/ac004406-4b55-4afd-95ec-86b570808f9d/0-0.jpg', scene: "Amber Glow Studio" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cda03cae-3e3a-4d54-88b5-044c573b797b/0-0.jpg', scene: "Shadow Play Studio" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/4a2d1227-07cb-4f5d-a2c2-eb27f0f0e72d/0-0.jpg', scene: "Dramatic Red Spotlight" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/332ed7c9-e5df-48e1-9058-f07ec4b9068b/0-0.jpg', scene: "Golden Radiance Product" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c8f5fe7f-447b-4fa1-886d-1d080d4bb21a/0-0.jpg', scene: "Earthy Glow Stage" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/804954db-fd7e-424f-9b02-5279bc6df689/0-0.jpg', scene: "Natural Woodscape" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0bbaeabe-0af9-4dcb-8a0f-2372c3bc62b6/0-0.jpg', scene: "Amber Glow Studio" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/e5b26758-b382-48eb-888f-dad7d954a215/0-0.jpg', scene: "Volcanic Sunset" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/93ae093e-2ae4-4f48-8a0f-73662624230e/0-0.jpg', scene: "Volcanic Sunset" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8e396545-1fba-4d04-a674-ad0ced022117/0-0.jpg', scene: "One Object Support Still" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/99dceb7b-7664-48b5-8736-418fcfe2fcf2/0-0.jpg', scene: "One Object Support Still" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/12a6b567-7b92-4764-b1b8-f2030f0c54f7/0-0.jpg', scene: "Earthy Glow Stage" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cebb3885-d240-4532-a798-9ac935813e5c/0-0.jpg', scene: "Golden Radiance Product" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/547bd0ca-557b-4e2b-8877-3a928c056488/0-0.jpg', scene: "Shadow Play Studio" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0348cfe0-ce59-4d46-91bd-faf1f6fd69c1/0-0.jpg', scene: "Reflective Floral Display" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d4f9a913-1bb2-4d67-9a16-872826da34ff/0-0.jpg', scene: "Earthy Glow Stage" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/96220e4f-6db0-4ea7-a8e8-65172f3c4fba/0-0.jpg', scene: "Dramatic Red Spotlight" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/83958568-cbf5-40bf-9688-561c22368c58/0-0.jpg', scene: "Natural Woodscape" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/fb4831b2-a712-4525-8204-c39e276618ea/0-0.jpg', scene: "Poolside Glow" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5881a4eb-7d2e-4ea2-952c-b125809a9ca8/0-0.jpg', scene: "Reflective Floral Display" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/943b472b-1640-4e28-95b7-e7174d30f5b1/0-0.jpg', scene: "Color Surface Snack Still" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5640c80d-51f4-4e35-ae6d-90b14e59e8d3/0-0.jpg', scene: "Close Face Drink Hold" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/7728cf24-1a20-404b-a33e-4a7728e0b6d8/0-0.jpg', scene: "Beach Basket Essentials" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/9af723f0-caa2-4d8e-a495-20a33517d013/0-0.jpg', scene: "Handheld Snack Hero" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2b3e834f-79e2-4137-acee-ba0d29447e77/0-0.jpg', scene: "Morning Sip Check-In" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/04ae83f9-843f-47ad-9ba2-fed9b143023b/0-0.jpg', scene: "Handheld Snack Hero" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5eafd180-1dc9-4c99-88b9-68ce7d67ea21/0-0.jpg', scene: "Sky Product Portrait" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c1a90010-f55b-45af-9b86-7fdc1d54310a/0-0.jpg', scene: "Morning Sip Check-In" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0090cd80-3262-45e7-a3da-97d6b82c5375/0-0.jpg', scene: "Dark Elegance" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/373c2ca9-104f-43f8-8b8f-bd33ebf243fd/0-0.jpg', scene: "Color Handheld Snack Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/bdd505d7-c462-404b-b252-4ae44e7dd872/0-0.jpg', scene: "Sky Product Portrait" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/aaace2ef-03fb-48e5-807a-97bdc56138a7/0-0.jpg', scene: "Close Face Drink Hold" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/28ed1205-4697-48dd-9524-4a0138dfc9d8/0-0.jpg', scene: "Dark Elegance" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/4212b1ea-391c-42c1-99a4-4e46b97a0dba/0-0.jpg', scene: "Color Surface Snack Still" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/fc7abc65-0053-4aab-9c83-054cb3d306ab/0-0.jpg', scene: "Beach Basket Essentials" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/9ba42ad4-1cf5-4cd4-9224-673ecc1abfbe/0-0.jpg', scene: "Color Handheld Snack Story" },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cb03b2d2-77ff-4e9b-8f47-fa876f47eced/0-0.jpg', scene: "Poolside Glow" },
];

const STATS = [
  { icon: LayoutGrid, value: '58', label: 'Visuals' },
  { icon: Timer, value: '~3 min', label: 'Made in' },
];

export default function ElfasNamuoseShowcase() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="A Sample Visual Library for Elfas Namuose | VOVV.AI"
        description="A product editorial drop built for Elfas Namuose — generated by VOVV.AI from a single product photo."
        noindex
      />
      <LandingNav />

      <section className="pt-28 pb-14 lg:pt-40 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-5">
            Brand example · ELFAS NAMUOSE
          </p>
          <h1 className="text-[#0f172a] text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight mb-5">
            This is what VOVV.AI makes from one product photo
          </h1>
          <p className="text-[#64748b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            A complete product visual library for Elves Behavin' Badly Jigsaw Puzzle — 58 visuals, ready for web, social, and listings
          </p>
        </div>
      </section>

      <section className="pb-12 lg:pb-20">
        <div className="max-w-xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-6 px-3">
                <s.icon size={20} strokeWidth={1.75} className="text-[#0f172a]/70" />
                <span className="text-[#0f172a] text-2xl sm:text-3xl font-semibold tracking-tight">{s.value}</span>
                <span className="text-[#94a3b8] text-xs sm:text-sm text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  alt={img.scene}
                  loading={i < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium leading-tight">{img.scene}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors z-10">
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
          </div>
        </div>
      )}

      <section className="py-16 lg:py-28 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">Want this for your brand?</h2>
          <p className="text-[#94a3b8] text-base sm:text-lg leading-relaxed mb-10">Send one product photo. We'll build the rest</p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#0f172a] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto">
              Try free now
              <ArrowRight size={16} />
            </Link>
            <Link to="/discover" className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto">
              Explore more examples
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
