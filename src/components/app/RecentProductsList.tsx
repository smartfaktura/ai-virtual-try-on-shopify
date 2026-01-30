import { BlockStack, InlineStack, Text, Thumbnail, Badge, Button } from '@shopify/polaris';
import type { Product } from '@/types';

interface RecentProductsListProps {
  products: Product[];
  onSelect: (product: Product) => void;
  maxItems?: number;
}

export function RecentProductsList({ products, onSelect, maxItems = 3 }: RecentProductsListProps) {
  const recentProducts = products.slice(0, maxItems);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <BlockStack gap="300">
      <Text as="h3" variant="headingSm">
        Recent Products
      </Text>
      <BlockStack gap="200">
        {recentProducts.map((product) => (
          <div
            key={product.id}
            className="p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-hovered hover:border-muted-foreground transition-colors"
            onClick={() => onSelect(product)}
          >
            <InlineStack gap="300" blockAlign="center">
              <Thumbnail
                source={product.images[0]?.url || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
                alt={product.title}
                size="small"
              />
              <BlockStack gap="050">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {product.title}
                </Text>
                <InlineStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">
                    {product.vendor}
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued">•</Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {product.images.length} image{product.images.length !== 1 ? 's' : ''}
                  </Text>
                </InlineStack>
              </BlockStack>
              <div className="ml-auto">
                <Button size="slim">Select</Button>
              </div>
            </InlineStack>
          </div>
        ))}
      </BlockStack>
    </BlockStack>
  );
}
