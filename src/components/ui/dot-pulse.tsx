import { cn } from '@/lib/utils';

interface DotPulseProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function DotPulse({ size = 'sm', className }: DotPulseProps) {
  const dot = size === 'md' ? 'w-1.5 h-1.5' : 'w-1 h-1';
  const gap = size === 'md' ? 'gap-1.5' : 'gap-1';
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
          style={{ animationDelay: `${delay}ms`, opacity: 0.7 }}
        />
      ))}
    </span>
  );
}
