import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const videos = Array.from({ length: 10 }, (_, i) => `/videos/showcase/showcase-${i + 1}.mp4`);

export function VideoShowcaseSection() {
  return (
    <section className="py-16 lg:py-32 bg-background overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Video
          </p>
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
            Your products, in motion
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            AI-generated video ads ready in minutes, not weeks.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {videos.map((src, i) => (
            <div
              key={i}
              className={`aspect-[3/4] rounded-2xl overflow-hidden bg-muted shadow-md shadow-foreground/[0.04] ${i >= 6 ? 'hidden sm:block' : ''} ${i >= 9 ? 'sm:hidden lg:block' : ''}`}
            >
              <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 mt-12 lg:mt-16">
          <Button asChild size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
            <Link to="/app/video">
              Start Creating Videos <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Free to start · No card required
          </p>
        </div>
      </div>
    </section>
  );
}
