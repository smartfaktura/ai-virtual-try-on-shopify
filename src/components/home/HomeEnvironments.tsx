import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EnvironmentsMarquee } from '@/components/landing/EnvironmentShowcaseSection';

export function HomeEnvironments() {
  return (
    <div className="bg-background">
      <EnvironmentsMarquee
        eyebrow="1600+ scenes"
        title="Place your product anywhere."
        subtitle="Studio, lifestyle, editorial, streetwear, seasonal. Pick a scene and your product is dropped in instantly."
      />
      <div className="flex flex-col items-center gap-3 pb-16 lg:pb-24 -mt-4">
        <Link
          to="/product-visual-library"
          className="inline-flex items-center justify-center gap-2 h-[3rem] px-7 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
        >
          Browse the full scene library
          <ArrowRight size={14} />
        </Link>
        <p className="text-xs text-muted-foreground">1600+ scenes across 35+ categories</p>
      </div>
    </div>
  );
}
