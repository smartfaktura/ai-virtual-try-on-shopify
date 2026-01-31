import {
  Modal,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  Button,
  Badge,
  Divider,
} from '@shopify/polaris';
import { creditPacks } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from 'sonner';

interface NoCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export function NoCreditsModal({ open, onClose }: NoCreditsModalProps) {
  const { addCredits } = useCredits();
  
  const handlePurchase = (credits: number, price: number) => {
    addCredits(credits);
    toast.success(`Added ${credits} credits to your account!`);
    onClose();
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="You're out of credits"
      secondaryActions={[
        {
          content: 'Maybe Later',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          <Text as="p" variant="bodyMd" tone="subdued">
            Purchase credits to continue generating professional product images.
          </Text>
          
          <InlineGrid columns={3} gap="400">
            {creditPacks.map((pack) => (
              <div 
                key={pack.packId}
                className={`relative p-4 rounded-lg border-2 text-center ${
                  pack.popular 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-surface-subdued'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge tone="success">Best Value</Badge>
                  </div>
                )}
                <BlockStack gap="200" align="center">
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {pack.credits}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">credits</Text>
                  <Text as="p" variant="headingMd" fontWeight="semibold">
                    ${pack.price}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {(pack.pricePerCredit * 100).toFixed(1)}¢ each
                  </Text>
                  <Button
                    variant={pack.popular ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={() => handlePurchase(pack.credits, pack.price)}
                  >
                    Buy
                  </Button>
                </BlockStack>
              </div>
            ))}
          </InlineGrid>
          
          <Divider />
          
          <div className="p-4 rounded-lg bg-surface-subdued border border-border">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Upgrade to Growth Plan
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  500 credits/month + Virtual Try-On
                </Text>
              </BlockStack>
              <Button url="/settings">View Plans</Button>
            </InlineStack>
          </div>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
