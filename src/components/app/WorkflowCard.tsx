import { Image, Users, Ratio, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Workflow } from '@/pages/Workflows';

import imgVirtualTryOn from '@/assets/drops/drop-model-cream-bodysuit.jpg';
import imgSocialMedia from '@/assets/showcase/food-coffee-artisan.jpg';
import imgProductListing from '@/assets/showcase/skincare-serum-marble.jpg';
import imgLifestyle from '@/assets/showcase/home-candle-evening.jpg';
import imgWebsiteHero from '@/assets/showcase/fashion-dress-botanical.jpg';
import imgAdRefresh from '@/assets/showcase/fashion-blazer-street.jpg';
import imgSelfieUGC from '@/assets/drops/drop-model-pink-hoodie.jpg';
import imgFlatLay from '@/assets/templates/clothing-flatlay.jpg';
import imgSeasonal from '@/assets/showcase/food-honey-golden.jpg';
import imgBeforeAfter from '@/assets/showcase/skincare-cream-botanical.jpg';
import imgFallback from '@/assets/templates/universal-clean.jpg';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: () => void;
  isGenerating?: boolean;
}

const workflowImages: Record<string, string> = {
  'Virtual Try-On Set': imgVirtualTryOn,
  'Social Media Pack': imgSocialMedia,
  'Product Listing Set': imgProductListing,
  'Lifestyle Set': imgLifestyle,
  'Website Hero Set': imgWebsiteHero,
  'Ad Refresh Set': imgAdRefresh,
  'Selfie / UGC Set': imgSelfieUGC,
  'Flat Lay Set': imgFlatLay,
  'Seasonal Campaign Set': imgSeasonal,
  'Before & After Set': imgBeforeAfter,
};

export function WorkflowCard({ workflow, onSelect, isGenerating }: WorkflowCardProps) {
  const thumbnail = workflow.preview_image_url || workflowImages[workflow.name] || imgFallback;

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/30 overflow-hidden">
      {/* Hero image — portrait */}
      <div className="aspect-[3/4] overflow-hidden relative">
        {isGenerating ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img
            src={thumbnail}
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

        {/* Ratios + Credit cost */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Ratio className="w-2.5 h-2.5 text-muted-foreground" />
            <div className="flex gap-0.5">
              {workflow.recommended_ratios.map(ratio => (
                <span
                  key={ratio}
                  className="inline-block px-1 py-0.5 text-[9px] font-medium bg-secondary text-secondary-foreground rounded"
                >
                  {ratio}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Image className="w-2.5 h-2.5" />
            <span className="text-[9px] font-medium">
              {workflow.default_image_count} img · ~{workflow.uses_tryon ? workflow.default_image_count * 8 : workflow.default_image_count * 4} cr
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button size="sm" className="w-full rounded-full font-semibold gap-1 mt-1 text-xs h-8" onClick={onSelect}>
          Create Set
          <ArrowRight className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
