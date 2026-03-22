import { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MobilePickerSheet } from '@/components/app/freestyle/MobilePickerSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  PRODUCT_CATEGORIES,
  getCategoryLabel,
  getCategoryHeadline,
} from '@/lib/categoryConstants';

export function DashboardPersonalizationHero() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState<string[]>([]);
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('product_categories')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        const cats = (data?.product_categories as string[]) ?? [];
        setCategories(cats);
        setEditCategories(cats);
      });
  }, [user]);

  const toggleCategory = (id: string) => {
    setEditCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ product_categories: editCategories })
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to save preferences');
    } else {
      setCategories(editCategories);
      toast.success('Preferences saved');
      setOpen(false);
    }
    setSaving(false);
  };

  const handleOpen = (v: boolean) => {
    if (v) setEditCategories(categories);
    setOpen(v);
  };

  const label = getCategoryLabel(categories);
  const headline = getCategoryHeadline(categories);

  const categoryList = (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Select your focus</p>
      <div className="space-y-1 max-h-[320px] overflow-y-auto">
        {PRODUCT_CATEGORIES.map(({ id, label: catLabel }) => {
          const selected = editCategories.includes(id);
          return (
            <button
              key={id}
              onClick={() => toggleCategory(id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                selected
                  ? 'bg-primary/5 text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                  selected ? 'bg-primary border-primary' : 'border-border'
                )}
              >
                {selected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              {catLabel}
            </button>
          );
        })}
      </div>
      <Button
        onClick={handleSave}
        disabled={saving || editCategories.length === 0}
        size="sm"
        className="w-full rounded-full"
      >
        {saving ? 'Saving…' : 'Save preferences'}
      </Button>
    </div>
  );

  return (
    <div className="space-y-2 mt-3">
      {/* Pill selector */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          Personalized for
        </span>
        {isMobile ? (
          <>
            <button
              onClick={() => handleOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/50 text-sm font-normal text-foreground hover:border-border hover:shadow-sm transition-all duration-200"
            >
              {label}
              <ChevronDown className="w-3 h-3 text-muted-foreground/60" />
            </button>
            <MobilePickerSheet
              open={open}
              onOpenChange={handleOpen}
              title="Content Preferences"
            >
              {categoryList}
            </MobilePickerSheet>
          </>
        ) : (
          <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/50 text-sm font-normal text-foreground hover:border-border hover:shadow-sm transition-all duration-200">
                {label}
                <ChevronDown className="w-3 h-3 text-muted-foreground/60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3">
              {categoryList}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Dynamic headline */}
      <p className="text-[15px] leading-relaxed font-light text-muted-foreground/80 transition-opacity duration-300">
        {headline}
      </p>
    </div>
  );
}