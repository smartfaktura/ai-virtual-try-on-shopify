import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ImageIcon, Check, FolderOpen } from 'lucide-react';
import { useLibraryItems } from '@/hooks/useLibraryItems';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface LibraryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageUrl: string) => void;
  multiSelect?: boolean;
  onMultiSelect?: (urls: string[]) => void;
  maxSelect?: number;
}

export function LibraryPickerModal({ open, onOpenChange, onSelect, multiSelect = false, onMultiSelect, maxSelect = 10 }: LibraryPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useLibraryItems('newest', search);

  const allItems = data?.pages.flatMap(p => p.items) ?? [];

  const handleToggle = (url: string) => {
    setSelected(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : prev.length < maxSelect ? [...prev, url] : prev
    );
  };

  const handleDone = () => {
    if (onMultiSelect && selected.length > 0) {
      onMultiSelect(selected);
    }
    setSelected([]);
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) setSelected([]);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-3xl rounded-2xl p-0 overflow-hidden gap-0"
        aria-describedby={undefined}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border bg-background space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <FolderOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold tracking-tight">
                {multiSelect ? `Choose images (${selected.length}/${maxSelect})` : 'Choose from Library'}
              </DialogTitle>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Pick an image from your saved library
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your library…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm rounded-xl bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="bg-muted/20 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="h-14 w-14 rounded-full bg-background border border-border flex items-center justify-center mb-3">
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground">Your library is empty</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Generate or upload images first, then come back to pick a frame.
              </p>
            </div>
          ) : (
            <div className="p-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {allItems.map((item) => {
                  const isSelected = multiSelect && selected.includes(item.imageUrl);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (multiSelect) {
                          handleToggle(item.imageUrl);
                        } else {
                          onSelect(item.imageUrl);
                          onOpenChange(false);
                        }
                      }}
                      className={cn(
                        'relative aspect-square rounded-xl overflow-hidden ring-1 transition-all duration-300 group focus:outline-none',
                        isSelected
                          ? 'ring-2 ring-primary shadow-md shadow-primary/10'
                          : 'ring-border hover:ring-primary/40 hover:shadow-lg hover:shadow-primary/5 focus-visible:ring-2 focus-visible:ring-primary/40'
                      )}
                    >
                      <img
                        src={getOptimizedUrl(item.imageUrl, { quality: 60 })}
                        alt={item.label}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate font-medium">{item.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {hasNextPage && (
                <div className="flex justify-center pt-5 pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-full h-8 text-xs"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      'Load more'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-background flex items-center justify-between gap-3">
          <p className="text-[11.5px] text-muted-foreground hidden sm:block">
            {multiSelect ? `Pick up to ${maxSelect} images` : 'Click an image to insert'}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={() => handleClose(false)} className="rounded-lg">
              Cancel
            </Button>
            {multiSelect && (
              <Button size="sm" onClick={handleDone} disabled={selected.length === 0} className="rounded-lg">
                Done ({selected.length} selected)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
