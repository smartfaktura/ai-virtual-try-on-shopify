import { useState, useRef, useCallback } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';

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
  popoverAlign?: 'start' | 'center' | 'end';
}

export function MetricCard({ title, value, suffix, icon: Icon, tooltip, trend, loading, onClick, progress, progressColor, action, description, popoverAlign }: MetricCardProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = useCallback(() => {
    if (!tooltip) return;
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpen(true), 200);
  }, [tooltip]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setOpen(false), 250);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 min-h-[120px] sm:min-h-[160px] space-y-3">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="h-9 w-28 bg-muted rounded animate-pulse" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const isBranded = tooltip && typeof tooltip === 'object';

  const cardContent = (
    <div
      className={`rounded-xl border border-border/40 bg-card p-2.5 sm:p-5 h-[100px] sm:h-[140px] flex flex-col justify-between transition-all duration-200 hover:border-border/80 hover:shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/60" />}
          <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">{title}</span>
        </div>

        {value !== undefined ? (
          <div className="mt-1.5 sm:mt-2">
            <p className="text-base sm:text-xl font-bold text-foreground tracking-tight leading-none whitespace-nowrap">{value}</p>
            {suffix && (
              <p className="text-xs text-muted-foreground/70 leading-snug mt-1">{suffix}</p>
            )}
          </div>
        ) : description ? (
          <div className="mt-2">
            <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{description}</p>
          </div>
        ) : null}

        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.direction === 'up' ? 'text-primary' : 'text-destructive'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
          </p>
        )}
      </div>

      <div>
        {typeof progress === 'number' && (
          <div className="mt-1">
            <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor || 'bg-primary'}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

        {action && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-0 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-transparent p-0"
            onClick={(e) => { e.stopPropagation(); action.onClick(); }}
          >
            {action.label} →
          </Button>
        )}
      </div>
    </div>
  );

  if (!tooltip || isMobile) return cardContent;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {cardContent}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align={popoverAlign || 'start'}
        sideOffset={6}
        className="w-[240px] p-3 rounded-xl shadow-lg border border-border/60"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start gap-2.5">
          {isBranded && (
            <img
              src={getOptimizedUrl((tooltip as BrandedTooltip).avatar, { quality: 60 })}
              alt={(tooltip as BrandedTooltip).memberName}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-border/30 mt-0.5"
            />
          )}
          <div className="min-w-0">
            {isBranded && (
              <p className="text-xs font-semibold text-foreground mb-0.5">{(tooltip as BrandedTooltip).memberName}</p>
            )}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isBranded ? (tooltip as BrandedTooltip).text : (tooltip as string)}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
