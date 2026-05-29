import { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, CATEGORY_SUPER_GROUPS } from '@/lib/productCategories';

interface CategoryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current chosen category id (user pick) — highlighted as selected. */
  value?: string | null;
  /** AI-suggested category id — shown with a Sparkles badge when distinct from value. */
  suggested?: string | null;
  onChange: (id: string) => void;
}

export function CategoryPickerModal({ open, onOpenChange, value, suggested, onChange }: CategoryPickerModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORY_SUPER_GROUPS.map((group) => {
      const ids = group.ids.filter((id) => {
        if (!CATEGORY_LABELS[id]) return false;
        if (!q) return true;
        return (
          CATEGORY_LABELS[id].toLowerCase().includes(q) ||
          id.toLowerCase().includes(q)
        );
      });
      return { ...group, ids };
    }).filter((g) => g.ids.length > 0);
  }, [query]);

  const handlePick = (id: string) => {
    onChange(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="text-lg font-medium">Choose product category</DialogTitle>
          <DialogDescription className="text-xs">
            Pick the closest match — this guides which scenes appear in Visual Studio
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6 space-y-5">
          {filteredGroups.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No categories match "{query}"</p>
          )}
          {filteredGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                {group.label}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {group.ids.map((id) => {
                  const isSelected = value === id;
                  const isSuggested = !isSelected && suggested === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePick(id)}
                      className={cn(
                        'flex items-center justify-between gap-2 px-3 py-2 rounded-md text-xs text-left border transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : isSuggested
                            ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                            : 'border-border hover:bg-muted',
                      )}
                    >
                      <span className="truncate">{CATEGORY_LABELS[id]}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : isSuggested ? (
                        <Sparkles className="w-3 h-3 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
