import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  InlineGrid,
  Icon,
} from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';

export function CompetitorComparison() {
  const comparisons = [
    { name: 'nanobanna', price: '$0.008', highlight: true },
    { name: 'Competitor A', price: '$0.03', highlight: false },
    { name: 'Competitor B', price: '$0.05', highlight: false },
  ];

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <InlineStack gap="200" blockAlign="center">
            <div className="text-green-600">
              <Icon source={CheckCircleIcon} />
            </div>
            <Text as="h3" variant="headingMd">
              Save 60-80% Compared to Alternatives
            </Text>
          </InlineStack>
          <Text as="p" variant="bodySm" tone="subdued">
            Professional AI product images at a fraction of the cost
          </Text>
        </BlockStack>

        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          {comparisons.map((comp) => (
            <div 
              key={comp.name}
              className={`p-4 rounded-lg text-center ${
                comp.highlight 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-gray-50'
              }`}
            >
              <Text as="p" variant="bodySm" fontWeight="semibold">
                {comp.name}
              </Text>
              <Text 
                as="p" 
                variant="headingMd" 
                fontWeight="bold"
              >
                {comp.price}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                per image
              </Text>
              {comp.highlight && (
                <div className="mt-2">
                  <Text as="p" variant="bodySm" tone="success" fontWeight="semibold">
                    You save up to 84%
                  </Text>
                </div>
              )}
            </div>
          ))}
        </InlineGrid>

        <div className="bg-blue-50 rounded-lg p-3">
          <InlineStack gap="200" align="center" blockAlign="center">
            <Text as="p" variant="bodySm" tone="subdued">
              💡 <strong>Start free:</strong> Every store gets 5 credits to test the quality. No credit card required.
            </Text>
          </InlineStack>
        </div>
      </BlockStack>
    </Card>
  );
}
