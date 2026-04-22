import { cn } from '@/lib/utils';

interface ShimmerBarProps {
  visible: boolean;
  className?: string;
}

export function ShimmerBar({ visible, className }: ShimmerBarProps) {
  if (!visible) return null;
  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 h-0.5 z-[100] overflow-hidden bg-primary/10',
        className,
      )}
      aria-hidden
    >
      <div className="h-full w-1/4 bg-primary animate-pulse-slide" />
    </div>
  );
}
