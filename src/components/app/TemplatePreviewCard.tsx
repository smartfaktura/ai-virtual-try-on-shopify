import { CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/types';
import { getLandingAssetUrl } from '@/lib/landingAssets';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(path), { quality: 60 });

const templateImages: Record<string, string> = {
  'tpl_001': s('templates/clothing-studio.jpg'),
  'tpl_002': s('templates/clothing-streetwear.jpg'),
  'tpl_003': s('templates/clothing-flatlay.jpg'),
  'tpl_004': s('templates/cosmetics-luxury.jpg'),
  'tpl_005': s('templates/cosmetics-water.jpg'),
  'tpl_006': s('templates/cosmetics-pastel.jpg'),
  'tpl_007': s('templates/food-commercial.jpg'),
  'tpl_008': s('templates/food-rustic.jpg'),
  'tpl_009': s('templates/food-packaging.jpg'),
  'tpl_010': s('templates/home-japandi.jpg'),
  'tpl_011': s('templates/home-warm.jpg'),
  'tpl_012': s('templates/home-concrete.jpg'),
  'tpl_013': s('templates/supplements-clinical.jpg'),
  'tpl_014': s('templates/supplements-athletic.jpg'),
  'tpl_015': s('templates/supplements-luxury.jpg'),
  'tpl_016': s('templates/universal-clean.jpg'),
  'tpl_017': s('templates/universal-gradient.jpg'),
};

export function getTemplateImage(templateId: string): string | undefined {
  return templateImages[templateId];
}

interface TemplatePreviewCardProps {
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  showCredits?: boolean;
}

export function TemplatePreviewCard({ template, isSelected, onSelect, showCredits = true }: TemplatePreviewCardProps) {
  const imageUrl = getTemplateImage(template.templateId);

  return (
    <div
      className={`template-card rounded-lg border overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'template-card--selected ring-2 ring-primary border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="font-semibold text-sm">{template.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        <div className="flex gap-1 flex-wrap">
          {template.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
