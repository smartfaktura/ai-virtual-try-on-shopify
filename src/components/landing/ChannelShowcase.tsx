import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';

interface ShowcaseItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

const ITEMS: ShowcaseItem[] = [
  { id: 'garden', image: '/images/try-showcase/garden-editorial.png', title: 'Garden Editorial', subtitle: 'Botanical lifestyle shoot' },
  { id: 'tryon-1', image: '/images/try-showcase/virtual-tryon-1.png', title: 'Basketball Court', subtitle: 'Sporty outdoor editorial' },
  { id: 'cafe', image: '/images/try-showcase/cafe-lifestyle.png', title: 'Café Lifestyle', subtitle: 'Sun-drenched park editorial' },
  { id: 'golden', image: '/images/try-showcase/golden-hour.png', title: 'Golden Hour', subtitle: 'Warm outdoor portrait' },
  { id: 'studio', image: '/images/try-showcase/studio-lookbook.png', title: 'Studio Lookbook', subtitle: 'Clean e-comm on white' },
  { id: 'urban', image: '/images/try-showcase/urban-edge.png', title: 'Urban Edge', subtitle: 'Street-style stairwell shoot' },
  { id: 'tryon-2', image: '/images/try-showcase/virtual-tryon-2.png', title: 'Clean Denim Pairing', subtitle: 'E-comm product listing' },
  { id: 'pilates', image: '/images/try-showcase/pilates-studio.png', title: 'Pilates Studio', subtitle: 'Active lifestyle campaign' },
  { id: 'gallery', image: '/images/try-showcase/gallery-walk.png', title: 'Gallery Walk', subtitle: 'Art-world editorial story' },
  { id: 'home', image: '/images/try-showcase/at-home-editorial.png', title: 'At-Home Editorial', subtitle: 'Cozy living room story' },
  { id: 'studio-dark', image: '/images/try-showcase/studio-dark.png', title: 'Studio Portrait', subtitle: 'Dramatic dark backdrop' },
  { id: 'tryon-3', image: '/images/try-showcase/virtual-tryon-3.png', title: 'Back Detail Shot', subtitle: 'Product detail close-up' },
];

const LOCAL_SOURCE = '/images/source-crop-top.jpg';

export function ChannelShowcase() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            Same Product, Infinite Possibilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            One Product. Every Channel.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            One upload creates visuals for every channel and campaign.
          </p>
        </div>

        {/* Source product callout */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-20 h-20 rounded-lg border-2 border-primary/30 overflow-hidden shadow-sm">
            <ShimmerImage src={LOCAL_SOURCE} alt="White Crop-Top product" className="w-full h-full object-cover" aspectRatio="1/1" loading="lazy" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Your Product</p>
            <p className="text-xs text-muted-foreground">White Crop-Top · Flat Lay</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {ITEMS.map(item => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="relative">
                <ShimmerImage
                  src={item.image}
                  alt={item.title}
                  className="w-full aspect-square object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  aspectRatio="1/1"
                  loading="lazy"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Ready to create yours?
          </h3>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Upload your product and generate professional visuals like these in seconds.
          </p>
          <Button asChild size="lg" className="mt-6 text-base px-8 py-6 rounded-full shadow-lg">
            <Link to="/auth">
              Start Creating for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
