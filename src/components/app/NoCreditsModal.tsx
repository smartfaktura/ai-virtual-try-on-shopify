import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
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
          <DialogTitle className="text-lg tracking-tight">You're out of credits</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Purchase credits to continue generating professional product images.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {creditPacks.map((pack) => (
              <div
                key={pack.packId}
                className={`relative p-5 sm:p-6 rounded-2xl border-2 text-center transition-all hover:shadow-md ${
                  pack.popular
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] tracking-wide px-3 py-0.5">
                      Best Value
                    </Badge>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-3xl font-bold tracking-tight">{pack.credits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">credits</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xl font-semibold">${pack.price}</p>
                    <p className="text-xs text-muted-foreground">{(pack.pricePerCredit * 100).toFixed(1)}¢ each</p>
                  </div>
                  <Button
                    variant={pack.popular ? 'default' : 'outline'}
                    className="w-full min-h-[44px]"
                    size="sm"
                    onClick={() => handlePurchase(pack.credits)}
                  >
                    Buy
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-muted/50 border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">Upgrade Your Plan</p>
              <p className="text-xs text-muted-foreground">Get more monthly credits + unlock premium features</p>
            </div>
            <Button variant="outline" size="sm" asChild className="min-h-[40px]">
              <a href="/app/settings">
                View Plans
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </a>
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
