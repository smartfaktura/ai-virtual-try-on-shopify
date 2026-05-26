import React, { useState } from 'react';
import { Wand2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { BrandScenesInfoModal } from './BrandScenesInfoModal';

interface BrandScenesPromoCardProps {
  thumbnails?: string[];
}

export function BrandScenesPromoCard({ thumbnails = [] }: BrandScenesPromoCardProps) {
  const [open, setOpen] = useState(false);
  const hasThumbs = thumbnails.length > 0;

  return (
    <>
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {hasThumbs ? (
              <div className="flex items-center shrink-0">
                {thumbnails.slice(0, 3).map((url, i) => (
                  <div
                    key={i}
                    className={`w-9 h-11 rounded-lg overflow-hidden ring-2 ring-background bg-muted ${i > 0 ? '-ml-3' : ''}`}
                    style={{ transform: `rotate(${(i - 1) * 4}deg)`, zIndex: 3 - i }}
                  >
                    <ShimmerImage
                      src={getOptimizedUrl(url, { quality: 50 })}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Wand2 className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-snug">
                Want scenes unique to your brand?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate your own Brand Scenes from a reference or brief
              </p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            variant="secondary"
            className="rounded-full text-sm font-semibold px-5 h-10 w-full sm:w-auto gap-1.5 shrink-0 group"
          >
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
      <BrandScenesInfoModal open={open} onOpenChange={setOpen} />
    </>
  );
}
