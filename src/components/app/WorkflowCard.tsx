import { useRef, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';
import type { Workflow } from '@/types/workflow';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { cn } from '@/lib/utils';

const imgFallback = getLandingAssetUrl('templates/universal-clean.jpg');

interface WorkflowRowProps {
  workflow: Workflow;
  onSelect: () => void;
  reversed?: boolean;
  id?: string;
  comingSoon?: boolean;
  beta?: boolean;
}

const featureMap: Record<string, string[]> = {
  'Virtual Try-On Set': [
    'AI-powered virtual try-on on real models',
    '30+ diverse models & 30+ curated scenes to choose from',
    'Professional editorial-quality results',
    'All aspect ratios supported — portrait, square & landscape',
  ],
  'Product Listing Set': [
    '30+ diverse scenes from white studio to lifestyle & beyond',
    'Category-aware lighting and composition',
    '1 click to generate multiple images',
    'Optimized for Amazon, Shopify & social commerce',
  ],
  'Selfie / UGC Set': [
    'Authentic user-generated content style',
    'Natural, lifestyle-oriented compositions',
    'Perfect for social proof & testimonials',
    'Realistic selfie & candid angles',
  ],
  'Flat Lay Set': [
    'Curated top-down product arrangements',
    'Stylized with complementary props',
    'Instagram-ready compositions',
    'Multi-product showcase layouts',
  ],
  'Mirror Selfie Set': [
    'Realistic mirror selfie compositions with phone visible',
    'Diverse room and mirror environments to choose from',
    'Identity-preserved model with your product',
    'All aspect ratios supported',
  ],
  'Interior / Exterior Staging': [
    'Transform empty rooms into fully staged interiors',
    'Enhance building exteriors with curb appeal & landscaping',
    '12 design styles — Modern, Japandi, Scandinavian & more',
    'Strict architectural preservation — windows, doors, angles unchanged',
    'Optional wall color and flooring customization',
  ],
  'Image Upscaling': [
    'AI-powered 2K & 4K resolution enhancement',
    'Face recovery & texture sharpening',
    'Works with any product or uploaded image',
    '10 credits for 2K, 15 credits for 4K',
  ],
  'Picture Perspectives': [
    'Generate close-up, back, side & wide angles from any picture',
    'Strict identity preservation — no hallucinated details',
    'High quality Pro model for maximum fidelity',
    'All aspect ratios supported — portrait, square & landscape',
  ],
};

export function WorkflowCard({ workflow, onSelect, reversed, id, comingSoon }: WorkflowRowProps) {
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

  const features = featureMap[workflow.name] ?? [];

  if (comingSoon) {
    return (
      <div
        id={id}
        className="relative flex flex-col items-start gap-4 rounded-xl border border-dashed border-border/60 bg-card/80 p-6 opacity-75"
      >
        <Badge variant="outline" className="absolute top-4 right-4 text-[10px] font-medium text-muted-foreground border-border/60">Coming Soon</Badge>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
          <LayoutTemplate className="h-5 w-5" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-foreground">{workflow.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{workflow.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {['Bulk generation', 'Matrix mode', 'Multi-product'].map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card
      id={id}
      ref={ref}
      className="group overflow-hidden border hover:shadow-lg transition-shadow duration-300"
    >
      <div
        className={`flex flex-col lg:flex-row ${reversed ? 'lg:flex-row-reverse' : ''}`}
      >
        {/* Thumbnail side */}
        <div className="relative w-full lg:w-[45%] shrink-0">
          <div className="aspect-square lg:aspect-[3/4] overflow-hidden">
            {scene ? (
              <WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} />
            ) : (
              <img
                src={getOptimizedUrl(workflow.preview_image_url || imgFallback, { quality: 60 })}
                alt={workflow.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Content side */}
        <div className="flex flex-col justify-center gap-4 p-6 lg:p-10 flex-1">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
            {workflow.name}
          </h2>

          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
            {workflow.description}
          </p>

          {features.length > 0 && (
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="pt-2">
            <Button
              size="lg"
              className="rounded-full font-semibold gap-2 h-11 px-8"
              onClick={onSelect}
            >
              Create Set
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
