import { useRef, useEffect, useState } from 'react';
import { ArrowRight, LayoutTemplate } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';
import type { Workflow } from '@/types/workflow';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

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
  comingSoon?: boolean;
  beta?: boolean;
}

export function WorkflowCardCompact({ workflow, onSelect, id, mobileCompact, modalCompact, mobileRow, displayName, subtitle, comingSoon, beta }: Props) {
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

  if (mobileRow) {
    return (
      <Card
        id={id}
        ref={ref}
        className="group overflow-hidden transition-shadow duration-300 flex flex-row border hover:shadow-lg"
      >
        {/* Thumbnail */}
        <div className="relative w-28 shrink-0 overflow-hidden">
          {scene ? (
            <WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} compact mobileCompact modalCompact />
          ) : (
            <img
              src={getOptimizedUrl(workflow.preview_image_url || imgFallback, { quality: 60 })}
              alt={workflow.name}
              className="w-full h-full object-cover bg-muted/50"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1 flex-1 p-3 justify-center">
          <h3 className="text-sm font-bold tracking-tight leading-tight">
            {displayName || workflow.name}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground leading-snug">{subtitle}</p>
          )}
          <div className="pt-1">
            <Button
              size="sm"
              className="rounded-full font-semibold gap-1 h-9 px-4 text-xs"
              onClick={onSelect}
            >
              Start
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (comingSoon) {
    return (
      <div
        id={id}
        className="relative flex flex-col items-start gap-3 rounded-xl border border-dashed border-border/60 bg-card/80 p-5 opacity-75"
      >
        <Badge variant="outline" className="absolute top-3 right-3 text-[10px] font-medium text-muted-foreground border-border/60">Coming Soon</Badge>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
          <LayoutTemplate className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{workflow.name}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{workflow.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {['Bulk generation', 'Catalog Ready'].map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card
      id={id}
      ref={ref}
      className={cn(
        "group relative overflow-hidden transition-shadow duration-300 flex flex-col",
        modalCompact ? "border-0 shadow-none" : "border hover:shadow-lg"
      )}
    >
      {beta && (
        <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-[10px]">BETA</Badge>
      )}
      {/* Thumbnail */}
      <div className={cn(
        "relative w-full overflow-hidden",
        modalCompact ? "aspect-[3/4]" : mobileCompact ? "aspect-[2/3]" : "aspect-[3/4]"
      )}>
        {scene ? (
          <WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} compact mobileCompact={mobileCompact} modalCompact={modalCompact} />
        ) : (
          <img
            src={getOptimizedUrl(workflow.preview_image_url || imgFallback, { quality: 60 })}
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
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3" title={workflow.description}>
            {workflow.description}
          </p>
        )}

        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            className={cn(
              "rounded-full font-semibold gap-1 w-full",
              modalCompact ? "h-8 px-4 text-xs" : mobileCompact ? "h-8 px-3 text-xs" : "h-8 px-5"
            )}
            onClick={onSelect}
          >
            {mobileCompact ? 'Start' : 'Start Creating'}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
