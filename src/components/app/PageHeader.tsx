import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backAction?: { content: string; onAction: () => void };
  children: React.ReactNode;
}

export function PageHeader({ title, subtitle, backAction, children }: PageHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          {backAction && (
            <Button variant="ghost" size="sm" onClick={backAction.onAction} className="gap-1.5 self-start">
              <ArrowLeft className="w-4 h-4" />
              {backAction.content}
            </Button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
