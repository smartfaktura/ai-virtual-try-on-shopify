import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CreditPack } from '@/types';

interface CreditPackCardProps {
  pack: CreditPack;
  onPurchase: (packId: string) => void;
}

export function CreditPackCard({ pack, onPurchase }: CreditPackCardProps) {
  const pricePerCredit = (pack.pricePerCredit * 100).toFixed(1);
  
  return (
    <div className={`relative ${pack.popular ? 'ring-2 ring-primary rounded-xl' : ''}`}>
      {pack.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
        </div>
      )}
      <Card>
        <CardContent className="p-5 space-y-3 text-center">
          <div>
            <p className="text-2xl font-bold">{pack.credits}</p>
            <p className="text-sm text-muted-foreground">credits</p>
          </div>
          <div>
            <p className="text-lg font-semibold">${pack.price}</p>
            <p className="text-sm text-muted-foreground">{pricePerCredit}¢ per credit</p>
          </div>
          <Button
            variant={pack.popular ? 'default' : 'outline'}
            className="w-full"
            onClick={() => onPurchase(pack.packId)}
          >
            Buy Credits
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
