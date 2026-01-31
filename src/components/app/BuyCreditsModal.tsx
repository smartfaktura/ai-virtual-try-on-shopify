import {
  Modal,
  BlockStack,
  InlineStack,
  InlineGrid,
  Text,
  Button,
  Badge,
  Divider,
  Icon,
} from '@shopify/polaris';
import { WalletIcon } from '@shopify/polaris-icons';
import { creditPacks } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from 'sonner';

export function BuyCreditsModal() {
  const { balance, buyModalOpen, closeBuyModal, addCredits } = useCredits();
  
  const handlePurchase = (credits: number, price: number) => {
    addCredits(credits);
    toast.success(`Added ${credits} credits to your account!`);
    closeBuyModal();
  };
  
  return (
    <Modal
      open={buyModalOpen}
      onClose={closeBuyModal}
      title="Buy Credits"
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: closeBuyModal,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          {/* Current balance */}
          <div className="p-3 rounded-lg bg-muted border border-border">
            <InlineStack gap="200" blockAlign="center" align="center">
              <Icon source={WalletIcon} tone="subdued" />
              <Text as="p" variant="bodySm" tone="subdued">Current Balance:</Text>
              <Text as="p" variant="headingMd" fontWeight="bold">
                {balance} credits
              </Text>
            </InlineStack>
          </div>
          
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Select a Credit Pack</Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Credits never expire • Use across all generation modes
            </Text>
          </BlockStack>
          
          <InlineGrid columns={3} gap="400">
            {creditPacks.map((pack) => (
              <div 
                key={pack.packId}
                className={`relative p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                  pack.popular 
                    ? 'border-primary bg-accent' 
                    : 'border-border bg-muted hover:border-primary'
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
                  <div className="pt-2 w-full">
                    <Button
                      variant={pack.popular ? 'primary' : 'secondary'}
                      fullWidth
                      onClick={() => handlePurchase(pack.credits, pack.price)}
                    >
                      Buy
                    </Button>
                  </div>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {balance + pack.credits} after purchase
                  </Text>
                </BlockStack>
              </div>
            ))}
          </InlineGrid>
          
          <Divider />
          
          <div className="p-4 rounded-lg bg-muted border border-border">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Need more credits regularly?
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Upgrade your plan for monthly credits + extra features
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
