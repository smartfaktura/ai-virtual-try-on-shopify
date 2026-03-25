import { cn } from '@/lib/utils';
import { PRODUCT_CATEGORIES, SCENE_TYPES } from '@/lib/videoMotionRecipes';
import { Badge } from '@/components/ui/badge';

interface ProductContextSelectorProps {
  category: string;
  sceneType: string;
  onCategoryChange: (v: string) => void;
  onSceneTypeChange: (v: string) => void;
  detectedCategory?: string | null;
  detectedSceneType?: string | null;
}

export function ProductContextSelector({
  category, sceneType, onCategoryChange, onSceneTypeChange,
  detectedCategory, detectedSceneType,
}: ProductContextSelectorProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground">Product Context</h3>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategoryChange(c.id)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs border transition-colors flex items-center gap-1',
                category === c.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
              {detectedCategory === c.id && category === c.id && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-0.5">AI</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Scene Type</label>
        <div className="flex flex-wrap gap-1.5">
          {SCENE_TYPES.map((s) => (
            <button
              key={s.id}
              onClick={() => onSceneTypeChange(s.id)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs border transition-colors',
                sceneType === s.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {s.label}
              {detectedSceneType === s.id && sceneType === s.id && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-1">AI</Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
