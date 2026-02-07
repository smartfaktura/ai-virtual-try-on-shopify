import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageOpen } from 'lucide-react';

interface EmptyStateCardProps {
  heading: string;
  description: string;
  action?: {
    content: string;
    onAction: () => void;
  };
  image?: string;
  icon?: React.ReactNode;
}

export function EmptyStateCard({ heading, description, action, icon }: EmptyStateCardProps) {
  return (
    <Card>
      <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          {icon || <PackageOpen className="w-8 h-8 text-muted-foreground" />}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{heading}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onAction}>{action.content}</Button>
        )}
      </CardContent>
    </Card>
  );
}
