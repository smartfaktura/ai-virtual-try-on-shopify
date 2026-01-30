import {
  BlockStack,
  InlineGrid,
  Text,
  Icon,
} from '@shopify/polaris';
import {
  ProductIcon,
  UploadIcon,
} from '@shopify/polaris-icons';
import type { GenerationSourceType } from '@/types';

interface SourceTypeSelectorProps {
  sourceType: GenerationSourceType;
  onChange: (sourceType: GenerationSourceType) => void;
}

export function SourceTypeSelector({ sourceType, onChange }: SourceTypeSelectorProps) {
  const options: Array<{
    id: GenerationSourceType;
    title: string;
    description: string;
    icon: typeof ProductIcon;
  }> = [
    {
      id: 'product',
      title: 'From Product',
      description: 'Select an existing Shopify product with images',
      icon: ProductIcon,
    },
    {
      id: 'scratch',
      title: 'From Scratch',
      description: 'Upload your own image file to generate from',
      icon: UploadIcon,
    },
  ];

  return (
    <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`
            p-6 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
            ${sourceType === option.id
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/50 hover:bg-surface-hovered'
            }
          `}
        >
          <BlockStack gap="300">
            <div
              className={`
                w-12 h-12 rounded-lg flex items-center justify-center
                ${sourceType === option.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }
              `}
            >
              <Icon source={option.icon} />
            </div>
            <BlockStack gap="100">
              <Text as="p" variant="bodyLg" fontWeight="semibold">
                {option.title}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {option.description}
              </Text>
            </BlockStack>
            {sourceType === option.id && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <Text as="span" variant="bodySm" fontWeight="medium">
                  Selected
                </Text>
              </div>
            )}
          </BlockStack>
        </button>
      ))}
    </InlineGrid>
  );
}
