import { useRef, useEffect, useState } from 'react';
import { Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkflowAnimatedThumbnail } from '@/components/app/WorkflowAnimatedThumbnail';
import { workflowScenes } from '@/components/app/workflowAnimationData';
import type { Workflow } from '@/types/workflow';
import { getLandingAssetUrl } from '@/lib/landingAssets';

const imgFallback = getLandingAssetUrl('templates/universal-clean.jpg');

interface WorkflowRowProps {
  workflow: Workflow;
  onSelect: () => void;
  reversed?: boolean;
}

const featureMap: Record<string, string[]> = {
  'Virtual Try-On Set': [
    'AI-powered virtual try-on on real models',
    '30+ diverse models & 30+ curated scenes to choose from',
    'Professional editorial-quality results',
    'All aspect ratios supported — portrait, square & landscape',
  ],
  'Product Listing Set': [
    '30 diverse scenes from white studio to lifestyle & beyond',
    'Category-aware lighting and composition',
    'No people — pure product focus',
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
};

export function WorkflowCard({ workflow, onSelect, reversed }: WorkflowRowProps) {
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

  return (
    <Card
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
                src={workflow.preview_image_url || imgFallback}
                alt={workflow.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Content side */}
        <div className="flex flex-col justify-center gap-4 p-6 lg:p-10 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
              {workflow.name}
            </h2>
            {workflow.uses_tryon && (
              <Badge variant="secondary" className="text-xs gap-1 px-2.5 py-0.5">
                <Users className="w-3 h-3" />
                Try-On
              </Badge>
            )}
          </div>

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
