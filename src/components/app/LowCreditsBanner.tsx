import { useState } from 'react';
import { Banner, Button, InlineStack, Text } from '@shopify/polaris';
import { useCredits } from '@/contexts/CreditContext';

export function LowCreditsBanner() {
  const { balance, isLow, isCritical, isEmpty, openBuyModal } = useCredits();
  const [dismissed, setDismissed] = useState(false);
  
  // Don't show if dismissed or credits are healthy
  if (dismissed || (!isLow && !isCritical && !isEmpty)) {
    return null;
  }
  
  const tone = isEmpty ? 'critical' : isCritical ? 'critical' : 'warning';
  const title = isEmpty 
    ? "You're out of credits" 
    : isCritical 
      ? 'Almost out of credits'
      : 'Running low on credits';
  const message = isEmpty
    ? 'Purchase credits to continue generating professional product images.'
    : isCritical
      ? `Only ${balance} credits left! You may not complete your next generation.`
      : `You have ${balance} credits remaining. Top up to continue generating.`;
  
  return (
    <div className="mb-4">
      <Banner
        title={title}
        tone={tone}
        onDismiss={isEmpty ? undefined : () => setDismissed(true)}
      >
        <InlineStack gap="200" blockAlign="center">
          <Text as="p" variant="bodyMd">{message}</Text>
          <Button variant="primary" onClick={openBuyModal}>
            Buy Credits
          </Button>
        </InlineStack>
      </Banner>
    </div>
  );
}
