import { cn } from '@/lib/utils';

interface DotPulseProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DotPulse({ size = 'sm', className }: DotPulseProps) {
  const dot =
    size === 'lg'
      ? 'w-[7px] h-[7px]'
      : size === 'md'
      ? 'w-[5px] h-[5px]'
      : 'w-1 h-1';
  const gap =
    size === 'lg' ? 'gap-1.5' : size === 'md' ? 'gap-[5px]' : 'gap-[3px]';
  return (
    <span
      className={cn('inline-flex items-center', gap, className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className={cn(dot, 'rounded-full bg-current animate-dot-wave')}
          style={{ animationDelay: `${delay}ms`, opacity: 0.55 }}
        />
      ))}
    </span>
  );
}
