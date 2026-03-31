import { cn } from '@/lib/utils';
import { Check, User, ImageIcon, TreePine, Building2, Sofa, Store } from 'lucide-react';

interface CatalogPoseCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  studio: 'from-slate-600 to-slate-800',
  lifestyle: 'from-amber-500 to-orange-600',
  editorial: 'from-rose-500 to-pink-700',
  'clean-studio': 'from-zinc-300 to-zinc-500',
  surface: 'from-stone-400 to-stone-600',
  botanical: 'from-emerald-500 to-green-700',
  outdoor: 'from-sky-400 to-blue-600',
  'living-space': 'from-violet-400 to-purple-600',
  retail: 'from-fuchsia-400 to-pink-600',
};

const CATEGORY_ICONS: Record<string, typeof User> = {
  studio: User,
  lifestyle: User,
  editorial: User,
  'clean-studio': ImageIcon,
  surface: ImageIcon,
  botanical: TreePine,
  outdoor: Building2,
  'living-space': Sofa,
  retail: Store,
};

export function CatalogPoseCard({
  id, name, description, category, previewUrl, isSelected, onSelect,
}: CatalogPoseCardProps) {
  const gradient = CATEGORY_GRADIENTS[category] || 'from-muted to-muted-foreground/20';
  const Icon = CATEGORY_ICONS[category] || ImageIcon;
  const hasImage = previewUrl && previewUrl.length > 0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative rounded-xl overflow-hidden transition-all duration-200 text-left w-full group',
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-[1.02]'
          : 'ring-1 ring-border hover:ring-primary/50 hover:shadow-md',
      )}
    >
      <div className="aspect-[4/5] overflow-hidden">
        {hasImage ? (
          <img
            src={previewUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br flex flex-col items-center justify-center gap-2 p-2', gradient)}>
            <Icon className="w-6 h-6 text-white/70" />
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 pointer-events-none">
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Bottom label */}
      <div className={cn(
        'absolute bottom-0 inset-x-0 p-2 pt-6',
        hasImage
          ? 'bg-gradient-to-t from-black/80 via-black/50 to-transparent'
          : 'bg-black/20',
      )}>
        <p className="text-white text-[11px] font-semibold leading-tight truncate">{name}</p>
        <p className="text-white/60 text-[9px] leading-tight truncate">{description}</p>
      </div>
    </button>
  );
}
