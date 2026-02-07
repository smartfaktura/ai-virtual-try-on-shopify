import { Wallet, PlusCircle, Sparkles } from 'lucide-react';
import { useCredits } from '@/contexts/CreditContext';

export function CreditIndicator() {
  const { balance, isLow, isCritical, isEmpty, openBuyModal } = useCredits();

  return (
    <div className="p-3 rounded-xl bg-white/[0.06] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-sidebar-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] text-sidebar-foreground/40 font-medium uppercase tracking-wide">Credits</p>
            <p className="text-sm font-bold text-sidebar-foreground">{balance}</p>
          </div>
        </div>
        <button
          onClick={openBuyModal}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground/70"
          title="Buy credits"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>
      {/* Mini progress bar */}
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-sidebar-foreground/30 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(5, (balance / 300) * 100))}%` }}
        />
      </div>
    </div>
  );
}
