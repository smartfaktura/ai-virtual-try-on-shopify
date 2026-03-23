import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MobilePickerSheet } from '@/components/app/freestyle/MobilePickerSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  PRODUCT_CATEGORIES,
  getCategoryHeadline,
} from '@/lib/categoryConstants';

/** Hero section: dynamic headline + CTA */
export function DashboardPersonalizationHero({ selected = 'any', hasGenerations = false }: { selected?: string; hasGenerations?: boolean }) {
  const navigate = useNavigate();
  const headline = getCategoryHeadline([selected], hasGenerations);

  return (
    <div className="space-y-4 mt-2.5">
      <p className="text-muted-foreground max-w-lg transition-opacity duration-300">
        {headline}
      </p>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/app/workflows')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-muted hover:border-primary/30 transition-all duration-200 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Start with a Workflow
          <ArrowRight className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {['Virtual Try-On', 'Product Editorial', 'Catalog Generation'].map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-border/50 bg-muted/40 text-[11px] text-muted-foreground font-medium"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Inline pill selector for "Personalized for [category]" */
export function PersonalizedForPill({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [localSelected, setLocalSelected] = useState<string>(selected ?? 'any');
  const [open, setOpen] = useState(false);

  // Sync from parent prop
  useEffect(() => {
    if (selected !== undefined) setLocalSelected(selected);
  }, [selected]);

  const current = localSelected;

  const handleSelect = async (id: string) => {
    setLocalSelected(id);
    setOpen(false);
    onSelect?.(id);
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ product_categories: [id] })
      .eq('user_id', user.id);
    if (error) toast.error('Failed to save preference');
  };

  const currentLabel = PRODUCT_CATEGORIES.find((c) => c.id === current)?.label ?? 'All products';

  const categoryList = (
    <div className="py-1">
      {PRODUCT_CATEGORIES.map(({ id, label }) => {
        const active = id === current;
        return (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left',
              active
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {label}
            {active && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm text-muted-foreground/70">Personalized for</span>
      {isMobile ? (
        <>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/40 text-sm font-medium text-foreground shadow-sm hover:bg-muted hover:border-border/60 transition-all duration-200"
          >
            {currentLabel}
            <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
          </button>
          <MobilePickerSheet
            open={open}
            onOpenChange={setOpen}
            title="Select your focus"
          >
            {categoryList}
          </MobilePickerSheet>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/40 text-sm font-medium text-foreground shadow-sm hover:bg-muted hover:border-border/60 transition-all duration-200">
              {currentLabel}
              <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-1">
            {categoryList}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
