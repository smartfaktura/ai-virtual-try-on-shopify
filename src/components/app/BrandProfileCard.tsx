import { Pencil, Trash2, Tag, Droplets, Palette, Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COLOR_FEEL_LABELS } from '@/lib/brandPromptBuilder';
import type { BrandProfile } from '@/pages/BrandProfiles';

interface BrandProfileCardProps {
  profile: BrandProfile;
  onEdit: () => void;
  onDelete: () => void;
}

const COLOR_FEEL_SWATCHES: Record<string, string[]> = {
  'warm-earthy': ['#D4A574', '#C2784E', '#E8C4A0', '#A0522D'],
  'cool-crisp': ['#B8D4E8', '#7EB0D5', '#D6E8F4', '#5A9BC5'],
  'neutral-natural': ['#C8BEB4', '#A69E94', '#DDD8D2', '#8C857C'],
  'rich-saturated': ['#8B3A8B', '#C44D4D', '#2E6B8A', '#D4A040'],
  'muted-soft': ['#E8D5E0', '#D5D0E8', '#D0E0D5', '#E8E0D0'],
  'vibrant-bold': ['#FF6B35', '#FFD23F', '#06D6A0', '#EF476F'],
  'monochrome': ['#1A1A1A', '#666666', '#AAAAAA', '#E5E5E5'],
  'pastel-dreamy': ['#F4C2D7', '#C9B1E8', '#B5D8F0', '#F0E4A6'],
};

const toneStyles: Record<string, string> = {
  luxury: 'bg-amber-50 text-amber-700 border-amber-200',
  clean: 'bg-sky-50 text-sky-700 border-sky-200',
  bold: 'bg-red-50 text-red-700 border-red-200',
  minimal: 'bg-slate-50 text-slate-700 border-slate-200',
  playful: 'bg-pink-50 text-pink-700 border-pink-200',
};

export function BrandProfileCard({ profile, onEdit, onDelete }: BrandProfileCardProps) {
  const colorFeelLabel = COLOR_FEEL_LABELS[profile.color_temperature] || profile.color_temperature;
  const swatches = COLOR_FEEL_SWATCHES[profile.color_temperature] || [];

  return (
    <Card className="group hover:shadow-md transition-all border-border/50 overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Color accent bar + swatches */}
        <div className="sm:w-2 w-full h-1.5 sm:h-auto flex sm:flex-col flex-row flex-shrink-0 rounded-l-none sm:rounded-l-xl overflow-hidden">
          {swatches.length > 0 ? swatches.map((color, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: color }} />
          )) : (
            <div className="flex-1 bg-muted" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 sm:p-6 min-w-0">
          <div className="flex items-start justify-between gap-4">
            {/* Left: brand info */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Name + mood badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base font-semibold tracking-tight truncate">{profile.name}</h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 ${toneStyles[profile.tone] || 'bg-secondary/50 text-secondary-foreground border-border'}`}
                >
                  {profile.tone}
                </Badge>
              </div>

              {/* Description */}
              {profile.brand_description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {profile.brand_description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  {colorFeelLabel}
                </span>

                {profile.target_audience && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[180px]">{profile.target_audience}</span>
                  </span>
                )}

                {/* Brand color dots */}
                {profile.color_palette && profile.color_palette.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    {profile.color_palette.slice(0, 5).map((color, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-border/60 flex-shrink-0"
                        style={{ backgroundColor: color.startsWith('#') ? color : undefined }}
                        title={color}
                      />
                    ))}
                    {profile.color_palette.length > 5 && (
                      <span className="text-[10px]">+{profile.color_palette.length - 5}</span>
                    )}
                  </span>
                )}
              </div>

              {/* Tags row: keywords + do-not rules */}
              <div className="flex items-center gap-2 flex-wrap">
                {profile.brand_keywords && profile.brand_keywords.length > 0 && (
                  <>
                    {profile.brand_keywords.slice(0, 4).map((kw, i) => (
                      <span
                        key={`kw-${i}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-primary/5 text-primary/80 border border-primary/10 rounded-full"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {kw}
                      </span>
                    ))}
                    {profile.brand_keywords.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{profile.brand_keywords.length - 4}</span>
                    )}
                  </>
                )}

                {profile.do_not_rules.length > 0 && (
                  <>
                    {profile.do_not_rules.slice(0, 3).map((rule, i) => (
                      <span
                        key={`dn-${i}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-destructive/5 text-destructive/70 border border-destructive/10 rounded-full"
                      >
                        ✕ {rule}
                      </span>
                    ))}
                    {profile.do_not_rules.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{profile.do_not_rules.length - 3}</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={onEdit}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
