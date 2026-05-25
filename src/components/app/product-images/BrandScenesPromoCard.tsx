import React, { useState } from 'react';
import { Wand2, ArrowRight } from 'lucide-react';
import { BrandScenesInfoModal } from './BrandScenesInfoModal';

export function BrandScenesPromoCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06] hover:border-primary/60 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Wand2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Want scenes unique to your brand?</p>
          <p className="text-xs text-muted-foreground truncate">
            Generate your own Brand Scenes from a reference or brief
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-primary shrink-0">
          Learn more
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </button>
      <BrandScenesInfoModal open={open} onOpenChange={setOpen} />
    </>
  );
}
