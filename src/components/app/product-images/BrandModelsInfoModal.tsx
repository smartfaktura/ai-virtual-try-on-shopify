import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';
import { ShimmerImage } from '@/components/ui/shimmer-image';

const ELIGIBLE_PLANS = new Set(['growth', 'pro', 'enterprise']);

export const BRAND_MODEL_THUMBNAILS = [
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/scratch-uploads/models/model_011-1776096967441.png?width=360&height=480&quality=72&resize=cover',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/scratch-uploads/models/model_016-1776096975176.png?width=360&height=480&quality=72&resize=cover',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/scratch-uploads/models/model_063-1776097161032.png?width=360&height=480&quality=72&resize=cover',
];

const FEATURES = [
  'Create via guided wizard or upload your own reference images',
  'Any ethnicity, age, gender, or body type',
  'Reuse them across every campaign',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandModelsInfoModal({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { plan, openBuyModal } = useCredits();
  const canCreate = ELIGIBLE_PLANS.has(plan);

  const handlePrimary = () => {
    onOpenChange(false);
    if (canCreate) {
      navigate('/app/models');
    } else {
      openBuyModal('brand-models-gate');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg w-[calc(100%-2rem)] p-6 sm:p-8 rounded-xl">

        {/* Mini thumbnails */}
        <div className="flex items-center justify-center mt-4">
          {BRAND_MODEL_THUMBNAILS.map((url, i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl overflow-hidden ring-2 ring-background bg-muted shadow-sm ${i > 0 ? '-ml-3' : ''}`}
              style={{ transform: `rotate(${(i - 1) * 5}deg)`, zIndex: 3 - i }}
            >
              <ShimmerImage
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Eyebrow */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-5 text-center">
          Brand Models
        </p>

        {/* Title */}
        <DialogTitle className="text-2xl font-bold tracking-tight text-foreground mt-1.5 text-center">
          Create your brand’s own AI models
        </DialogTitle>

        {/* Subtitle */}
        <DialogDescription className="text-sm text-muted-foreground mt-2 text-center">
          Build unique models from a simple wizard or your own model photos — then reuse them across every shoot.
        </DialogDescription>

        {/* Feature list */}
        <ul className="mt-6 border-t border-border/50">
          {FEATURES.map((label, i) => (
            <li
              key={label}
              className="flex items-start gap-4 py-3.5 border-b border-border/50"
            >
              <span className="text-xs font-medium text-primary/70 w-5 pt-0.5 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm text-foreground/90 leading-snug flex-1">
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="mt-6 space-y-1.5">
          <Button
            onClick={handlePrimary}
            className="w-full h-11 rounded-full text-sm font-semibold gap-1.5 group"
          >
            {canCreate ? 'Create Brand Model' : 'Unlock Brand Models'}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-9 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            Not now
          </Button>
        </div>

        {!canCreate && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Included on Growth, Pro, and higher plans.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
