import { useState } from 'react';
import { Download, Trash2, Sparkles, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

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
    <div className="group relative break-inside-avoid mb-4">
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        <img
          src={item.imageUrl}
          alt={item.label}
          className="w-full h-auto object-cover"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
          {/* Top: badge */}
          <div className="flex justify-between items-start">
            <Badge
              variant="secondary"
              className={`text-[10px] gap-1 ${
                item.source === 'freestyle'
                  ? 'bg-white/20 text-white backdrop-blur-sm border-white/10'
                  : 'bg-white/20 text-white backdrop-blur-sm border-white/10'
              }`}
            >
              {item.source === 'freestyle' ? (
                <><Sparkles className="w-3 h-3" /> Freestyle</>
              ) : (
                <><Camera className="w-3 h-3" /> {item.label}</>
              )}
            </Badge>
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={handleDownload}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                {item.source === 'freestyle' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white hover:bg-destructive/80"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
