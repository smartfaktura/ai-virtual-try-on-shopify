import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet } from 'lucide-react';
import { creditPacks } from '@/data/mockData';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from 'sonner';

export function BuyCreditsModal() {
  const { balance, buyModalOpen, closeBuyModal, addCredits } = useCredits();
  
  const handlePurchase = (credits: number) => {
    addCredits(credits);
    toast.success(`Added ${credits} credits to your account!`);
    closeBuyModal();
  };
  
  return (
    <Dialog open={buyModalOpen} onOpenChange={closeBuyModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Current balance */}
          <div className="p-3 rounded-lg bg-muted border border-border flex items-center justify-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Current Balance:</span>
            <span className="text-lg font-bold">{balance} credits</span>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold">Select a Credit Pack</h3>
            <p className="text-sm text-muted-foreground">Credits never expire • Use across all generation modes</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {creditPacks.map((pack) => (
              <div 
                key={pack.packId}
                className={`relative p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                  pack.popular 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-muted hover:border-primary'
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
                  <p className="text-xs text-muted-foreground">{balance + pack.credits} after purchase</p>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="p-4 rounded-lg bg-muted border border-border flex items-center justify-between">
            <div>
              <p className="font-semibold">Need more credits regularly?</p>
              <p className="text-sm text-muted-foreground">Upgrade your plan for monthly credits + extra features</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/app/settings">View Plans</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
