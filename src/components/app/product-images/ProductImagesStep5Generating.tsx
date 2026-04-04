import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { UserProduct } from './types';

interface Step5Props {
  totalJobs: number;
  completedJobs: number;
  productCount: number;
  products?: UserProduct[];
  jobMap?: Map<string, string>;
  completedJobIds?: Set<string>;
  failedJobIds?: Set<string>;
}

export function ProductImagesStep5Generating({ totalJobs, completedJobs, productCount, products = [], jobMap, completedJobIds, failedJobIds }: Step5Props) {
  const pct = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  // Derive per-product status from jobMap
  const productStatuses = products.length > 0 && jobMap && jobMap.size > 0
    ? products.map(p => {
        const productJobIds: string[] = [];
        for (const [key, jobId] of jobMap.entries()) {
          if (key.startsWith(p.id + '_')) productJobIds.push(jobId);
        }
        const total = productJobIds.length;
        const done = productJobIds.filter(id => completedJobIds?.has(id) || failedJobIds?.has(id)).length;
        const failed = productJobIds.filter(id => failedJobIds?.has(id)).length;
        return { name: p.title, total, done, failed };
      })
    : null;

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

      {/* Per-product progress rows */}
      {productStatuses && productStatuses.length > 1 && (
        <Card className="w-full max-w-md">
          <CardContent className="p-4 space-y-1.5">
            {productStatuses.map((ps, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {ps.done >= ps.total ? (
                  ps.failed > 0
                    ? <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                    : <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground flex-shrink-0" />
                )}
                <span className="truncate flex-1 text-foreground">{ps.name}</span>
                <span className="text-muted-foreground whitespace-nowrap">{ps.done}/{ps.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center max-w-sm">
        This usually takes 30–90 seconds per image. You can leave this page — results will appear in your library.
      </p>
    </div>
  );
}

export default ProductImagesStep5Generating;
