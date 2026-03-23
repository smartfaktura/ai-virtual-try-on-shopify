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
  /** True when rendered inside the mobile 2-col grid */
  mobileCompact?: boolean;
  /** True when rendered inside a modal - uses shorter aspect ratio */
  modalCompact?: boolean;
}

export function WorkflowCardCompact({ workflow, onSelect, id, mobileCompact, modalCompact }: Props) {
  const scene = workflowScenes[workflow.name];
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <Card
      id={id}
      ref={ref}
      className={cn(
        "group overflow-hidden transition-shadow duration-300 flex flex-col",
        modalCompact ? "border-0 shadow-none" : "border hover:shadow-lg"
      )}
    >
      {/* Thumbnail — taller on mobile 2-col for breathing room */}
      <div className={cn(
        "relative w-full overflow-hidden",
        modalCompact ? "aspect-square" : mobileCompact ? "aspect-[2/3]" : "aspect-[3/4]"
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
      <div className={cn("flex flex-col gap-2 flex-1", (modalCompact || mobileCompact) ? "p-2" : "p-4")}>
        <h3 className={cn(
          "font-bold tracking-tight leading-tight",
          (modalCompact || mobileCompact) ? "text-xs" : "text-sm"
        )}>
          {workflow.name}
        </h3>

        {!mobileCompact && !modalCompact && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {workflow.description}
          </p>
        )}

        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            className={cn(
              "rounded-full font-semibold gap-1.5 w-full",
              (modalCompact || mobileCompact) ? "h-7 px-3 text-xs" : "h-8 px-5"
            )}
            onClick={onSelect}
          >
            Create Set
            <ArrowRight className={mobileCompact ? "w-3 h-3" : "w-3.5 h-3.5"} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
