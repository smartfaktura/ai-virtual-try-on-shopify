import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const PREVIEW = (id: string) =>
  `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/${id}.jpg`;

const examples = [
  { label: 'Studio Hero',           category: 'Studio',     src: PREVIEW('1776770347820-s3qwmr') },
  { label: 'Architectural Stair',   category: 'Editorial',  src: PREVIEW('1776522769405-3v1gs0') },
  { label: 'Sunbathing Editorial',  category: 'Lifestyle',  src: PREVIEW('1776524131703-gvh4bb') },
  { label: 'Paris Curb Side',       category: 'Streetwear', src: PREVIEW('1776691907477-77vt46') },
  { label: 'Hard Shadow Hero',      category: 'Studio',     src: PREVIEW('hard-shadow-shoes-sneakers-1776008136691') },
  { label: 'Sunlit Tailored Chair', category: 'Editorial',  src: PREVIEW('1776691912818-yiu2uq') },
  { label: 'Frozen Aura',           category: 'Seasonal',   src: PREVIEW('1776018038709-gmt0eg') },
  { label: 'Coastal Camera',        category: 'Lifestyle',  src: PREVIEW('1776524128011-dcnlpo') },
  { label: 'Lounge Selfie',         category: 'Editorial',  src: PREVIEW('1776102190563-dioke2') },
  { label: 'Sunstone Wall',         category: 'Seasonal',   src: PREVIEW('1776574255634-kmhz9g') },
];

export function PhotographySceneExamples() {
  return (
    <section className="py-16 lg:py-32 bg-[#f5f5f3]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Scene library · 1600+ ready-to-use scenes
          </p>
          <h2 className="text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Every scene your store needs — already styled.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Studio, lifestyle, editorial, streetwear, and seasonal scenes built for e-commerce.
            Pick one, drop in your product, generate brand-ready visuals in minutes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {examples.map((ex) => (
            <div
              key={ex.label}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-muted/30"
            >
              <img
                src={getOptimizedUrl(ex.src, { quality: 60 })}
                alt={`AI ${ex.category.toLowerCase()} product photography example: ${ex.label}.`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/65 via-black/20 to-transparent">
                <span className="block text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                  {ex.category}
                </span>
                <span className="block text-sm text-white font-medium leading-tight mt-0.5">
                  {ex.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            to="/product-visual-library"
            className="inline-flex items-center justify-center gap-2 h-[3rem] px-7 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            Browse the full scene library
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
