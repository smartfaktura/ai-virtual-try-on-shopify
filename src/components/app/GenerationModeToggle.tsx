import { Text, Icon } from '@shopify/polaris';
import { ImageIcon, PersonIcon, CheckIcon } from '@shopify/polaris-icons';
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
  {
    id: 'product-only',
    icon: ImageIcon,
    title: 'Product Shot',
    subtitle: 'Focus on the product itself',
    creditCost: '1-2 credits/image',
    useCases: ['Detail shots', 'Flat lay', 'Studio backgrounds', 'E-commerce listings'],
  },
  {
    id: 'virtual-try-on',
    icon: PersonIcon,
    title: 'Virtual Try-On',
    subtitle: 'See it on a model',
    creditCost: '3 credits/image',
    useCases: ['Lookbooks', 'Social media', 'Lifestyle shots', 'Model photography'],
    badgeText: 'AI-Powered',
  },
];

export function GenerationModeToggle({
  mode,
  onChange,
}: GenerationModeToggleProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
      {modeOptions.map((option) => {
        const isSelected = mode === option.id;
        
        return (
          <Card
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`relative cursor-pointer p-5 transition-all duration-200 group ${
              isSelected
                ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                : 'hover:shadow-lg hover:border-border'
            }`}
          >
            {/* Badge */}
            {option.badgeText && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-foreground/10 text-foreground/70">
                  {option.badgeText}
                </span>
              </div>
            )}

            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute top-3 left-3">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-primary/10' 
                  : 'bg-muted group-hover:bg-muted'
              }`}>
                <div className="scale-150">
                  <Icon 
                    source={option.icon} 
                    tone={isSelected ? 'success' : 'subdued'} 
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <Text as="p" variant="headingMd" fontWeight="bold">
                  {option.title}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {option.subtitle}
                </Text>
              </div>

              {/* Credit cost */}
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                isSelected 
                  ? 'border-primary/30 bg-primary/5 text-primary' 
                  : 'border-border bg-muted text-muted-foreground'
              }`}>
                {option.creditCost}
              </div>

              {/* Use cases */}
              <div className="w-full pt-3 border-t border-border">
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  <span className="text-muted-foreground">Best for:</span>
                </Text>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {option.useCases.map((useCase) => (
                    <span 
                      key={useCase}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-muted text-muted-foreground"
                    >
                      {useCase}
                    </span>
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
