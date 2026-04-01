import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const videos = Array.from({ length: 10 }, (_, i) => `/videos/showcase/showcase-${i + 1}.mp4`);

export function VideoShowcaseSection() {
  return (
    <section className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          Your Products, In Motion
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          AI-generated video ads ready in minutes, not weeks.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 px-1">
        {videos.map((src, i) => (
          <div
            key={i}
            className={`aspect-[3/4] rounded-lg overflow-hidden bg-muted ${i >= 6 ? 'hidden sm:block' : ''} ${i >= 9 ? 'sm:hidden lg:block' : ''}`}
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

      <div className="flex justify-center mt-10">
        <Button asChild size="lg" className="gap-2">
          <Link to="/app/video">
            Start Creating Videos <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
