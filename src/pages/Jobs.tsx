import { useState, useEffect, useCallback } from 'react';
import { Search, Image, Loader2, Download, CheckSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LibraryImageCard, type LibraryItem } from '@/components/app/LibraryImageCard';
import { LibraryDetailModal } from '@/components/app/LibraryDetailModal';
import { useLibraryItems, type LibrarySortBy } from '@/hooks/useLibraryItems';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import JSZip from 'jszip';

const SORTS: { id: LibrarySortBy; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
];


function useColumnCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCount(2);
      else if (w < 1024) setCount(3);
      else if (w < 1280) setCount(4);
      else setCount(5);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return count;
}

export default function Jobs() {
  const [sortBy, setSortBy] = useState<LibrarySortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isZipping, setIsZipping] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LibraryItem | null>(null);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useLibraryItems(sortBy, searchQuery);
  const columnCount = useColumnCount();

  const columns: typeof items[] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => {
    columns[i % columnCount].push(item);
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDownload = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const selected = items.filter(i => selectedIds.has(i.id));
      for (const item of selected) {
        const res = await fetch(item.imageUrl);
        const blob = await res.blob();
        zip.file(`${item.label}-${item.id.slice(0, 8)}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'library-images.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  const cancelSelect = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteItem = useCallback((item: LibraryItem) => {
    setDeleteTarget(item);
  }, []);

  const confirmDelete = async () => {
    const item = deleteTarget;
    if (!item) return;
    try {
      if (item.source === 'freestyle') {
        const { error } = await supabase.from('freestyle_generations').delete().eq('id', item.id);
        if (error) throw error;
      } else {
        const dashIndex = item.id.lastIndexOf('-');
        const jobId = item.id.substring(0, dashIndex);
        const imageIndex = parseInt(item.id.substring(dashIndex + 1), 10);

        const { data: job } = await supabase
          .from('generation_jobs')
          .select('results')
          .eq('id', jobId)
          .single();

        if (job) {
          const results = job.results as any[];
          if (results.length <= 1) {
            const { error } = await supabase.from('generation_jobs').delete().eq('id', jobId);
            if (error) throw error;
          } else {
            const updated = results.filter((_, i) => i !== imageIndex);
            const { error } = await supabase.from('generation_jobs').update({ results: updated }).eq('id', jobId);
            if (error) throw error;
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
          <p className="text-muted-foreground mt-1">Your generated images and freestyle creations</p>
        </div>

        {/* Search + Sort + Select */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by product, model, scene..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/30 border-0 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {SORTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-medium transition-all',
                  sortBy === s.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
                )}
              >
                {s.label}
              </button>
            ))}

            <button
              onClick={() => selectMode ? cancelSelect() : setSelectMode(true)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
                selectMode
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Select
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Image className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No results match your search.' : 'No creations yet. Start generating to build your library.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground hover:bg-muted/70 transition-all"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-1">
            {columns.map((col, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1">
                {col.map(item => (
                  <LibraryImageCard
                    key={item.id}
                    item={item}
                    selectMode={selectMode}
                    selected={selectedIds.has(item.id)}
                    onDelete={() => handleDeleteItem(item)}
                    onClick={() => {
                      if (selectMode) {
                        toggleSelect(item.id);
                      } else {
                        setSelectedItem(item);
                      }
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating action bar */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-foreground text-background shadow-2xl">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            size="sm"
            onClick={handleBulkDownload}
            disabled={isZipping}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isZipping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Download ZIP
          </Button>
          <button onClick={cancelSelect} className="ml-1 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <LibraryDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The image will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
