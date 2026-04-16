import { Sparkles, ArrowUpRight, Plus } from 'lucide-react';
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
    <div
      onClick={() => navigate('/app/settings')}
      className="p-4 rounded-xl bg-white/[0.06] space-y-3 cursor-pointer active:scale-[0.98] transition-all duration-150 hover:bg-white/[0.09]"
    >
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
          className="w-6 h-6 rounded-full bg-white/10 border border-white/[0.08] backdrop-blur-sm flex items-center justify-center text-sidebar-foreground/70 hover:bg-white/20 hover:text-sidebar-foreground active:scale-95 transition-all duration-150"
          title="Buy credits"
        >
          <Plus className="w-3 h-3" />
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