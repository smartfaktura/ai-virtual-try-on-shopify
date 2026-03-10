import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

interface ShopifyImportTabProps {
  onProductAdded: () => void;
  onClose: () => void;
}

export function ShopifyImportTab({ onClose }: ShopifyImportTabProps) {
  return (
    <Card>
      <CardContent className="py-16 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold">Shopify Import — Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Our Shopify app is currently under review. This feature will be available once the app is approved.
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
