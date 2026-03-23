import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MobilePickerSheet } from '@/components/app/freestyle/MobilePickerSheet';
import { Button } from '@/components/ui/button';
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
export function DashboardPersonalizationHero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>('any');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('product_categories')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const cats = (data?.product_categories as string[]) ?? [];
        const primary = cats.includes('any') || cats.length === 0 ? 'any' : cats[0];
        setSelected(primary);
      });
  }, [user]);

  const headline = getCategoryHeadline([selected]);

  return (
    <div className="space-y-4 mt-2.5">
      <p className="text-muted-foreground max-w-lg transition-opacity duration-300">
        {headline}
      </p>

      <div className="space-y-2">
        <Button
          onClick={() => navigate('/app/workflows')}
          size="lg"
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Start a Campaign
        </Button>
        <p className="text-xs text-muted-foreground/60">
          Virtual Try-On · Product Editorial · Catalog Generation
        </p>
      </div>
    </div>
  );
}

/** Inline pill selector for "Personalized for [category]" */
export function PersonalizedForPill() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<string>('any');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('product_categories')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const cats = (data?.product_categories as string[]) ?? [];
        const primary = cats.includes('any') || cats.length === 0 ? 'any' : cats[0];
        setSelected(primary);
      });
  }, [user]);

  const handleSelect = async (id: string) => {
    setSelected(id);
    setOpen(false);
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ product_categories: [id] })
      .eq('user_id', user.id);
    if (error) toast.error('Failed to save preference');
  };

  const currentLabel = PRODUCT_CATEGORIES.find((c) => c.id === selected)?.label ?? 'All products';

  const categoryList = (
    <div className="py-1">
      {PRODUCT_CATEGORIES.map(({ id, label }) => {
        const active = id === selected;
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
