import { useState } from 'react';
import { useCredits } from '@/contexts/CreditContext';
import { UpgradePlanModal } from './UpgradePlanModal';

export function CreditIndicator() {
  const { balance, planConfig, openBuyModal } = useCredits();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const monthlyCredits = planConfig.monthlyCredits;
  const isInfinite = monthlyCredits === Infinity;

  const usagePercent = isInfinite
    ? 100
    : Math.min(100, Math.max(3, (balance / (monthlyCredits || 1)) * 100));

  const canUpgrade = !!planConfig.nextPlanId;
  const ctaLabel = canUpgrade ? 'Upgrade' : 'Top up';
  const handleCta = () => {
    if (canUpgrade) setUpgradeOpen(true);
    else openBuyModal();
  };

  const balanceDigits = Math.max(1, Math.floor(Math.abs(balance))).toString().length;
  const balanceSizeClass =
    balanceDigits <= 3 ? 'text-2xl' : balanceDigits === 4 ? 'text-xl' : 'text-lg';

  const formatMax = (n: number) =>
    n >= 10000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toLocaleString();

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.06] space-y-3">
      {/* Balance + CTA */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1 min-w-0 flex-1">
          <span className={`${balanceSizeClass} font-semibold tracking-tight text-sidebar-foreground whitespace-nowrap`}>{balance.toLocaleString()}</span>
          <span className="text-[11px] text-sidebar-foreground/50 shrink-0">
            / {isInfinite ? '∞' : formatMax(monthlyCredits)}
          </span>
        </div>
        <button
          onClick={handleCta}
          className="relative overflow-hidden shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold bg-white text-[hsl(var(--sidebar-background))] hover:brightness-105 transition-[filter] shadow-[0_2px_8px_-2px_hsl(0_0%_0%/0.4)]"
        >
          <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] bg-[length:200%_100%] animate-shimmer mix-blend-overlay pointer-events-none" />
          <span className="relative">{ctaLabel}</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="h-full bg-white/40 rounded-full transition-all duration-500"
          style={{ width: `${usagePercent}%` }}
        />
      </div>
      <UpgradePlanModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
