import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { LayoutGrid, Timer, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const USER_ID = 'fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';
const BUCKET = 'workflow-previews';
const url = (jobId: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/${BUCKET}/${USER_ID}/${jobId}/0-0.jpg`;

type Img = { id: string; scene: string; category: 'Editorial' | 'Essentials' };

// Round-robin interleaved so two variants of the same scene aren't adjacent.
const IMAGES: Img[] = [
  { id: 'c0af8299-ad94-4532-85ed-daa8ef28a654', scene: 'Aesthetic Color Poolside Story', category: 'Editorial' },
  { id: '5e4ddeed-6c45-4dcf-aea0-fb36fa1f2b1c', scene: 'Aesthetic Color Resort Editorial Hero', category: 'Editorial' },
  { id: '53f4e9b5-e3f8-4d09-8f4e-5a3a89adfc43', scene: 'Aesthetic Color Sunset Resort Mood', category: 'Editorial' },
  { id: '49cdb5b7-950a-4007-98d2-94e7340f1fcd', scene: 'Aesthetic Color Towel and Fabric Story', category: 'Editorial' },
  { id: 'df3dfcaf-93ee-4d0c-810c-dc526f807470', scene: 'Architectural Stair Swim Editorial', category: 'Editorial' },
  { id: 'e3411adc-a3ef-4fd4-b95a-a2152f80d8b1', scene: 'Beach Bag and Essentials Moment', category: 'Editorial' },
  { id: '2b45ba56-e96f-481b-94a1-3db479ba938a', scene: 'City Heat Rooftop Escape', category: 'Editorial' },
  { id: '3dfa513b-d04a-407b-b51e-3cae4159fc59', scene: 'Coastal Camera Moment', category: 'Editorial' },
  { id: '77220d66-7d99-4ea4-97da-d20fd1f8018a', scene: 'Coastal Stillness Swim Frame', category: 'Editorial' },
  { id: '1db2ce16-54ce-4092-8ef1-ab576c6ab6a1', scene: 'Color-Washed Resort Wall', category: 'Editorial' },
  { id: '6838f7d5-36e4-4536-8690-e333109fefb1', scene: 'Floating Pool Product Shot', category: 'Essentials' },
  { id: '2d6f307e-08d3-4962-bfdc-5139a0bd1823', scene: 'Ghost Mannequin Shot', category: 'Essentials' },
  { id: '45c38f94-1964-4e07-aefd-0951af097873', scene: 'Jungle Drive Editorial Heat', category: 'Editorial' },
  { id: '55e4138a-5306-4672-a043-f3fdb16d754e', scene: 'Minimal Horizon Swim Editorial', category: 'Editorial' },
  { id: 'dcbba212-5a2b-4750-af08-44725bce85e0', scene: 'Movement Shot', category: 'Essentials' },
  { id: '166956b3-e7d8-4763-9359-ad58dcacc173', scene: 'On-Model Back', category: 'Essentials' },
  { id: '9ae0ac09-8a68-463e-93e2-1e8e79ce135a', scene: 'On-Model Editorial', category: 'Essentials' },
  { id: '82d267e7-700f-4ac6-afa8-3af5262cfcec', scene: 'On-Model Front', category: 'Essentials' },
  { id: 'b350968d-bca2-4d4d-ac84-9007b3b0710a', scene: 'On-Model Lifestyle', category: 'Essentials' },
  { id: '71171cb7-0b56-4bd4-b5a1-9f935ce106ed', scene: 'Palm Shadow Swim Editorial', category: 'Editorial' },
  { id: '19a44c28-dda1-43d9-ba40-6b0e39178a26', scene: 'Poolside Friend-Shot Candid', category: 'Editorial' },
  { id: '5567ab49-ae2a-4bf1-851a-41526dc38e74', scene: 'Poolside Standing Hero', category: 'Editorial' },
  { id: 'dbe1c8e0-2dfa-4667-b668-440f7e1a1e5e', scene: 'Resort Staircase Pose', category: 'Editorial' },
  { id: 'd392396d-647e-4e3d-bf89-bf0f24bc6685', scene: 'Rocky Coast Swim Editorial', category: 'Editorial' },
  { id: '936e4362-033a-4184-929e-a69ea6c2b79b', scene: 'Seated Balcony Resort Portrait', category: 'Editorial' },
  { id: 'ccedaef7-e8f1-401e-a934-fc65765fc188', scene: 'Shoreline Adjust Swim Moment', category: 'Editorial' },
  { id: '25fe6ac8-47c8-4b47-abda-42fd6c241083', scene: 'Shoreline Walk or Waterline Pause', category: 'Editorial' },
  { id: '0f39f277-5056-4044-a0e4-1ca1caf7aff2', scene: 'Shoreline Wave Contact Editorial', category: 'Editorial' },
  { id: 'f1691b19-7b4f-4b97-af30-138cc6d89e54', scene: 'Sun Lounger Resort Pose', category: 'Editorial' },
  { id: '51deb548-bd39-4a0c-81aa-7f51e4d06a18', scene: 'Sun-Dried Swimwear', category: 'Essentials' },
  { id: '5ccf0d0d-cd6c-45cb-9daf-80aaa9ac8d78', scene: 'Sunbathing Swim Editorial', category: 'Editorial' },
  { id: 'd5e1058e-4d15-412d-8cba-366c3ec732c9', scene: 'Sunlit Arch Swim Editorial', category: 'Editorial' },
  { id: '558231e4-a832-44a6-ae8f-967a3ddacd28', scene: 'Sunstone Wall Swim Editorial', category: 'Editorial' },
  { id: '774165ec-076c-4d8a-8220-3ac42fb3d6ce', scene: 'Towel Wrap After Swim', category: 'Editorial' },
  { id: '2e5806fd-7d3c-4511-88d6-666fffb00b9e', scene: 'Tropical Poolside Stillness Editorial', category: 'Editorial' },
  { id: '36d2c54c-53dd-430e-a6b7-d155ac57609e', scene: 'Walking Along Pool Edge', category: 'Editorial' },
  { id: '8d2f28ee-6461-4616-b6d5-084b03a3cf90', scene: 'Wide Frame Coastal Swim Editorial', category: 'Editorial' },
  { id: '1b55d81a-8805-4875-b33e-81d773e741a9', scene: 'Yacht Bow Swim Editorial', category: 'Editorial' },
  { id: 'cf0195ef-ca4b-4ed2-aab2-ef6cce23b651', scene: 'Yacht Deck Editorial Pose', category: 'Editorial' },
  { id: '7f5b1e98-e575-4ada-ad97-1a0253884f4e', scene: 'Yacht Sunset Swim Editorial', category: 'Editorial' },
  { id: '88b352d7-57de-452a-a3e2-9679ec81acc0', scene: 'Aesthetic Color Poolside Story', category: 'Editorial' },
  { id: 'cf9f834f-27a4-4442-8dd2-f54c0680faeb', scene: 'Aesthetic Color Resort Editorial Hero', category: 'Editorial' },
  { id: '179a43d7-2003-4337-af4c-e64772e1d903', scene: 'Aesthetic Color Sunset Resort Mood', category: 'Editorial' },
  { id: 'ee5e34fd-060c-4b47-8b34-831ee0cc8d04', scene: 'Architectural Stair Swim Editorial', category: 'Editorial' },
  { id: '37d8ccc8-4952-4e6d-9a2e-b54685ebf51c', scene: 'Beach Bag and Essentials Moment', category: 'Editorial' },
  { id: 'ef89ba18-5053-42ac-8e49-dac943114578', scene: 'City Heat Rooftop Escape', category: 'Editorial' },
  { id: '8db168bd-dece-46a0-830e-b9a1c800f96b', scene: 'Coastal Camera Moment', category: 'Editorial' },
  { id: '1348d8dd-07d8-4b78-a4ac-03231906e00a', scene: 'Coastal Stillness Swim Frame', category: 'Editorial' },
  { id: '23292ce2-3256-4019-ad92-9f9b90a5bf37', scene: 'Color-Washed Resort Wall', category: 'Editorial' },
  { id: 'a96a1650-6b58-4e3c-af67-305d2a9a73c1', scene: 'Jungle Drive Editorial Heat', category: 'Editorial' },
  { id: '3ce53e48-9f98-42cd-a589-dbcdc8db7242', scene: 'Minimal Horizon Swim Editorial', category: 'Editorial' },
  { id: 'd22879fd-63c1-4e83-a67f-54dde425a25e', scene: 'Movement Shot', category: 'Essentials' },
  { id: '71766ae1-80a7-442e-bf51-a13caa679786', scene: 'On-Model Back', category: 'Essentials' },
  { id: '7e333cbb-c137-4069-bc4b-e8e3349ca7d3', scene: 'On-Model Editorial', category: 'Essentials' },
  { id: '7b000938-ac17-4e34-bcb6-e1a7fb3eac6c', scene: 'On-Model Front', category: 'Essentials' },
  { id: 'ecc3547d-934c-4ffa-be87-d6afc4fec134', scene: 'On-Model Lifestyle', category: 'Essentials' },
  { id: '9e55ce14-d4e6-4f90-8135-1bda9123ad39', scene: 'Palm Shadow Swim Editorial', category: 'Editorial' },
  { id: '9eb4fa0e-f6bc-4cc5-941c-f407ef70e633', scene: 'Poolside Friend-Shot Candid', category: 'Editorial' },
  { id: '2b04107e-e455-457f-af0d-0f282d40dbc3', scene: 'Poolside Standing Hero', category: 'Editorial' },
  { id: 'a29538d6-2c74-40af-b174-7cd0f0784114', scene: 'Resort Staircase Pose', category: 'Editorial' },
  { id: 'b9d5fcae-65b6-4a76-af8b-7654c636f814', scene: 'Rocky Coast Swim Editorial', category: 'Editorial' },
  { id: 'b9c14f49-ef85-4dd3-a5d5-42a1a3f9dd85', scene: 'Seated Balcony Resort Portrait', category: 'Editorial' },
  { id: 'a671397a-d9fd-4f77-8a31-a5d32bc941e2', scene: 'Shoreline Adjust Swim Moment', category: 'Editorial' },
  { id: 'f4599a4c-8170-4d33-bdf3-cb2bda46c0fd', scene: 'Shoreline Walk or Waterline Pause', category: 'Editorial' },
  { id: '4d47c9eb-3a28-46b6-af03-3831dc332a3f', scene: 'Shoreline Wave Contact Editorial', category: 'Editorial' },
  { id: 'f3879548-51df-41f8-aa5c-8941d8de37cb', scene: 'Sun Lounger Resort Pose', category: 'Editorial' },
  { id: 'a708f680-03d8-4297-80ce-e65569c0eb08', scene: 'Sunbathing Swim Editorial', category: 'Editorial' },
  { id: 'ab2dfd79-2489-4a1e-8b3e-8949bb5c2d24', scene: 'Sunlit Arch Swim Editorial', category: 'Editorial' },
  { id: 'f4c41a8b-2b9f-4242-a80c-ef04857a8fab', scene: 'Sunstone Wall Swim Editorial', category: 'Editorial' },
  { id: '51cf20e6-51ab-428e-a984-bcd4d4820e14', scene: 'Towel Wrap After Swim', category: 'Editorial' },
  { id: 'd9b24a1e-be84-475f-a842-faa318ac3f65', scene: 'Tropical Poolside Stillness Editorial', category: 'Editorial' },
  { id: '440c4599-3036-4636-bd4e-df44008ed44a', scene: 'Walking Along Pool Edge', category: 'Editorial' },
  { id: '5d88a160-ca4c-4ef9-8224-d508ab02a0eb', scene: 'Wide Frame Coastal Swim Editorial', category: 'Editorial' },
  { id: '02b4ca0e-ef0f-4fa4-93c6-4e1c98d162d2', scene: 'Yacht Bow Swim Editorial', category: 'Editorial' },
  { id: '7cbf1ece-79da-4fe5-b014-3849d8edb23c', scene: 'Yacht Deck Editorial Pose', category: 'Editorial' },
  { id: 'a139769c-91c9-4ba9-bae3-8c67df4125c0', scene: 'Yacht Sunset Swim Editorial', category: 'Editorial' },
];

const STATS = [
  { icon: LayoutGrid, value: '76', label: 'Visuals' },
  { icon: Timer, value: '~3 min', label: 'Made in' },
];

export default function MakaraWearShowcase() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="A Sample Visual Library for MAKARA WEAR | VOVV.AI"
        description="A swimwear editorial drop built for MAKARA WEAR — generated by VOVV.AI from a single product photo."
        noindex
      />
      <LandingNav />

      {/* Hero */}
      <section className="pt-28 pb-14 lg:pt-40 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-5">
            For MAKARA WEAR
          </p>
          <h1 className="text-[#0f172a] text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight mb-5">
            Your swimwear, a full editorial drop
          </h1>
          <p className="text-[#64748b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            From a single product photo, VOVV.AI built this complete swim campaign — 76 visuals, ready for web, social, and lookbook
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
            {IMAGES.map((img, i) => {
              const src = url(img.id);
              return (
                <button
                  key={img.id}
                  onClick={() => setLightbox(i)}
                  className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20"
                >
                  <img
                    src={getOptimizedUrl(src, { quality: 50 })}
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
              );
            })}
          </div>
        </div>
      </section>

      {/* Mid CTA strip */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#0f172a] text-lg sm:text-xl leading-relaxed font-medium">
            Yours would look like this — but with your swimwear
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
            src={getOptimizedUrl(url(IMAGES[lightbox].id), { quality: 80 })}
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
