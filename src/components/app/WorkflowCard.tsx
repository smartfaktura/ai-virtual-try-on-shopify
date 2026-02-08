import { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';
import { SocialMediaGridThumbnail } from '@/components/app/SocialMediaGridThumbnail';
import { HeroBannerThumbnail } from '@/components/app/HeroBannerThumbnail';
import type { Workflow } from '@/pages/Workflows';

import imgFallback from '@/assets/templates/universal-clean.jpg';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: () => void;
  isGenerating?: boolean;
  autoPlay?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export function WorkflowCard({ workflow, onSelect, isGenerating, autoPlay, onHoverChange }: WorkflowCardProps) {
  const scene = workflowScenes[workflow.name];
  const [isHovered, setIsHovered] = useState(false);

  const isActive = autoPlay ? (isHovered || autoPlay) : isHovered;

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/30 overflow-hidden">
      {/* Hero image — portrait */}
      <div
        className="aspect-[3/4] overflow-hidden relative"
        onMouseEnter={() => { setIsHovered(true); onHoverChange?.(true); }}
        onMouseLeave={() => { setIsHovered(false); onHoverChange?.(false); }}
      >
        {isGenerating ? (
          <Skeleton className="w-full h-full" />
        ) : workflow.name === 'Social Media Pack' ? (
          <SocialMediaGridThumbnail isActive={isActive} />
        ) : scene ? (
          <WorkflowAnimatedThumbnail scene={scene} isActive={isActive} />
        ) : (
          <img
            src={workflow.preview_image_url || imgFallback}
            alt={workflow.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <CardContent className="p-4 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-semibold text-xs leading-tight">{workflow.name}</h3>
          {workflow.uses_tryon && (
            <Badge variant="secondary" className="text-[10px] gap-0.5 shrink-0 px-1.5 py-0">
              <Users className="w-2.5 h-2.5" />
              Try-On
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {workflow.description}
        </p>

        {/* CTA */}
        <Button size="sm" className="w-full rounded-full font-semibold gap-1 mt-1 text-xs h-8" onClick={onSelect}>
          Create Set
          <ArrowRight className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
