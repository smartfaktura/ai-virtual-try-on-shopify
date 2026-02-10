import { Copy, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DiscoverPreset } from '@/hooks/useDiscoverPresets';

interface DiscoverCardProps {
  preset: DiscoverPreset;
  onClick: () => void;
  onUsePrompt: () => void;
}

export function DiscoverCard({ preset, onClick, onUsePrompt }: DiscoverCardProps) {
  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-black/8 hover:border-border"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={preset.image_url}
          alt={preset.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <p className="text-white/80 text-xs line-clamp-2 mb-3 leading-relaxed">
          {preset.prompt}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(preset.prompt);
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
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-medium truncate">{preset.title}</p>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {preset.category}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {preset.aspect_ratio}
          </Badge>
        </div>
      </div>
    </div>
  );
}
