import { BlockStack, Text } from '@shopify/polaris';
import type { AspectRatio } from '@/types';

interface AspectRatioPreviewProps {
  ratio: AspectRatio;
  size?: 'small' | 'medium' | 'large';
}

const ratioConfig: Record<AspectRatio, { width: number; height: number; label: string }> = {
  '1:1': { width: 1, height: 1, label: 'Square' },
  '4:5': { width: 4, height: 5, label: 'Portrait' },
  '16:9': { width: 16, height: 9, label: 'Wide' },
};

const sizeConfig = {
  small: 40,
  medium: 60,
  large: 80,
};

export function AspectRatioPreview({ ratio, size = 'medium' }: AspectRatioPreviewProps) {
  const config = ratioConfig[ratio];
  const maxSize = sizeConfig[size];
  
  // Calculate dimensions that fit within maxSize
  const aspectRatio = config.width / config.height;
  let width: number;
  let height: number;
  
  if (aspectRatio > 1) {
    // Landscape
    width = maxSize;
    height = maxSize / aspectRatio;
  } else {
    // Portrait or square
    height = maxSize;
    width = maxSize * aspectRatio;
  }

  return (
    <BlockStack gap="100" inlineAlign="center">
      <div
        className="border-2 border-primary rounded-sm bg-primary/10 flex items-center justify-center"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Text as="span" variant="bodySm" fontWeight="semibold">
          {ratio}
        </Text>
      </div>
      <Text as="span" variant="bodySm" tone="subdued">
        {config.label}
      </Text>
    </BlockStack>
  );
}

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const ratios: AspectRatio[] = ['1:1', '4:5', '16:9'];

  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodySm" fontWeight="semibold">
        Aspect Ratio
      </Text>
      <div className="flex gap-3">
        {ratios.map((ratio) => (
          <button
            key={ratio}
            onClick={() => onChange(ratio)}
            className={`p-3 rounded-lg border transition-all ${
              value === ratio
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <AspectRatioPreview ratio={ratio} size="small" />
          </button>
        ))}
      </div>
    </BlockStack>
  );
}
