import { Sparkles, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/contexts/CreditContext';

export function CreditIndicator() {
  const { balance, plan, planConfig, openBuyModal } = useCredits();
  const navigate = useNavigate();

  const monthlyCredits = planConfig.monthlyCredits;
  const hasBonus = balance > monthlyCredits && monthlyCredits !== Infinity;
  const usagePercent = monthlyCredits === Infinity
    ? 100
    : hasBonus
      ? 100
      : Math.min(100, Math.max(3, (balance / monthlyCredits) * 100));

  const isFree = plan === 'free';

  return (
    <div className="p-3 rounded-xl bg-white/[0.06] space-y-3">
      {/* Plan name + Upgrade */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
          {planConfig.name} Plan
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
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">{balance}</p>
            <p className="text-[10px] text-sidebar-foreground/40">
              / {monthlyCredits === Infinity ? '∞' : monthlyCredits.toLocaleString()}
            </p>
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

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-sidebar-foreground/30 transition-all duration-500"
          style={{ width: `${usagePercent}%` }}
        />
      </div>
    </div>
  );
}
