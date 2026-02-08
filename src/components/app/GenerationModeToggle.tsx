import { Image as ImageIcon, User } from 'lucide-react';
import type { GenerationMode } from '@/types';
import { Card } from '@/components/ui/card';

interface GenerationModeToggleProps {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

interface ModeOption {
  id: GenerationMode;
  icon: typeof ImageIcon;
  title: string;
  subtitle: string;
  creditCost: string;
  useCases: string[];
  badgeText?: string;
}

const modeOptions: ModeOption[] = [
  { id: 'product-only', icon: ImageIcon, title: 'Product Shot', subtitle: 'Focus on the product itself', creditCost: '4-10 credits/image', useCases: ['Detail shots', 'Flat lay', 'Studio backgrounds', 'E-commerce listings'] },
  { id: 'virtual-try-on', icon: User, title: 'Virtual Try-On', subtitle: 'See it on a model', creditCost: '8-15 credits/image', useCases: ['Lookbooks', 'Social media', 'Lifestyle shots', 'Model photography'], badgeText: 'AI-Powered' },
];

export function GenerationModeToggle({ mode, onChange }: GenerationModeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl">
      {modeOptions.map((option) => {
        const isSelected = mode === option.id;
        return (
          <Card
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`relative cursor-pointer p-3 sm:p-5 transition-all duration-200 group ${
              isSelected ? 'ring-2 ring-primary bg-primary/5 shadow-md' : 'hover:shadow-lg hover:border-border'
            }`}
          >
            {option.badgeText && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-semibold rounded-full bg-foreground/10 text-foreground/70">{option.badgeText}</span>
              </div>
            )}
            {isSelected && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4 pt-3 sm:pt-4">
              <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                <option.icon className={`w-5 h-5 sm:w-8 sm:h-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-sm sm:text-base font-bold">{option.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{option.subtitle}</p>
              </div>
              <div className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium border ${
                isSelected ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-muted text-muted-foreground'
              }`}>
                {option.creditCost}
              </div>
              <div className="hidden sm:block w-full pt-3 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground">Best for:</p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {option.useCases.map((useCase) => (
                    <span key={useCase} className="px-2 py-0.5 text-[11px] rounded-md bg-muted text-muted-foreground">{useCase}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
