import { Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TryOnAnimatedThumbnail } from '@/components/app/TryOnAnimatedThumbnail';
import type { Workflow } from '@/pages/Workflows';

import imgVirtualTryOn from '@/assets/workflows/workflow-virtual-tryon.jpg';
import imgSocialMedia from '@/assets/workflows/workflow-social-media.jpg';
import imgProductListing from '@/assets/workflows/workflow-product-listing.jpg';
import imgLifestyle from '@/assets/workflows/workflow-lifestyle.jpg';
import imgWebsiteHero from '@/assets/workflows/workflow-website-hero.jpg';
import imgAdRefresh from '@/assets/workflows/workflow-ad-refresh.jpg';
import imgSelfieUGC from '@/assets/workflows/workflow-selfie-ugc.jpg';
import imgFlatLay from '@/assets/workflows/workflow-flat-lay.jpg';
import imgSeasonal from '@/assets/workflows/workflow-seasonal.jpg';
import imgBeforeAfter from '@/assets/workflows/workflow-before-after.jpg';
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

const IS_TRYON_ANIMATED = 'Virtual Try-On Set';

export function WorkflowCard({ workflow, onSelect, isGenerating }: WorkflowCardProps) {
  const thumbnail = workflow.preview_image_url || workflowImages[workflow.name] || imgFallback;
  const isAnimatedTryOn = workflow.name === IS_TRYON_ANIMATED;

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/30 overflow-hidden">
      {/* Hero image — portrait */}
      <div className="aspect-[3/4] overflow-hidden relative">
        {isGenerating ? (
          <Skeleton className="w-full h-full" />
        ) : isAnimatedTryOn ? (
          <TryOnAnimatedThumbnail />
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


        {/* CTA */}
        <Button size="sm" className="w-full rounded-full font-semibold gap-1 mt-1 text-xs h-8" onClick={onSelect}>
          Create Set
          <ArrowRight className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
