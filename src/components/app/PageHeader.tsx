import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  backAction?: { content: string; onAction: () => void };
  children: React.ReactNode;
}

export function PageHeader({ title, backAction, children }: PageHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {backAction && (
          <Button variant="ghost" size="sm" onClick={backAction.onAction} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            {backAction.content}
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}
