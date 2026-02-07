import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Users, ArrowRight } from 'lucide-react';

interface GenerationModeCardsProps {
  compact?: boolean;
}

export function GenerationModeCards({ compact = false }: GenerationModeCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Product Photos */}
      <Card className="group hover:shadow-md transition-all hover:border-primary/30 border-t-2 border-t-primary">
        <CardContent className={compact ? 'p-4 space-y-3' : 'p-5 space-y-4'}>
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-foreground" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Product Photos</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {compact
                ? 'For any product type.'
                : 'Studio, lifestyle, and editorial shots for any product type — clothing, cosmetics, food, home goods.'}
            </p>
          </div>
          {!compact && (
            <span className="inline-block text-xs font-medium text-foreground bg-muted rounded-full px-2.5 py-0.5">
              1–2 credits per image
            </span>
          )}
          <Button
            className="w-full"
            size="sm"
            onClick={() => navigate('/app/generate')}
          >
            {compact ? 'Generate' : 'Start Generating'}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Virtual Try-On */}
      <Card className="group hover:shadow-md transition-all hover:border-primary/30 border-t-2 border-t-primary">
        <CardContent className={compact ? 'p-4 space-y-3' : 'p-5 space-y-4'}>
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Users className="w-3 h-3" />
              Try-On
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Virtual Try-On</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {compact
                ? 'For clothing products.'
                : 'Put your clothing on diverse AI models with any pose and environment. Identity-consistent results.'}
            </p>
          </div>
          {!compact && (
            <span className="inline-block text-xs font-medium text-foreground bg-muted rounded-full px-2.5 py-0.5">
              3 credits per image
            </span>
          )}
          <Button
            className="w-full"
            size="sm"
            variant="outline"
            onClick={() => navigate('/app/generate?mode=virtual-try-on')}
          >
            {compact ? 'Try On' : 'Try It'}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
