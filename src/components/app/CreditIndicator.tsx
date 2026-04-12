import { Sparkles, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/contexts/CreditContext';

export function CreditIndicator() {
  const { balance, plan, planConfig, openBuyModal } = useCredits();
  const navigate = useNavigate();

  const monthlyCredits = planConfig.monthlyCredits;
  const isInfinite = monthlyCredits === Infinity;

  const usagePercent = isInfinite
    ? 100
    : Math.min(100, Math.max(3, (balance / (monthlyCredits || 1)) * 100));

  const isFree = plan === 'free';

  return (
    <div className="p-3 rounded-xl bg-white/[0.06] space-y-3">
      {/* Plan name + Upgrade */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
          Your plan: {planConfig.name}
        </span>
        {planConfig.nextPlanId && (
          <button
            onClick={() => navigate('/app/settings')}
            className={`flex items-center gap-0.5 text-[10px] font-semibold transition-colors ${
              isFree
                ? 'text-primary hover:text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-md'
                : 'text-primary hover:text-primary/80'
            }`}
          >
            Upgrade
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Balance + Buy */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-sidebar-foreground/70" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-sidebar-foreground">{balance.toLocaleString()}</span>
            <span className="text-[10px] text-sidebar-foreground/40">
              / {isInfinite ? '∞' : monthlyCredits.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={openBuyModal}
          className="p-2 min-w-[36px] min-h-[36px] rounded-lg hover:bg-white/[0.06] transition-colors text-sidebar-foreground/40 hover:text-sidebar-foreground/70 flex items-center justify-center"
          title="Buy credits"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="h-full bg-white/40 rounded-full transition-all duration-500"
          style={{ width: `${usagePercent}%` }}
        />
      </div>
    </div>
  );
}