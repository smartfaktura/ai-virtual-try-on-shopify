import { InlineStack, Text, Icon } from '@shopify/polaris';
import { ImageIcon, PersonIcon } from '@shopify/polaris-icons';
import type { GenerationMode } from '@/types';

interface GenerationModeToggleProps {
  mode: GenerationMode;
  onChange: (mode: GenerationMode) => void;
}

export function GenerationModeToggle({
  mode,
  onChange,
}: GenerationModeToggleProps) {
  return (
    <div className="p-1 bg-muted rounded-xl inline-flex gap-1">
      <button
        onClick={() => onChange('product-only')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
          mode === 'product-only'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon source={ImageIcon} tone={mode === 'product-only' ? 'base' : 'subdued'} />
        <Text as="span" variant="bodySm" fontWeight={mode === 'product-only' ? 'semibold' : 'regular'}>
          Product Shot
        </Text>
      </button>
      <button
        onClick={() => onChange('virtual-try-on')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
          mode === 'virtual-try-on'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Icon source={PersonIcon} tone={mode === 'virtual-try-on' ? 'base' : 'subdued'} />
        <Text as="span" variant="bodySm" fontWeight={mode === 'virtual-try-on' ? 'semibold' : 'regular'}>
          Virtual Try-On
        </Text>
      </button>
    </div>
  );
}
