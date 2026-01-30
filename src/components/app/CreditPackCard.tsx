import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
} from '@shopify/polaris';
import type { CreditPack } from '@/types';

interface CreditPackCardProps {
  pack: CreditPack;
  onPurchase: (packId: string) => void;
}

export function CreditPackCard({ pack, onPurchase }: CreditPackCardProps) {
  const pricePerCredit = (pack.pricePerCredit * 100).toFixed(1);
  
  return (
    <div className={`relative ${pack.popular ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}>
      {pack.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge tone="info">Best Value</Badge>
        </div>
      )}
      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100" align="center">
            <Text as="p" variant="headingLg" fontWeight="bold">
              {pack.credits}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              credits
            </Text>
          </BlockStack>
          
          <div className="text-center">
            <Text as="p" variant="headingMd" fontWeight="semibold">
              ${pack.price}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {pricePerCredit}¢ per credit
            </Text>
          </div>
          
          <Button
            variant={pack.popular ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => onPurchase(pack.packId)}
          >
            Buy Credits
          </Button>
        </BlockStack>
      </Card>
    </div>
  );
}
