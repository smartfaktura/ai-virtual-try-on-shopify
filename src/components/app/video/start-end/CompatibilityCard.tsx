import { Sparkles, Sparkle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransitionCompatibility } from '@/lib/transitionCompatibilityResolver';

interface CompatibilityCardProps {
  compatibility: TransitionCompatibility;
}

const TIER_META: Record<TransitionCompatibility['tier'], { label: string; tone: string; icon: typeof Sparkles }> = {
  strong: { label: 'Strong match', tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20', icon: Sparkles },
  good: { label: 'Good match', tone: 'bg-primary/10 text-primary border-primary/20', icon: Sparkle },
  risky: { label: 'Risky match', tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', icon: AlertTriangle },
  weak: { label: 'Weak match', tone: 'bg-muted text-muted-foreground border-border', icon: Info },
};

export function CompatibilityCard({ compatibility }: CompatibilityCardProps) {
  const meta = TIER_META[compatibility.tier];
  const Icon = meta.icon;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11.5px] font-medium', meta.tone)}>
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
        <span className="text-[11.5px] text-muted-foreground">Frame compatibility</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{compatibility.reason}</p>
      {compatibility.recommendation && (
        <p className="text-[12.5px] text-muted-foreground leading-relaxed">{compatibility.recommendation}</p>
      )}
      {compatibility.sharedElements.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {compatibility.sharedElements.slice(0, 6).map((el) => (
            <span key={el} className="px-2.5 py-1 rounded-full bg-muted text-[11px] text-muted-foreground">
              {el}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
