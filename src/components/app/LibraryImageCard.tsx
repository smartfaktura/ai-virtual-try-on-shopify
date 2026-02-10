import { useState } from 'react';
import { Download, Trash2, Sparkles, Camera, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AddSceneModal } from '@/components/app/AddSceneModal';
import { AddModelModal } from '@/components/app/AddModelModal';

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

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      <div className="group relative rounded-lg overflow-hidden cursor-pointer break-inside-avoid mb-1 bg-muted">
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
                {isAdmin && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSceneModalUrl(item.imageUrl); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      title="Add as Scene"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setModelModalUrl(item.imageUrl); }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                      title="Add as Model"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={handleDownload}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {item.source === 'freestyle' && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-destructive/80 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
