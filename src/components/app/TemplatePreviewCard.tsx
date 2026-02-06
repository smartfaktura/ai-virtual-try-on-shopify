import { CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Template } from '@/types';

import clothingStudio from '@/assets/templates/clothing-studio.jpg';
import clothingStreetwear from '@/assets/templates/clothing-streetwear.jpg';
import clothingFlatlay from '@/assets/templates/clothing-flatlay.jpg';
import cosmeticsLuxury from '@/assets/templates/cosmetics-luxury.jpg';
import cosmeticsWater from '@/assets/templates/cosmetics-water.jpg';
import cosmeticsPastel from '@/assets/templates/cosmetics-pastel.jpg';
import foodCommercial from '@/assets/templates/food-commercial.jpg';
import foodRustic from '@/assets/templates/food-rustic.jpg';
import foodPackaging from '@/assets/templates/food-packaging.jpg';
import homeJapandi from '@/assets/templates/home-japandi.jpg';
import homeWarm from '@/assets/templates/home-warm.jpg';
import homeConcrete from '@/assets/templates/home-concrete.jpg';
import supplementsClinical from '@/assets/templates/supplements-clinical.jpg';
import supplementsAthletic from '@/assets/templates/supplements-athletic.jpg';
import supplementsLuxury from '@/assets/templates/supplements-luxury.jpg';
import universalClean from '@/assets/templates/universal-clean.jpg';
import universalGradient from '@/assets/templates/universal-gradient.jpg';

const templateImages: Record<string, string> = {
  'tpl_001': clothingStudio, 'tpl_002': clothingStreetwear, 'tpl_003': clothingFlatlay,
  'tpl_004': cosmeticsLuxury, 'tpl_005': cosmeticsWater, 'tpl_006': cosmeticsPastel,
  'tpl_007': foodCommercial, 'tpl_008': foodRustic, 'tpl_009': foodPackaging,
  'tpl_010': homeJapandi, 'tpl_011': homeWarm, 'tpl_012': homeConcrete,
  'tpl_013': supplementsClinical, 'tpl_014': supplementsAthletic, 'tpl_015': supplementsLuxury,
  'tpl_016': universalClean, 'tpl_017': universalGradient,
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
