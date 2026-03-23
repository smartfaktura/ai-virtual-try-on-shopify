import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-2">
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="h-6 w-14 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const isBrandedTooltip = tooltip && typeof tooltip === 'object';
  const tooltipText = typeof tooltip === 'string' ? tooltip : tooltip?.text;

  const content = (
    <div className="p-4 sm:p-5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
          <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
        </div>
        {tooltip && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex-shrink-0 ml-1 focus:outline-none">
                <Info className="w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-56 p-3" sideOffset={8}>
              {isBrandedTooltip ? (
                <div className="flex gap-2.5 items-start">
                  <img
                    src={(tooltip as BrandedTooltip).avatar}
                    alt={(tooltip as BrandedTooltip).memberName}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-border"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-foreground">{(tooltip as BrandedTooltip).memberName}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{(tooltip as BrandedTooltip).text}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-snug">{tooltipText}</p>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Value or description */}
      {value !== undefined ? (
        <div className="flex items-end gap-1 min-w-0">
          <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight leading-none truncate">{value}</p>
          {suffix && <span className="text-[9px] sm:text-[10px] text-muted-foreground pb-0.5 leading-tight flex-shrink-0">{suffix}</span>}
        </div>
      ) : description ? (
        <p className="text-xs sm:text-sm font-medium text-foreground leading-snug line-clamp-2">{description}</p>
      ) : null}

      {trend && (
        <p className={`text-[10px] font-medium ${trend.direction === 'up' ? 'text-primary' : 'text-destructive'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
        </p>
      )}

      {typeof progress === 'number' && (
        <div className="pt-0.5">
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor || 'bg-primary'}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {action && (
        <div className="pt-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs font-semibold rounded-full"
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
          >
            {action.label} →
          </Button>
        </div>
      )}
    </div>
  );

  const className = `rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ${
    onClick ? 'cursor-pointer hover:shadow-lg hover:border-primary/30' : ''
  }`;

  if (onClick) {
    return <div className={className} onClick={onClick}>{content}</div>;
  }

  return <div className={className}>{content}</div>;
}
