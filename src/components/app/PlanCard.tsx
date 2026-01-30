import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Divider,
  Icon,
} from '@shopify/polaris';
import { CheckIcon } from '@shopify/polaris-icons';
import type { PricingPlan } from '@/types';

interface PlanCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
}

export function PlanCard({ plan, isAnnual, isCurrentPlan, onSelect }: PlanCardProps) {
  const displayPrice = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
  const totalAnnual = plan.annualPrice;
  const monthlySavings = plan.monthlyPrice * 12 - plan.annualPrice;
  
  return (
    <div 
      className={`relative h-full ${plan.highlighted ? 'ring-2 ring-green-600 rounded-xl' : ''}`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge tone="success">{plan.badge}</Badge>
        </div>
      )}
      <Card>
        <BlockStack gap="400">
          {/* Plan Header */}
          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h3" variant="headingMd" fontWeight="bold">
                {plan.name}
              </Text>
              {isCurrentPlan && <Badge tone="info">Current</Badge>}
            </InlineStack>
            
            {plan.isEnterprise ? (
              <BlockStack gap="100">
                <Text as="p" variant="headingLg" fontWeight="bold">
                  Custom
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Tailored for your needs
                </Text>
              </BlockStack>
            ) : (
              <BlockStack gap="100">
                <InlineStack gap="100" blockAlign="baseline">
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    ${displayPrice}
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    /month
                  </Text>
                </InlineStack>
                {isAnnual && monthlySavings > 0 && (
                  <Text as="p" variant="bodySm" tone="success">
                    Save ${monthlySavings}/year
                  </Text>
                )}
              </BlockStack>
            )}
          </BlockStack>

          {/* Credits */}
          {!plan.isEnterprise && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Text as="p" variant="headingSm" fontWeight="semibold">
                {typeof plan.credits === 'number' ? plan.credits.toLocaleString() : plan.credits}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                credits/month
              </Text>
            </div>
          )}

          <Divider />

          {/* Features */}
          <BlockStack gap="200">
            {plan.features.map((feature, index) => (
              <InlineStack key={index} gap="200" blockAlign="start">
                <div className="text-green-600 mt-0.5">
                  <Icon source={CheckIcon} />
                </div>
                <Text as="p" variant="bodySm">
                  {feature}
                </Text>
              </InlineStack>
            ))}
          </BlockStack>

          {/* CTA */}
          <Button
            variant={plan.highlighted ? 'primary' : 'secondary'}
            fullWidth
            onClick={() => onSelect(plan.planId)}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? 'Current Plan' : plan.ctaText}
          </Button>
        </BlockStack>
      </Card>
    </div>
  );
}
