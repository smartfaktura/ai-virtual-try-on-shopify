import { Card, EmptyState, Text } from '@shopify/polaris';

interface EmptyStateCardProps {
  heading: string;
  description: string;
  action?: {
    content: string;
    onAction: () => void;
  };
  image?: string;
}

export function EmptyStateCard({ heading, description, action, image }: EmptyStateCardProps) {
  return (
    <Card>
      <EmptyState
        heading={heading}
        action={action}
        image={image || 'https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'}
      >
        <Text as="p" variant="bodyMd" tone="subdued">
          {description}
        </Text>
      </EmptyState>
    </Card>
  );
}
