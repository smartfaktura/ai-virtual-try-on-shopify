import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LazyVideo } from '@/components/ui/LazyVideo';

const videos = Array.from({ length: 8 }, (_, i) => `/videos/showcase/showcase-${i + 1}.mp4`);

export function HomeVideoShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-[-0.03em] leading-[1.1] mb-4">
            Motion that sells, from a still
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Turn any product visual into a short, on-brand video
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {videos.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted/30 shadow-md shadow-foreground/[0.04] animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <LazyVideo src={src} className="w-full h-full" />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Create a video
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
