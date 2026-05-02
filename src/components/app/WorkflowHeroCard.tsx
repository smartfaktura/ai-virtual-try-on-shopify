import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';
import type { Workflow } from '@/types/workflow';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const imgFallback = getLandingAssetUrl('templates/universal-clean.jpg');

interface WorkflowHeroCardProps {
  workflow: Workflow;
  onSelect: () => void;
  displayName?: string;
}

export function WorkflowHeroCard({ workflow, onSelect, displayName }: WorkflowHeroCardProps) {
  const scene = workflowScenes[workflow.name];
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent transition-shadow duration-300 hover:shadow-xl"
    >
      <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-[10px] gap-1">
        <Sparkles className="w-3 h-3" />
        RECOMMENDED
      </Badge>

      {/* Desktop: horizontal | Mobile: stacked */}
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-[45%] aspect-[3/4] sm:aspect-auto overflow-hidden">
          {scene ? (
            <WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} compact={false} />
          ) : (
            <img
              src={getOptimizedUrl(workflow.preview_image_url || imgFallback, { quality: 70 })}
              alt={workflow.name}
              className="w-full h-full object-cover bg-muted/50"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center flex-1 p-5 sm:p-8 lg:p-10 gap-3">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {displayName || workflow.name}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
            {workflow.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['1000+ Scenes', 'Full Control', 'AI Models'].map((tag) => (
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
              className="rounded-full font-semibold gap-2 shadow-lg shadow-primary/25 px-8"
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
