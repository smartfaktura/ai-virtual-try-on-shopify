import { Card, Text, BlockStack, InlineStack, Icon } from '@shopify/polaris';
import type { IconProps } from '@shopify/polaris';

interface MetricCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  icon?: IconProps['source'];
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  loading?: boolean;
}

export function MetricCard({ title, value, suffix, icon, trend, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <BlockStack gap="200">
          <div className="h-4 w-24 bg-surface-hovered rounded animate-pulse" />
          <div className="h-8 w-16 bg-surface-hovered rounded animate-pulse" />
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="p" variant="bodyMd" tone="subdued">
            {title}
          </Text>
          {icon && (
            <div className="text-muted-foreground">
              <Icon source={icon} tone="subdued" />
            </div>
          )}
        </InlineStack>
        <InlineStack gap="100" blockAlign="end">
          <Text as="p" variant="headingXl" fontWeight="semibold">
            {value}
          </Text>
          {suffix && (
            <Text as="span" variant="bodyMd" tone="subdued">
              {suffix}
            </Text>
          )}
        </InlineStack>
        {trend && (
          <Text
            as="p"
            variant="bodySm"
            tone={trend.direction === 'up' ? 'success' : 'critical'}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}
