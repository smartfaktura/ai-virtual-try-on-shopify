import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrandedTooltip {
  text: string;
  memberName: string;
  avatar: string;
}

interface MetricCardProps {
  title: string;
  value?: string | number;
  suffix?: string;
  icon?: LucideIcon;
  tooltip?: string | BrandedTooltip;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  loading?: boolean;
  onClick?: () => void;
  progress?: number;
  progressColor?: string;
  action?: { label: string; onClick: () => void };
  description?: string;
}

export function MetricCard({ title, value, suffix, icon: Icon, tooltip, trend, loading, onClick, progress, progressColor, action, description }: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-7 min-h-[160px] sm:min-h-[180px] space-y-4">
        <div className="h-3 w-16 bg-muted rounded-full animate-pulse" />
        <div className="h-7 w-20 bg-muted rounded-full animate-pulse" />
        <div className="h-2.5 w-24 bg-muted rounded-full animate-pulse" />
      </div>
    );
  }

  const isBrandedTooltip = tooltip && typeof tooltip === 'object';
  const tooltipText = typeof tooltip === 'string' ? tooltip : tooltip?.text;

  const content = (
    <div className="relative h-full flex flex-col">
      {/* Title */}
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/70" />}
        <p className="text-[11px] sm:text-xs text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
      </div>

      {/* Value or description */}
      <div className="mt-3 flex-1">
        {value !== undefined ? (
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-none whitespace-nowrap">{value}</p>
            {suffix && (
              <p className="text-[11px] sm:text-xs text-muted-foreground/70 leading-snug">{suffix}</p>
            )}
          </div>
        ) : description ? (
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-semibold text-foreground leading-snug">{description}</p>
          </div>
        ) : null}
      </div>

      {trend && (
        <p className={`text-[10px] font-medium mt-2 ${trend.direction === 'up' ? 'text-primary' : 'text-destructive'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}

      {typeof progress === 'number' && (
        <div className="mt-3">
          <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor || 'bg-primary'}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {action && (
        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-0 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-transparent p-0"
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
          >
            {action.label} →
          </Button>
        </div>
      )}

      {/* Tooltip: always visible on mobile, hover-reveal on desktop */}
      {tooltip && (
        <div className="mt-auto pt-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-y-1 sm:group-hover:translate-y-0">
          {isBrandedTooltip ? (
            <div className="flex items-center gap-2 border-t border-border/20 pt-2.5">
              <img
                src={(tooltip as BrandedTooltip).avatar}
                alt={(tooltip as BrandedTooltip).memberName}
                className="w-5 h-5 rounded-full object-cover flex-shrink-0 ring-1 ring-border/30"
              />
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                <span className="font-semibold text-foreground/80">{(tooltip as BrandedTooltip).memberName}</span>
                {' · '}
                {(tooltip as BrandedTooltip).text}
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground leading-snug border-t border-border/20 pt-2.5">{tooltipText}</p>
          )}
        </div>
      )}
    </div>
  );

  const className = `group rounded-2xl border border-border/40 bg-card p-6 sm:p-7 min-h-[160px] sm:min-h-[180px] overflow-hidden transition-all duration-300 hover:border-border/80 hover:shadow-lg hover:shadow-primary/[0.03] ${
    onClick ? 'cursor-pointer' : ''
  }`;

  if (onClick) {
    return <div className={className} onClick={onClick}>{content}</div>;
  }

  return <div className={className}>{content}</div>;
}
