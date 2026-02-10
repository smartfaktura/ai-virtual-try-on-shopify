import { Copy, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';

interface DiscoverCardProps {
  preset: DiscoverPreset;
  onClick: () => void;
  onUsePrompt: () => void;
  featured?: boolean;
}

export function DiscoverCard({ preset, onClick, onUsePrompt, featured }: DiscoverCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-black/8 hover:border-border",
        featured && "ring-1 ring-primary/20"
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className={cn("overflow-hidden bg-muted", featured ? "aspect-[4/5]" : "aspect-[3/4]")}>
        <img
          src={preset.image_url}
          alt={preset.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      {/* Hover overlay (desktop) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-4 hidden [@media(hover:hover)]:flex">
        <p className="text-white/80 text-xs line-clamp-2 mb-3 leading-relaxed">
          {preset.prompt}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(preset.prompt);
              toast.success('Prompt copied to clipboard');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm text-white text-xs font-medium hover:bg-white/25 transition-colors"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUsePrompt();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors"
          >
            Use Prompt <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="p-3 space-y-2">
        <p className="text-sm font-medium truncate">{preset.title}</p>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {preset.category}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {preset.aspect_ratio}
          </Badge>
        </div>
        {/* Mobile-only action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUsePrompt();
          }}
          className="[@media(hover:hover)]:hidden flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
        >
          Use Prompt <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
