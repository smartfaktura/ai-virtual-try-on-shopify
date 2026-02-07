import { Wallet, PlusCircle } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

export function CreditIndicator() {
  const { balance, isLow, isCritical, isEmpty, openBuyModal } = useCredits();
  
  const getColorClass = () => {
    if (isEmpty || isCritical) return 'text-destructive';
    if (isLow) return 'text-status-warning';
    return 'text-primary';
  };
  
  const getBgClass = () => {
    if (isEmpty || isCritical) return 'bg-destructive/10 border-destructive/30';
    if (isLow) return 'bg-status-warning/10 border-status-warning/30';
    return 'bg-primary/10 border-primary/30';
  };
  
  return (
    <div className={`p-3 rounded-lg border ${getBgClass()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className={`w-4 h-4 ${getColorClass()}`} />
          <div>
            <p className="text-[10px] text-sidebar-foreground/50">Credits</p>
            <p className={`text-sm font-bold ${getColorClass()}`}>{balance}</p>
          </div>
        </div>
        <button
          onClick={openBuyModal}
          className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
          title="Buy credits"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
