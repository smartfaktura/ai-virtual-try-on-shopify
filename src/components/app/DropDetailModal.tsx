import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Download, X, Image, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadDropAsZip, downloadSingleImage, type DropImage } from '@/lib/dropDownload';

interface DropDetailModalProps {
  open: boolean;
  onClose: () => void;
  drop: {
    id: string;
    run_date: string;
    status: string;
    total_images: number;
    credits_charged: number;
    images: DropImage[];
  };
}

export function DropDetailModal({ open, onClose, drop }: DropDetailModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workflowFilter, setWorkflowFilter] = useState<string | null>(null);

  const images = (drop.images || []) as DropImage[];
  const workflows = [...new Set(images.map(img => img.workflow_name).filter(Boolean))];
  const filtered = workflowFilter
    ? images.filter(img => img.workflow_name === workflowFilter)
    : images;

  const toggleSelect = (idx: number) => {
    const next = new Set(selectedIds);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setSelectedIds(next);
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    setProgress(0);
    try {
      await downloadDropAsZip(images, `Drop_${new Date(drop.run_date).toLocaleDateString()}`, setProgress);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSelected = async () => {
    const selected = Array.from(selectedIds).map(i => images[i]);
    if (selected.length === 0) return;
    setDownloading(true);
    setProgress(0);
    try {
      await downloadDropAsZip(selected, `Drop_Selected`, setProgress);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Drop — {new Date(drop.run_date).toLocaleDateString()}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {drop.total_images} images · {drop.credits_charged} credits used
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button size="sm" variant="outline" onClick={handleDownloadSelected} disabled={downloading}>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download {selectedIds.size} selected
                </Button>
              )}
              <Button size="sm" onClick={handleDownloadAll} disabled={downloading || images.length === 0}>
                {downloading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1" />}
                Download All
              </Button>
            </div>
          </div>
        </DialogHeader>

        {downloading && (
          <div className="px-6 py-2">
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">Preparing ZIP... {progress}%</p>
          </div>
        )}

        {/* Workflow filter chips */}
        {workflows.length > 1 && (
          <div className="px-6 py-3 flex gap-2 border-b overflow-x-auto">
            <Button
              variant={workflowFilter === null ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => setWorkflowFilter(null)}
            >
              All
            </Button>
            {workflows.map(wf => (
              <Button
                key={wf}
                variant={workflowFilter === wf ? 'default' : 'outline'}
                size="sm"
                className="text-xs whitespace-nowrap"
                onClick={() => setWorkflowFilter(wf === workflowFilter ? null : (wf ?? null))}
              >
                {wf}
              </Button>
            ))}
          </div>
        )}

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Image className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No images in this drop yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((img, idx) => {
                const realIdx = images.indexOf(img);
                const isSelected = selectedIds.has(realIdx);
                return (
                  <div
                    key={idx}
                    className={cn(
                      'relative group rounded-lg border-2 overflow-hidden cursor-pointer transition-all',
                      isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-primary/40'
                    )}
                    onClick={() => toggleSelect(realIdx)}
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <Checkbox checked={isSelected} />
                    </div>
                    <div className="aspect-square bg-muted">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        {img.workflow_name && (
                          <Badge className="text-[10px] bg-white/20 backdrop-blur-sm border-0">{img.workflow_name}</Badge>
                        )}
                      </div>
                      {img.product_title && (
                        <p className="text-[10px] text-white/80 truncate mt-0.5">{img.product_title}</p>
                      )}
                    </div>
                    {/* Quick download */}
                    <button
                      className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => {
                        e.stopPropagation();
                        downloadSingleImage(img.url, `image_${idx + 1}.jpg`);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
