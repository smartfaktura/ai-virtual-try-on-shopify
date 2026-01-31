import { Button, InlineStack, Text, Icon } from '@shopify/polaris';
import { WalletIcon, PlusCircleIcon } from '@shopify/polaris-icons';
import { useCredits } from '@/contexts/CreditContext';

export function CreditIndicator() {
  const { balance, isLow, isCritical, isEmpty, openBuyModal } = useCredits();
  
  // Determine color state
  const getColorClass = () => {
    if (isEmpty || isCritical) return 'text-critical';
    if (isLow) return 'text-warning';
    return 'text-success';
  };
  
  const getBgClass = () => {
    if (isEmpty || isCritical) return 'bg-critical/10 border-critical/30';
    if (isLow) return 'bg-warning/10 border-warning/30';
    return 'bg-success/10 border-success/30';
  };
  
  return (
    <div className={`p-3 rounded-lg border ${getBgClass()}`}>
      <InlineStack align="space-between" blockAlign="center">
        <InlineStack gap="200" blockAlign="center">
          <div className={getColorClass()}>
            <Icon source={WalletIcon} />
          </div>
          <div>
            <Text as="p" variant="bodySm" tone="subdued">Credits</Text>
            <Text as="p" variant="bodyMd" fontWeight="bold">
              <span className={getColorClass()}>{balance}</span>
            </Text>
          </div>
        </InlineStack>
        <button
          onClick={openBuyModal}
          className="p-1.5 rounded-md hover:bg-black/5 transition-colors"
          title="Buy credits"
        >
          <Icon source={PlusCircleIcon} tone="base" />
        </button>
      </InlineStack>
    </div>
  );
}
