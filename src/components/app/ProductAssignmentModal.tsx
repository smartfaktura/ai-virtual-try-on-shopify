import { useState, useMemo } from 'react';
import {
  Modal,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Thumbnail,
  Badge,
  Button,
  Banner,
  Icon,
} from '@shopify/polaris';
import { SearchIcon, CheckCircleIcon } from '@shopify/polaris-icons';
import type { Product } from '@/types';

interface ProductAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onPublish: (product: Product, mode: 'add' | 'replace') => void;
  selectedImageCount: number;
}

export function ProductAssignmentModal({
  open,
  onClose,
  products,
  selectedProduct,
  onSelectProduct,
  onPublish,
  selectedImageCount,
}: ProductAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [publishMode, setPublishMode] = useState<'add' | 'replace'>('add');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.vendor.toLowerCase().includes(query) ||
        p.productType.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handlePublish = () => {
    if (selectedProduct) {
      onPublish(selectedProduct, publishMode);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign to Shopify Product"
      primaryAction={{
        content: `Publish ${selectedImageCount} Image${selectedImageCount !== 1 ? 's' : ''}`,
        onAction: handlePublish,
        disabled: !selectedProduct,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
      size="large"
    >
      <Modal.Section>
        <BlockStack gap="500">
          {!selectedProduct ? (
            <>
              <Text as="p" variant="bodyMd" tone="subdued">
                Search and select a Shopify product to assign your generated images to.
              </Text>

              <TextField
                label="Search products"
                labelHidden
                placeholder="Search by name, vendor, or type..."
                value={searchQuery}
                onChange={setSearchQuery}
                prefix={<Icon source={SearchIcon} />}
                autoComplete="off"
              />

              <BlockStack gap="200">
                {filteredProducts.length === 0 ? (
                  <Banner tone="warning">
                    <Text as="p" variant="bodySm">
                      No products found matching "{searchQuery}"
                    </Text>
                  </Banner>
                ) : (
                  filteredProducts.slice(0, 10).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="w-full p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-hovered transition-colors text-left"
                    >
                      <InlineStack gap="400" blockAlign="center">
                        <Thumbnail
                          source={
                            product.images[0]?.url ||
                            'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
                          }
                          alt={product.title}
                          size="medium"
                        />
                        <BlockStack gap="100">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            {product.title}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {product.vendor} • {product.productType}
                          </Text>
                          <InlineStack gap="100">
                            {product.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} tone="info">
                                {tag}
                              </Badge>
                            ))}
                          </InlineStack>
                        </BlockStack>
                      </InlineStack>
                    </button>
                  ))
                )}
              </BlockStack>
            </>
          ) : (
            <>
              {/* Selected product preview */}
              <div className="p-4 border border-primary rounded-lg bg-primary/5">
                <InlineStack gap="400" blockAlign="center" align="space-between">
                  <InlineStack gap="400" blockAlign="center">
                    <Thumbnail
                      source={
                        selectedProduct.images[0]?.url ||
                        'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
                      }
                      alt={selectedProduct.title}
                      size="medium"
                    />
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={CheckCircleIcon} tone="success" />
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {selectedProduct.title}
                        </Text>
                      </InlineStack>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {selectedProduct.vendor} • {selectedProduct.productType}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <Button variant="plain" onClick={() => onSelectProduct(null as unknown as Product)}>
                    Change
                  </Button>
                </InlineStack>
              </div>

              {/* Publish mode selection */}
              <BlockStack gap="300">
                <Text as="h4" variant="headingSm">
                  Publish Mode
                </Text>

                <InlineStack gap="300">
                  <button
                    type="button"
                    onClick={() => setPublishMode('add')}
                    className={`
                      flex-1 p-4 rounded-lg border-2 transition-all text-left
                      ${publishMode === 'add'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Add to Product
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Keep existing images and add new ones
                      </Text>
                    </BlockStack>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishMode('replace')}
                    className={`
                      flex-1 p-4 rounded-lg border-2 transition-all text-left
                      ${publishMode === 'replace'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <BlockStack gap="100">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Replace All
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Remove existing and use only new images
                      </Text>
                    </BlockStack>
                  </button>
                </InlineStack>
              </BlockStack>

              <Banner tone="info">
                <Text as="p" variant="bodySm">
                  {selectedImageCount} image{selectedImageCount !== 1 ? 's' : ''} will be{' '}
                  {publishMode === 'add' ? 'added to' : 'set as the images for'}{' '}
                  <strong>{selectedProduct.title}</strong>
                </Text>
              </Banner>
            </>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
