import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { BrandScenesInfoModal } from './BrandScenesInfoModal';

export const BRAND_SCENE_THUMBNAILS = [
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776664670175-5a6elc.jpg?quality=75',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1777880663547-i1ngr6.jpg?quality=75',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776847678915-bxu3g4.jpg?quality=75',
];

export function BrandScenesPromoCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="flex items-center shrink-0">
              {BRAND_SCENE_THUMBNAILS.map((url, i) => (
                <div
                  key={i}
                  className={`w-9 h-11 rounded-xl overflow-hidden ring-2 ring-background bg-muted ${i > 0 ? '-ml-3' : ''}`}
                  style={{ transform: `rotate(${(i - 1) * 4}deg)`, zIndex: 3 - i }}
                >
                  <ShimmerImage
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-snug">
                Your brand's own scene library
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Built from your references. Reused across every shoot.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="rounded-full text-sm font-semibold px-5 h-10 w-full sm:w-auto gap-1.5 shrink-0 group bg-background text-foreground border-border hover:bg-background hover:text-foreground"
          >
            <span>See how it works</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
      <BrandScenesInfoModal open={open} onOpenChange={setOpen} />
    </>
  );
}
