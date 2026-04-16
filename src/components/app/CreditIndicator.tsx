import { Zap } from 'lucide-react';
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

  const canUpgrade = !!planConfig.nextPlanId;
  const ctaLabel = canUpgrade ? 'Upgrade' : 'Top up';
  const handleCta = () => {
    if (canUpgrade) navigate('/app/settings');
    else openBuyModal();
  };

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.06] space-y-2.5">
      {/* Balance + CTA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="w-4 h-4 text-sidebar-foreground/70 shrink-0" strokeWidth={2.25} />
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground truncate">{balance.toLocaleString()}</span>
            <span className="text-[10px] text-sidebar-foreground/40 shrink-0">
              / {isInfinite ? '∞' : monthlyCredits.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={handleCta}
          className="shrink-0 h-7 px-3 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-amber-400 via-rose-400 to-orange-400 bg-[length:200%_100%] animate-shimmer hover:brightness-110 transition-[filter] shadow-[0_2px_8px_-2px_hsl(var(--background)/0.4)]"
        >
          {ctaLabel}
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
