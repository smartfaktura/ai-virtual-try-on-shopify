import { CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/types';
import { getLandingAssetUrl } from '@/lib/landingAssets';

const templateImages: Record<string, string> = {
  'tpl_001': getLandingAssetUrl('templates/clothing-studio.jpg'),
  'tpl_002': getLandingAssetUrl('templates/clothing-streetwear.jpg'),
  'tpl_003': getLandingAssetUrl('templates/clothing-flatlay.jpg'),
  'tpl_004': getLandingAssetUrl('templates/cosmetics-luxury.jpg'),
  'tpl_005': getLandingAssetUrl('templates/cosmetics-water.jpg'),
  'tpl_006': getLandingAssetUrl('templates/cosmetics-pastel.jpg'),
  'tpl_007': getLandingAssetUrl('templates/food-commercial.jpg'),
  'tpl_008': getLandingAssetUrl('templates/food-rustic.jpg'),
  'tpl_009': getLandingAssetUrl('templates/food-packaging.jpg'),
  'tpl_010': getLandingAssetUrl('templates/home-japandi.jpg'),
  'tpl_011': getLandingAssetUrl('templates/home-warm.jpg'),
  'tpl_012': getLandingAssetUrl('templates/home-concrete.jpg'),
  'tpl_013': getLandingAssetUrl('templates/supplements-clinical.jpg'),
  'tpl_014': getLandingAssetUrl('templates/supplements-athletic.jpg'),
  'tpl_015': getLandingAssetUrl('templates/supplements-luxury.jpg'),
  'tpl_016': getLandingAssetUrl('templates/universal-clean.jpg'),
  'tpl_017': getLandingAssetUrl('templates/universal-gradient.jpg'),
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
