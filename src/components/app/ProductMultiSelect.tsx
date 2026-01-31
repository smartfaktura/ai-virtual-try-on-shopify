import {
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  Thumbnail,
  Checkbox,
  Badge,
  TextField,
} from '@shopify/polaris';
import { SearchIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import type { Product } from '@/types';
import { MAX_PRODUCTS_PER_BATCH } from '@/types/bulk';

interface ProductMultiSelectProps {
  products: Product[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProductMultiSelect({
  products,
  selectedIds,
  onSelectionChange,
  searchQuery,
  onSearchChange,
}: ProductMultiSelectProps) {
  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (productId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else if (newSelection.size < MAX_PRODUCTS_PER_BATCH) {
      newSelection.add(productId);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const newSelection = new Set(
      filteredProducts.slice(0, MAX_PRODUCTS_PER_BATCH).map(p => p.id)
    );
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange(new Set());
  };

  return (
    <BlockStack gap="400">
      {/* Search and actions */}
      <InlineStack gap="300" align="space-between" wrap={false}>
        <div className="flex-1">
          <TextField
            label=""
            labelHidden
            placeholder="Search products..."
            value={searchQuery}
            onChange={onSearchChange}
            prefix={<span className="text-muted-foreground"><SearchIcon /></span>}
            autoComplete="off"
          />
        </div>
        <InlineStack gap="200">
          <Button size="slim" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button size="slim" onClick={handleClearAll}>
            Clear
          </Button>
        </InlineStack>
      </InlineStack>

      {/* Selection summary */}
      <InlineStack gap="200" align="center">
        <Badge tone={selectedIds.size >= 2 ? 'success' : 'attention'}>
          {`${selectedIds.size} selected`}
        </Badge>
        <Text as="span" variant="bodySm" tone="subdued">
          (max {MAX_PRODUCTS_PER_BATCH})
        </Text>
      </InlineStack>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
        {filteredProducts.map(product => {
          const isSelected = selectedIds.has(product.id);
          const isDisabled = !isSelected && selectedIds.size >= MAX_PRODUCTS_PER_BATCH;
          
          return (
            <div
              key={product.id}
              onClick={() => !isDisabled && handleToggle(product.id)}
              className={`
                relative rounded-lg border-2 p-2 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* Selection indicator */}
              <div className="absolute top-1 left-1 z-10">
                <Checkbox
                  label=""
                  labelHidden
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => handleToggle(product.id)}
                />
              </div>
              
              {isSelected && (
                <div className="absolute top-1 right-1 z-10 text-primary">
                  <CheckCircleIcon />
                </div>
              )}
              
              {/* Product thumbnail */}
              <div className="aspect-square rounded overflow-hidden mb-2 bg-muted">
                {product.images[0] ? (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Thumbnail source="" alt="" size="large" />
                  </div>
                )}
              </div>
              
              {/* Product info */}
              <Text as="p" variant="bodySm" fontWeight="medium" truncate>
                {product.title}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued" truncate>
                {product.productType}
              </Text>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <BlockStack gap="200" inlineAlign="center">
            <Text as="p" tone="subdued">No products found</Text>
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}
