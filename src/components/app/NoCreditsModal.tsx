import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { creditPacks } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from 'sonner';

interface NoCreditsModalProps {
  open: boolean;
  onClose: () => void;
}

export function NoCreditsModal({ open, onClose }: NoCreditsModalProps) {
  const { addCredits } = useCredits();
  
  const handlePurchase = (credits: number) => {
    addCredits(credits);
    toast.success(`Added ${credits} credits to your account!`);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>You're out of credits</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          <p className="text-muted-foreground">
            Purchase credits to continue generating professional product images.
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {creditPacks.map((pack) => (
              <div 
                key={pack.packId}
                className={`relative p-4 rounded-lg border-2 text-center ${
                  pack.popular 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-muted'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{pack.credits}</p>
                  <p className="text-sm text-muted-foreground">credits</p>
                  <p className="text-lg font-semibold">${pack.price}</p>
                  <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ each</p>
                  <Button
                    variant={pack.popular ? 'default' : 'outline'}
                    className="w-full"
                    size="sm"
                    onClick={() => handlePurchase(pack.credits)}
                  >
                    Buy
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="p-4 rounded-lg bg-muted border border-border flex items-center justify-between">
            <div>
              <p className="font-semibold">Upgrade to Growth Plan</p>
              <p className="text-sm text-muted-foreground">500 credits/month + Virtual Try-On</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/app/settings">View Plans</a>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Maybe Later</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
