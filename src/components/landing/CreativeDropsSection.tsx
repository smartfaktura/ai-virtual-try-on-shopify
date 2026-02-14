import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Calendar, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getLandingAssetUrl } from '@/lib/landingAssets';

const whiteCropTop = getLandingAssetUrl('drops/drop-model-white-crop.jpg');

const drops = [
  {
    month: 'November Drop',
    count: '16 visuals · Pilates Studio',
    thumbnails: [
      getLandingAssetUrl('drops/drop-nov-portrait-1.jpg'),
      getLandingAssetUrl('drops/drop-nov-portrait-2.jpg'),
      getLandingAssetUrl('drops/drop-nov-portrait-3.jpg'),
    ],
    overflow: 13,
    opacity: 'opacity-100',
    status: 'Delivered',
  },
  {
    month: 'September Drop',
    count: '20 visuals · Autumn Collection',
    thumbnails: [
      getLandingAssetUrl('drops/drop-sept-portrait-1.jpg'),
      getLandingAssetUrl('drops/drop-sept-portrait-2.jpg'),
      getLandingAssetUrl('drops/drop-sept-portrait-3.jpg'),
    ],
    overflow: 17,
    opacity: 'opacity-80',
    status: 'Delivered',
  },
  {
    month: 'June Drop',
    count: '20 visuals · Summer Campaign',
    thumbnails: [
      getLandingAssetUrl('drops/drop-june-portrait-1.jpg'),
      getLandingAssetUrl('drops/drop-june-portrait-2.jpg'),
      getLandingAssetUrl('drops/drop-june-portrait-3.jpg'),
    ],
    overflow: 17,
    opacity: 'opacity-60',
    status: 'Delivered',
  },
];

const bullets = [
  'Choose your products once',
  'Pick your visual workflows',
  'Fresh visuals arrive every month',
];

export function CreativeDropsSection() {
  const navigate = useNavigate();

  return (
    <section id="creative-drops" className="py-20 sm:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
              Your Visuals. Updated Automatically.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Schedule monthly Creative Drops and receive fresh visuals for your products — without doing anything.
            </p>

            <ul className="space-y-4 mb-10">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {bullet}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
              onClick={() => navigate('/auth')}
            >
              Set Up Monthly Creative Drops
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right: Timeline of drops */}
          <div className="flex justify-center">
            <div className="w-full max-w-md space-y-3">
              {/* Scheduled product card */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-3 flex items-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                   <ShimmerImage
                     src={whiteCropTop}
                     alt="White Crop Top"
                     className="w-full h-full object-cover object-top"
                     aspectRatio="1/1"
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">White Crop Top</p>
                  <p className="text-[11px] text-muted-foreground">Scheduled for monthly drops</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-primary">Active</span>
                </div>
              </div>

              {/* Next drop indicator */}
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2 px-1">
                <Clock className="w-4 h-4" />
                Next drop in 12 days
              </div>

              {drops.map((drop) => (
                <div
                  key={drop.month}
                  className={`rounded-2xl border border-border bg-card shadow-sm overflow-hidden ${drop.opacity} transition-opacity`}
                >
                  <div className="p-3 border-b border-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{drop.month}</p>
                      <p className="text-[11px] text-muted-foreground">{drop.count}</p>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{drop.status}</span>
                  </div>
                  <div className="p-2">
                    <div className="flex gap-1.5">
                      {drop.thumbnails.map((thumb, i) => (
                        <div key={i} className="rounded-md overflow-hidden border border-border flex-1">
                           <ShimmerImage
                             src={thumb}
                             alt="Campaign visual"
                             className="w-full h-28 object-cover object-top"
                             aspectRatio="4/3"
                           />
                        </div>
                      ))}
                      {/* Overflow indicator */}
                      <div className="rounded-md border border-border flex-1 bg-muted/40 flex items-center justify-center min-h-[7rem]">
                        <span className="text-sm font-semibold text-muted-foreground">
                          +{drop.overflow}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
