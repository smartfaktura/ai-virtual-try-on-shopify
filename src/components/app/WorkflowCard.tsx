import { Image, Users, Ratio, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Workflow } from '@/pages/Workflows';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: () => void;
}

const workflowIcons: Record<string, string> = {
  'Ad Refresh Set': '📢',
  'Product Listing Set': '🏷️',
  'Website Hero Set': '🖥️',
  'Lifestyle Set': '🌿',
  'On-Model Set': '👤',
  'Social Media Pack': '📱',
};

export function WorkflowCard({ workflow, onSelect }: WorkflowCardProps) {
  const icon = workflowIcons[workflow.name] || '📸';

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/30">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-semibold text-sm">{workflow.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Image className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{workflow.default_image_count} images</span>
              </div>
            </div>
          </div>
          {workflow.uses_tryon && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Users className="w-3 h-3" />
              Try-On
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {workflow.description}
        </p>

        {/* Ratios */}
        <div className="flex items-center gap-1.5">
          <Ratio className="w-3 h-3 text-muted-foreground" />
          <div className="flex gap-1">
            {workflow.recommended_ratios.map(ratio => (
              <span
                key={ratio}
                className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground rounded"
              >
                {ratio}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button className="w-full" size="sm" onClick={onSelect}>
          Create Visual Set
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
