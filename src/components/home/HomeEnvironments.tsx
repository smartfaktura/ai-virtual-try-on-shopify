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
      <div className="flex flex-col items-center gap-4 pb-16 lg:pb-24 -mt-4">
        <Link
          to="/product-visual-library"
          className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-foreground text-background text-base font-semibold hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/10"
        >
          Browse the full scene library
          <ArrowRight size={16} />
        </Link>
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/60 font-medium">
          1600+ scenes · 35+ categories
        </p>
        <p className="text-sm text-muted-foreground">
          Or{' '}
          <Link to="/ai-product-photography" className="text-foreground underline-offset-4 hover:underline font-medium">
            explore AI product photography by category
          </Link>
        </p>
      </div>
    </div>
  );
}
