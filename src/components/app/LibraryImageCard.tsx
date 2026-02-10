import { useState } from 'react';
import { Download, Trash2, Sparkles, Camera, User, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AddSceneModal } from '@/components/app/AddSceneModal';
import { AddModelModal } from '@/components/app/AddModelModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface LibraryItem {
  id: string;
  imageUrl: string;
  source: 'generation' | 'freestyle';
  label: string;
  prompt?: string;
  date: string;
  createdAt: string;
  status?: string;
  aspectRatio?: string;
  quality?: string;
}

interface LibraryImageCardProps {
  item: LibraryItem;
}

export function LibraryImageCard({ item }: LibraryImageCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sceneModalUrl, setSceneModalUrl] = useState<string | null>(null);
  const [modelModalUrl, setModelModalUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { isAdmin } = useIsAdmin();

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.label.replace(/\s+/g, '-').toLowerCase()}-${item.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image downloaded');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (item.source !== 'freestyle') return;
    setDeleting(true);
    const { error } = await supabase.from('freestyle_generations').delete().eq('id', item.id);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted');
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
    }
    setDeleting(false);
  };

  return (
    <>
      <div className="group relative rounded-lg overflow-hidden cursor-pointer bg-muted">
        {/* Shimmer placeholder */}
        {!loaded && (
          <div className="w-full aspect-[3/4] animate-pulse bg-muted" />
        )}

        <img
          src={item.imageUrl}
          alt={item.label}
          className={cn(
            'w-full h-auto block transition-opacity duration-500 group-hover:scale-[1.03] transition-transform',
            loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          )}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-between p-3 hidden [@media(hover:hover)]:flex">
          {/* Top: badge */}
          <div className="flex justify-between items-start">
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur-sm flex items-center gap-1',
              'bg-black/40 text-white'
            )}>
              {item.source === 'freestyle' ? (
                <><Sparkles className="w-3 h-3" /> Freestyle</>
              ) : (
                <><Camera className="w-3 h-3" /> {item.label}</>
              )}
            </span>
          </div>

          {/* Bottom: info + actions */}
          <div className="space-y-2">
            {item.prompt && (
              <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/60">{item.date}</span>
              <div className="flex gap-1">
                {isAdmin ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-1" side="top" align="end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSceneModalUrl(item.imageUrl); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" /> Add as Scene
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setModelModalUrl(item.imageUrl); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors"
                      >
                        <User className="w-3.5 h-3.5" /> Add as Model
                      </button>
                      <button
                        onClick={() => handleDownload()}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                      {item.source === 'freestyle' && (
                        <button
                          onClick={() => handleDelete()}
                          disabled={deleting}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </PopoverContent>
                  </Popover>
                ) : (
                  <>
                    <button
                      onClick={(e) => handleDownload(e)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {item.source === 'freestyle' && (
                      <button
                        onClick={(e) => handleDelete(e)}
                        disabled={deleting}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {sceneModalUrl && (
        <AddSceneModal open={!!sceneModalUrl} onClose={() => setSceneModalUrl(null)} imageUrl={sceneModalUrl} />
      )}
      {modelModalUrl && (
        <AddModelModal open={!!modelModalUrl} onClose={() => setModelModalUrl(null)} imageUrl={modelModalUrl} />
      )}
    </>
  );
}
