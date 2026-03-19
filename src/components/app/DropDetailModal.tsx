import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Download, Image, Loader2, Expand, ChevronDown, FolderOpen, LayoutGrid, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadDropAsZip, downloadSingleImage, type DropImage } from '@/lib/dropDownload';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
    generation_job_ids?: string[];
  };
}

export function DropDetailModal({ open, onClose, drop }: DropDetailModalProps) {
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workflowFilter, setWorkflowFilter] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [groupByWorkflow, setGroupByWorkflow] = useState(false);
  const [savingToLibrary, setSavingToLibrary] = useState(false);

  // Fetch images from generation_jobs when drop.images is empty
  const dropImagesEmpty = !drop.images || drop.images.length === 0;
  const jobIds = drop.generation_job_ids || [];

  const { data: fetchedImages = [] } = useQuery({
    queryKey: ['drop-job-images', drop.id, jobIds.join(',')],
    queryFn: async () => {
      if (jobIds.length === 0) return [];
      const { data, error } = await supabase
        .from('generation_jobs')
        .select('results, workflow_id, product_id')
        .in('id', jobIds)
        .eq('status', 'completed');
      if (error) throw error;

      // Also fetch workflow names
      const workflowIds = [...new Set((data || []).map(j => j.workflow_id).filter(Boolean))];
      let workflowMap = new Map<string, string>();
      if (workflowIds.length > 0) {
        const { data: wfs } = await supabase
          .from('workflows')
          .select('id, name')
          .in('id', workflowIds);
        if (wfs) workflowMap = new Map(wfs.map(w => [w.id, w.name]));
      }

      // Fetch product titles
      const productIds = [...new Set((data || []).map(j => j.product_id).filter(Boolean))];
      let productMap = new Map<string, string>();
      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('user_products')
          .select('id, title')
          .in('id', productIds);
        if (prods) productMap = new Map(prods.map(p => [p.id, p.title]));
      }

      const imgs: DropImage[] = [];
      for (const job of (data || [])) {
        const results = job.results as any[];
        if (!results || !Array.isArray(results)) continue;
        for (const r of results) {
          const url = typeof r === 'string' ? r : r?.url || r?.image_url;
          if (url) {
            imgs.push({
              url,
              workflow_name: job.workflow_id ? workflowMap.get(job.workflow_id) : undefined,
              product_title: job.product_id ? productMap.get(job.product_id) : undefined,
            });
          }
        }
      }
      return imgs;
    },
    enabled: open && dropImagesEmpty && jobIds.length > 0,
    staleTime: 30_000,
  });

  const images = useMemo(() => {
    if (drop.images && drop.images.length > 0) return drop.images as DropImage[];
    return fetchedImages;
  }, [drop.images, fetchedImages]);

  const workflows = [...new Set(images.map(img => img.workflow_name).filter(Boolean))];
  const filtered = workflowFilter
    ? images.filter(img => img.workflow_name === workflowFilter)
    : images;

  // Group by workflow
  const groupedImages = useMemo(() => {
    if (!groupByWorkflow) return null;
    const groups: Record<string, DropImage[]> = {};
    for (const img of filtered) {
      const key = img.workflow_name || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(img);
    }
    return groups;
  }, [filtered, groupByWorkflow]);

  const toggleSelect = (idx: number) => {
    const next = new Set(selectedIds);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(images.map((_, i) => i)));
  const clearAll = () => setSelectedIds(new Set());

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

  const handleDownloadGroup = async (groupName: string, groupImages: DropImage[]) => {
    setDownloading(true);
    setProgress(0);
    try {
      await downloadDropAsZip(groupImages, `Drop_${groupName.replace(/\s+/g, '_')}`, setProgress);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveToLibrary = async (imagesToSave: DropImage[]) => {
    if (!user || imagesToSave.length === 0) return;
    setSavingToLibrary(true);
    try {
      const inserts = imagesToSave.map(img => ({
        user_id: user.id,
        image_url: img.url,
        prompt: `From Creative Drop — ${new Date(drop.run_date).toLocaleDateString()}`,
        workflow_label: img.workflow_name || 'Creative Drop',
      }));
      const { error } = await supabase.from('freestyle_generations').insert(inserts);
      if (error) throw error;
      toast.success(`${imagesToSave.length} image${imagesToSave.length !== 1 ? 's' : ''} saved to library`);
    } catch {
      toast.error('Failed to save to library');
    } finally {
      setSavingToLibrary(false);
    }
  };

  const openLightbox = (filteredIdx: number) => {
    const img = filtered[filteredIdx];
    const realIdx = images.indexOf(img);
    setLightboxIndex(realIdx);
    setLightboxOpen(true);
  };

  const renderImageCard = (img: DropImage, idx: number, filteredIdx: number) => {
    const realIdx = images.indexOf(img);
    const isSelected = selectedIds.has(realIdx);
    return (
      <div
        key={`${realIdx}-${idx}`}
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
        <button
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => { e.stopPropagation(); downloadSingleImage(img.url, `image_${realIdx + 1}.png`); }}
        >
          <Download className="w-3 h-3" />
        </button>
        <button
          className="absolute top-2 right-10 z-10 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => { e.stopPropagation(); openLightbox(filteredIdx); }}
        >
          <Expand className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const isGenerating = drop.status === 'generating';

  return (
    <>
      <Dialog open={open} onOpenChange={v => !v && onClose()}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Drop — {new Date(drop.run_date).toLocaleDateString()}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {images.length > 0 ? images.length : drop.total_images} images · {drop.credits_charged} credits used
                  {isGenerating && ' · Generating...'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {images.length > 0 && (
                  <>
                    <div className="flex items-center gap-1 mr-2">
                      <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={selectAll}>
                        Select All
                      </Button>
                      {selectedIds.size > 0 && (
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-muted-foreground" onClick={clearAll}>
                          Clear
                        </Button>
                      )}
                    </div>
                    {/* Group toggle */}
                    {workflows.length > 1 && (
                      <Button
                        size="sm"
                        variant={groupByWorkflow ? 'default' : 'outline'}
                        className="text-xs h-7 px-2 gap-1"
                        onClick={() => setGroupByWorkflow(!groupByWorkflow)}
                      >
                        <FolderOpen className="w-3 h-3" />
                        Group
                      </Button>
                    )}
                  </>
                )}
                {selectedIds.size > 0 && (
                  <>
                    <Button size="sm" variant="outline" onClick={handleDownloadSelected} disabled={downloading}>
                      <Download className="w-3.5 h-3.5 mr-1" />
                      {selectedIds.size}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveToLibrary(Array.from(selectedIds).map(i => images[i]))}
                      disabled={savingToLibrary}
                    >
                      <Bookmark className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                  </>
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

          {/* Workflow filter chips (flat view only) */}
          {!groupByWorkflow && workflows.length > 1 && (
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
            {isGenerating && images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-10 h-10 mb-2 animate-spin opacity-40" />
                <p className="text-sm">Generating images... Check back shortly.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Image className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No images in this drop yet.</p>
              </div>
            ) : groupByWorkflow && groupedImages ? (
              <div className="space-y-4">
                {Object.entries(groupedImages).map(([groupName, groupImgs]) => (
                  <Collapsible key={groupName} defaultOpen>
                    <div className="flex items-center justify-between mb-2">
                      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
                        <ChevronDown className="w-4 h-4" />
                        {groupName}
                        <Badge variant="secondary" className="text-[10px] rounded-full">{groupImgs.length}</Badge>
                      </CollapsibleTrigger>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-6 px-2"
                          onClick={() => handleDownloadGroup(groupName, groupImgs)}
                          disabled={downloading}
                        >
                          <Download className="w-3 h-3 mr-1" /> ZIP
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-6 px-2"
                          onClick={() => handleSaveToLibrary(groupImgs)}
                          disabled={savingToLibrary}
                        >
                          <Bookmark className="w-3 h-3 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {groupImgs.map((img, idx) => {
                          const filteredIdx = filtered.indexOf(img);
                          return renderImageCard(img, idx, filteredIdx);
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((img, idx) => renderImageCard(img, idx, idx))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        images={images.map(img => img.url)}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        onDownload={(idx) => downloadSingleImage(images[idx].url, `image_${idx + 1}.png`)}
      />
    </>
  );
}
