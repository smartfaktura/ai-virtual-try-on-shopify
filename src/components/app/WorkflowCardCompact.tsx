import { useRef, useEffect, useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';
import type { Workflow } from '@/types/workflow';
import { getLandingAssetUrl } from '@/lib/landingAssets';

const imgFallback = getLandingAssetUrl('templates/universal-clean.jpg');

interface Props {
  workflow: Workflow;
  onSelect: () => void;
  id?: string;
}

export function WorkflowCardCompact({ workflow, onSelect, id }: Props) {
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
      className="group overflow-hidden border hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      {/* Square thumbnail */}
      <div className="relative w-full aspect-square overflow-hidden">
        {scene ? (
          <WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} />
        ) : (
          <img
            src={workflow.preview_image_url || imgFallback}
            alt={workflow.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold tracking-tight leading-tight">
            {workflow.name}
          </h3>
          {workflow.uses_tryon && workflow.name !== 'Selfie / UGC Set' && (
            <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0">
              <Users className="w-2.5 h-2.5" />
              Try-On
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {workflow.description}
        </p>

        <div className="pt-1 mt-auto">
          <Button
            size="sm"
            className="rounded-full font-semibold gap-1.5 h-8 px-5 w-full"
            onClick={onSelect}
          >
            Create Set
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
