import { Image, Users, Ratio, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Workflow } from '@/pages/Workflows';

import imgAdRefresh from '@/assets/showcase/fashion-blazer-street.jpg';
import imgProductListing from '@/assets/showcase/skincare-serum-marble.jpg';
import imgWebsiteHero from '@/assets/showcase/fashion-dress-botanical.jpg';
import imgLifestyle from '@/assets/showcase/home-candle-evening.jpg';
import imgOnModel from '@/assets/showcase/fashion-activewear-studio.jpg';
import imgSocialMedia from '@/assets/showcase/food-coffee-artisan.jpg';
import imgFallback from '@/assets/templates/universal-clean.jpg';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: () => void;
}

const workflowImages: Record<string, string> = {
  'Ad Refresh Set': imgAdRefresh,
  'Product Listing Set': imgProductListing,
  'Website Hero Set': imgWebsiteHero,
  'Lifestyle Set': imgLifestyle,
  'On-Model Set': imgOnModel,
  'Social Media Pack': imgSocialMedia,
};

export function WorkflowCard({ workflow, onSelect }: WorkflowCardProps) {
  const thumbnail = workflowImages[workflow.name] || imgFallback;

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/30 overflow-hidden">
      {/* Hero image */}
      <div className="aspect-[16/9] overflow-hidden">
        <img
          src={thumbnail}
          alt={workflow.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm">{workflow.name}</h3>
          <div className="flex items-center gap-2">
            {workflow.uses_tryon && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Users className="w-3 h-3" />
                Try-On
              </Badge>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Image className="w-3 h-3" />
              <span className="text-xs">{workflow.default_image_count}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {workflow.description}
        </p>

        {/* Ratios + CTA */}
        <div className="flex items-center justify-between pt-1">
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

          <Button size="sm" variant="ghost" className="gap-1 text-xs h-8" onClick={onSelect}>
            Create
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
