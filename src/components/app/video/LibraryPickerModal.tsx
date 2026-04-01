import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ImageIcon, Check } from 'lucide-react';
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-base">
            {multiSelect ? `Choose images (${selected.length}/${maxSelect})` : 'Choose from Library'}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">No images found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pb-4">
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
                        "relative aspect-square rounded-lg overflow-hidden border",
                        isSelected
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/5",
                        "transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/20"
                      )}
                    >
                      <img
                        src={getOptimizedUrl(item.imageUrl, { quality: 60 })}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate">{item.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {hasNextPage && (
                <div className="flex justify-center pb-4">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-xs text-primary hover:underline disabled:opacity-50"
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {multiSelect && (
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDone} disabled={selected.length === 0}>
              Done ({selected.length} selected)
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
