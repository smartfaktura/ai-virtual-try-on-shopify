import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface Step5Props {
  totalJobs: number;
  completedJobs: number;
  productCount: number;
}

export function ProductImagesStep5Generating({ totalJobs, completedJobs, productCount }: Step5Props) {
  const pct = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Generating your visuals</h2>
        <p className="text-sm text-muted-foreground">
          Processing {totalJobs} image{totalJobs !== 1 ? 's' : ''} across {productCount} product{productCount !== 1 ? 's' : ''}
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-5 space-y-3">
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedJobs} / {totalJobs} completed</span>
            <span>{pct}%</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center max-w-sm">
        This usually takes 30–90 seconds per image. You can leave this page — results will appear in your library.
      </p>
    </div>
  );
}
