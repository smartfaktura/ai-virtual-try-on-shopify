import { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, CATEGORY_SUPER_GROUPS } from '@/lib/productCategories';

interface CategoryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current chosen category id (user pick) — highlighted as selected. */
  value?: string | null;
  /** AI-suggested category id — pinned at the top with a Suggested badge when distinct from value. */
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

  const showSuggested = !!suggested && CATEGORY_LABELS[suggested] && (!query || CATEGORY_LABELS[suggested].toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden flex flex-col max-w-[100vw] w-screen h-[100dvh] rounded-none sm:max-w-3xl sm:w-full sm:h-auto sm:max-h-[88vh] sm:rounded-3xl">
        <DialogHeader className="sticky top-0 z-10 bg-background px-4 sm:px-8 pt-4 sm:pt-8 pb-3 sm:pb-4 space-y-3 shrink-0 border-b border-border/60 sm:border-b-0">
          <div className="space-y-1.5 pr-8">
            <DialogTitle className="text-base sm:text-xl font-medium tracking-tight">Product category</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground hidden sm:block">
              Pick the closest match for better scene results
            </DialogDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search categories"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 h-10 sm:h-11 text-sm rounded-2xl bg-muted/40 border-transparent focus-visible:bg-background"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-3 sm:px-8 pt-3 sm:pt-2 pb-[max(2rem,env(safe-area-inset-bottom))] sm:pb-8 space-y-5 sm:space-y-6">
          {showSuggested && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2 sm:mb-3 px-1">
                Suggested
              </div>
              <button
                type="button"
                onClick={() => handlePick(suggested!)}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl sm:rounded-2xl text-sm text-left border transition-colors',
                  value === suggested
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-primary/30 bg-primary/5 hover:bg-primary/10',
                )}
              >
                <span className="truncate">{CATEGORY_LABELS[suggested!]}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full',
                    value === suggested ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary text-primary-foreground'
                  )}>
                    Suggested
                  </span>
                  {value === suggested && <Check className="w-4 h-4 shrink-0" />}
                </span>
              </button>
            </div>
          )}

          {filteredGroups.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-12">No categories match "{query}"</p>
          )}
          {filteredGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2 sm:mb-3 px-1">
                {group.label}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {group.ids.map((id) => {
                  const isSelected = value === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePick(id)}
                      className={cn(
                        'flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl sm:rounded-2xl text-sm text-left border transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border/60 hover:bg-muted',
                      )}
                    >
                      <span className="truncate">{CATEGORY_LABELS[id]}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0" />}
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
