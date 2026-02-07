import { Pencil, Trash2, Sun, Camera, Layout } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BrandProfile } from '@/pages/BrandProfiles';

interface BrandProfileCardProps {
  profile: BrandProfile;
  onEdit: () => void;
  onDelete: () => void;
}

const toneColors: Record<string, string> = {
  luxury: 'bg-amber-100 text-amber-800',
  clean: 'bg-sky-100 text-sky-800',
  bold: 'bg-red-100 text-red-800',
  minimal: 'bg-slate-100 text-slate-800',
  playful: 'bg-pink-100 text-pink-800',
};

export function BrandProfileCard({ profile, onEdit, onDelete }: BrandProfileCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{profile.name}</h3>
            {profile.brand_description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{profile.brand_description}</p>
            )}
          </div>
          <Badge className={toneColors[profile.tone] || 'bg-secondary text-secondary-foreground'} variant="secondary">
            {profile.tone}
          </Badge>
        </div>

        {/* Settings summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sun className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{profile.lighting_style} · {profile.color_temperature}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Camera className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{profile.background_style}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Layout className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{profile.composition_bias}</span>
          </div>
        </div>

        {/* Do-not rules */}
        {profile.do_not_rules.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.do_not_rules.slice(0, 3).map((rule, i) => (
              <span key={i} className="inline-block px-1.5 py-0.5 text-[10px] bg-destructive/10 text-destructive rounded">
                ✕ {rule}
              </span>
            ))}
            {profile.do_not_rules.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{profile.do_not_rules.length - 3} more</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <Button variant="ghost" size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
