import { useState } from 'react';
import { BlockStack, InlineStack, Text, TextField, Icon } from '@shopify/polaris';
import { PlusCircleIcon, XSmallIcon } from '@shopify/polaris-icons';

interface NegativesChipSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

// Common things users might want to avoid in product photos
const SUGGESTED_NEGATIVES = [
  { label: 'Hands', value: 'hands' },
  { label: 'Text overlays', value: 'text overlays' },
  { label: 'Busy backgrounds', value: 'busy backgrounds' },
  { label: 'Watermarks', value: 'watermarks' },
  { label: 'Other products', value: 'other products' },
  { label: 'People', value: 'people' },
  { label: 'Shadows', value: 'harsh shadows' },
  { label: 'Reflections', value: 'reflections' },
];

export function NegativesChipSelector({ value, onChange }: NegativesChipSelectorProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleNegative = (negative: string) => {
    const lowerNegative = negative.toLowerCase();
    if (value.some(v => v.toLowerCase() === lowerNegative)) {
      onChange(value.filter(v => v.toLowerCase() !== lowerNegative));
    } else {
      onChange([...value, negative]);
    }
  };

  const addCustomNegative = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
      setCustomInput('');
    }
  };

  const isSelected = (negative: string) => 
    value.some(v => v.toLowerCase() === negative.toLowerCase());

  return (
    <BlockStack gap="300">
      <BlockStack gap="100">
        <Text as="p" variant="bodySm" fontWeight="semibold">
          Don't show these things
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          Click to select items you don't want in your photos
        </Text>
      </BlockStack>

      {/* Suggested chips */}
      <InlineStack gap="200" wrap>
        {SUGGESTED_NEGATIVES.map(({ label, value: negValue }) => (
          <button
            key={negValue}
            type="button"
            onClick={() => toggleNegative(negValue)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              isSelected(negValue)
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-surface border-border hover:border-primary hover:bg-primary/5'
            }`}
          >
            {isSelected(negValue) ? (
              <span className="flex items-center gap-1">
                {label}
                <Icon source={XSmallIcon} />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Icon source={PlusCircleIcon} />
                {label}
              </span>
            )}
          </button>
        ))}
      </InlineStack>

      {/* Custom items already added */}
      {value.filter(v => !SUGGESTED_NEGATIVES.some(s => s.value.toLowerCase() === v.toLowerCase())).length > 0 && (
        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">Your custom items:</Text>
          <InlineStack gap="200" wrap>
            {value
              .filter(v => !SUGGESTED_NEGATIVES.some(s => s.value.toLowerCase() === v.toLowerCase()))
              .map(custom => (
                <button
                  key={custom}
                  type="button"
                  onClick={() => toggleNegative(custom)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground border border-primary flex items-center gap-1"
                >
                  {custom}
                  <Icon source={XSmallIcon} />
                </button>
              ))}
          </InlineStack>
        </BlockStack>
      )}

      {/* Add custom */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <TextField
            label="Add something else"
            labelHidden
            placeholder="Type something to avoid..."
            value={customInput}
            onChange={setCustomInput}
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          onClick={addCustomNegative}
          disabled={!customInput.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          Add
        </button>
      </div>
    </BlockStack>
  );
}
