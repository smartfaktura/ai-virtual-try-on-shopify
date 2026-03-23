import React, { useRef, useEffect, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
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
        modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[3/4]" : "aspect-[4/5]"
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

      {/* Recipe strip for modal */}
      {modalCompact && scene?.recipe && isVisible && (
        <div className="flex items-center justify-center gap-1 px-2 py-2 bg-muted/30">
          {scene.recipe.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Plus className="w-3 h-3 text-muted-foreground shrink-0 opacity-0 animate-fade-in" style={{ animationDelay: `${i * 0.12}s`, animationFillMode: 'forwards' }} />}
              <div
                className="w-7 h-7 rounded-md overflow-hidden shrink-0 border border-border opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 0.12}s`, animationFillMode: 'forwards' }}
              >
                <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
              </div>
            </React.Fragment>
          ))}
          <span className="text-muted-foreground text-[10px] font-bold mx-1 opacity-0 animate-fade-in" style={{ animationDelay: `${scene.recipe.length * 0.12}s`, animationFillMode: 'forwards' }}>=</span>
          <div
            className="w-7 h-7 rounded-md overflow-hidden shrink-0 border-2 border-primary/30 opacity-0 animate-fade-in"
            style={{ animationDelay: `${(scene.recipe.length + 1) * 0.12}s`, animationFillMode: 'forwards' }}
          >
            <img src={scene.recipeResult} alt="Result" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

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
