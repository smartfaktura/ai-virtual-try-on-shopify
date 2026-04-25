
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface EnvironmentCard {
  name: string;
  image: string;
}

const e = (name: string, file: string): EnvironmentCard => ({ name, image: getOptimizedUrl(getLandingAssetUrl(`poses/${file}`), { quality: 60 }) });
const d = (name: string, url: string): EnvironmentCard => ({ name, image: getOptimizedUrl(url, { quality: 60 }) });

const SB = 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/freestyle-images/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';

const ROW_1: EnvironmentCard[] = [
  d('Earthy Woodland Product', `${SB}/ccfaf5c8-f294-4f0b-a18e-8a9ff48cf1bb.png`),
  d('Poolside Chic', `${SB}/a804af9e-f6a1-4ff7-81aa-74a299f5307b.png`),
  d('Natural Light Loft', `${SB}/eee672dd-628e-4e22-a0b6-2e49a9411353.png`),
  d('Salt Flat Serenity', `${SB}/04bdae15-0326-4e58-98f8-ffecb6574008.png`),
  d('Brutalist Urban Steps', `${SB}/0682905a-1a17-46cd-a0d8-33fc40ee422e.png`),
  d('Amber Glow Studio', `${SB}/91418be3-6c16-4573-b97b-8c757b37a792.png`),
  d('Urban Dusk Portrait', `${SB}/171d852b-2a0b-4989-8143-bbd2c6ce90f1.png`),
  d('Coastal Horizon', `${SB}/f8d2cb64-cf02-4766-9517-79aa3b62d35f.png`),
  d('Velvet Draped Elegance', `${SB}/517a024e-ecff-4c67-a63e-88baeb958f7a.png`),
  e('Studio Movement', 'pose-studio-movement.jpg'),
];

const ROW_2: EnvironmentCard[] = [
  d('Greenhouse Elegance', `${SB}/8accd42f-72de-482c-a0e2-5ac2f0162f74.jpg`),
  d('Sunlit Botanical Surface', `${SB}/d576a95a-5d0a-4768-b8b6-62c8f9a5d240.png`),
  d('Frozen Aura', `${SB}/2f6bb14f-fe0b-4d06-9aa9-a318a8fd39fd.png`),
  d('Marble Console Vignette', `${SB}/84f7f8e7-6535-4a4c-8008-854f3906b5b5.png`),
  d('Dynamic Water Splash', `${SB}/baebb27e-f66f-4968-95d1-0ce7e21a84e4.png`),
  d('Frozen Product', `${SB}/6c8fd139-0a5b-4b27-a861-c5c7cb1adc78.png`),
  d('Amber Glow Studio', `${SB}/91418be3-6c16-4573-b97b-8c757b37a792.png`),
  d('Prism Glow Showcase', `${SB}/5f8adc87-03b4-4238-827a-fd0ec79c4695.png`),
  d('Urban Motion', `${SB}/4c1ee736-0e5e-475c-a5a2-06492f472c33.jpg`),
  d('Stadium Seating Fashion', `${SB}/f5122391-5b70-4b6b-9d61-be96e27d376f.jpg`),
  d('Desert Horizon', `${SB}/9dca223b-3e30-4f21-8d3c-41cd5f790208.png`),
  d('Fisheye Portrait', `${SB}/0544388b-9cb9-4a2d-b101-c8c85640e67e.png`),
];

function MarqueeRow({ items, direction = 'left', durationSeconds = 100 }: { items: EnvironmentCard[]; direction?: 'left' | 'right'; durationSeconds?: number }) {
  const tripled = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, hsl(var(--background)), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 lg:w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }} />
      <div
        className="flex gap-4"
        style={{
          width: 'max-content',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          animation: `marquee-${direction} ${durationSeconds}s linear infinite`,
        }}
      >
        {tripled.map((env, i) => (
          <div key={`${env.name}-${i}`} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="w-36 h-48 sm:w-44 sm:h-56 lg:w-52 lg:h-64 rounded-2xl overflow-hidden shadow-md shadow-foreground/[0.04] bg-card">
              <ShimmerImage
                src={env.image}
                alt={env.name}
                loading="lazy"
                className="w-full h-full object-cover"
                decoding="async"
                aspectRatio="3/4"
              />
            </div>
            <span className="text-[11px] tracking-wide text-muted-foreground">{env.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EnvironmentsMarqueeProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function EnvironmentsMarquee({
  eyebrow = '30+ scenes',
  title = 'Every environment. One click.',
  subtitle = 'Studio, lifestyle, editorial, streetwear — place your products in any setting instantly.',
}: EnvironmentsMarqueeProps = {}) {
  return (
    <section className="py-16 lg:py-32 bg-background overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 mb-12 lg:mb-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            {eyebrow}
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <MarqueeRow items={ROW_1} direction="left" durationSeconds={100} />
        <MarqueeRow items={ROW_2} direction="right" durationSeconds={110} />
      </div>
    </section>
  );
}

export function EnvironmentShowcaseSection() {
  return <EnvironmentsMarquee />;
}
