import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pvImages } from '@/components/app/workflowAnimationData';
import type { Workflow } from '@/types/workflow';

interface WorkflowHeroCardProps {
  workflow: Workflow;
  onSelect: () => void;
  displayName?: string;
}

export function WorkflowHeroCard({ workflow, onSelect, displayName }: WorkflowHeroCardProps) {
  const [idx, setIdx] = useState(0);

  // Rotate images every 3s, cycling through sets of 3
  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 3) % pvImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const img1 = pvImages[idx % pvImages.length];
  const img2 = pvImages[(idx + 1) % pvImages.length];
  const img3 = pvImages[(idx + 2) % pvImages.length];

  const description = (workflow.description || '').replace('1000+', '1600+');

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent transition-shadow duration-300 hover:shadow-xl">
      {/* Desktop badge */}
      <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-[10px] gap-1 hidden sm:flex">
        <Sparkles className="w-3 h-3" />
        RECOMMENDED
      </Badge>

      {/* Desktop: horizontal | Mobile: stacked */}
      <div className="flex flex-col sm:flex-row sm:min-h-[380px]">
        {/* ── Collage: Mobile = 3 equal columns, Desktop = 1 large + 2 stacked ── */}
        <div className="w-full sm:w-[50%] p-3 sm:p-4">
          {/* Mobile: 3 equal columns */}
          <div className="grid grid-cols-3 gap-2 h-full sm:hidden">
            {[img1, img2, img3].map((src, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden aspect-[3/4]">
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                />
              </div>
            ))}
          </div>

          {/* Desktop: masonry-style — 1 large left + 2 stacked right */}
          <div className="hidden sm:grid grid-cols-5 gap-2.5 h-full">
            <div className="col-span-3 relative rounded-xl overflow-hidden">
              <img
                src={img1}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              />
            </div>
            <div className="col-span-2 grid grid-rows-2 gap-2.5">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={img2}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                />
              </div>
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={img3}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center flex-1 px-5 pb-5 sm:p-8 lg:p-10 gap-3">
          {/* Mobile badge — below collage, above title */}
          <Badge className="sm:hidden bg-primary text-primary-foreground text-[10px] gap-1 w-fit">
            <Sparkles className="w-3 h-3" />
            RECOMMENDED
          </Badge>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {displayName || workflow.name}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
            {description}
          </p>
          <div className="hidden sm:flex flex-wrap gap-2 pt-1">
            {['1600+ Scenes', 'Full Control', 'AI Models'].map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="pt-2">
            <Button
              size="lg"
              className="rounded-full font-semibold gap-2 shadow-lg shadow-primary/25 px-8 w-full sm:w-auto"
              onClick={onSelect}
            >
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
