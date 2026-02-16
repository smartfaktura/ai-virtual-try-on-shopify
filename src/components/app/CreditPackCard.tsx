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
    <div className={`relative h-full ${pack.popular ? 'ring-2 ring-primary rounded-2xl' : ''}`}>
      {pack.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground text-[10px] tracking-wide px-3 py-0.5">
            Best Value
          </Badge>
        </div>
      )}
      <Card className="h-full transition-shadow duration-200 hover:shadow-md rounded-2xl">
        <CardContent className="p-5 sm:p-6 space-y-4 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">credits</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-semibold">${pack.price}</p>
            <p className="text-xs text-muted-foreground">{pricePerCredit}¢ per credit</p>
          </div>
          <p className="text-xs text-muted-foreground">≈ {Math.round(pack.credits / 10)} images</p>
          <Button
            variant={pack.popular ? 'default' : 'outline'}
            className="w-full min-h-[44px]"
            onClick={() => onPurchase(pack.packId)}
          >
            Buy Credits
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
