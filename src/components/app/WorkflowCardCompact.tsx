import { useRef, useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';
import type { Workflow } from '@/types/workflow';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { cn } from '@/lib/utils';

const imgFallback = getLandingAssetUrl('templates/universal-clean.jpg');

interface Props {
  workflow: Workflow;
  onSelect: () => void;
  id?: string;
  mobileCompact?: boolean;
  modalCompact?: boolean;
  mobileRow?: boolean;
  displayName?: string;
  subtitle?: string;
}

export function WorkflowCardCompact({ workflow, onSelect, id, mobileCompact, modalCompact, displayName, subtitle }: Props) {
  const scene = workflowScenes[workflow.name];
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!!modalCompact);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const recipeItems = scene?.recipe ?? [];
  const totalItems = recipeItems.length;
  const staggerDelay = 0.4;

  return (
    <Card
      id={id}
      ref={ref}
      className={cn(
        "group overflow-hidden transition-shadow duration-300 flex flex-col",
        modalCompact ? "border-0 shadow-none" : "border hover:shadow-lg"
      )}
    >

      {/* Thumbnail */}
      <div className={cn(
        "relative w-full overflow-hidden",
        modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[2/3]" : "aspect-[3/4]"
      )}>
        {scene ? (
          <WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} compact mobileCompact={mobileCompact} modalCompact={modalCompact} />
        ) : (
          <img
            src={workflow.preview_image_url || imgFallback}
            alt={workflow.name}
            className="w-full h-full object-cover bg-muted/50"
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-1 flex-1", modalCompact ? "p-3" : mobileCompact ? "p-2" : "p-4")}>
        <h3 className={cn(
          "font-bold tracking-tight leading-tight",
          modalCompact ? "text-sm" : mobileCompact ? "text-[11px]" : "text-sm"
        )}>
          {displayName || workflow.name}
        </h3>

        {modalCompact && subtitle && (
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{subtitle}</p>
        )}

        {!mobileCompact && !modalCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {workflow.description}
          </p>
        )}

        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            className={cn(
              "rounded-full font-semibold gap-1 w-full",
              modalCompact ? "h-8 px-4 text-xs" : mobileCompact ? "h-6 px-2 text-[10px]" : "h-8 px-5"
            )}
            onClick={onSelect}
          >
            Start Creating
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
