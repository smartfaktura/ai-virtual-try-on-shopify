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
      <Card className="group card-elevated border-0 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-px relative overflow-hidden">
        {/* Subtle top gradient band */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
        <CardContent className={`relative ${compact ? 'p-4 space-y-3' : 'p-6 space-y-5'}`}>
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-foreground/[0.04] flex items-center justify-center">
              <Camera className="w-6 h-6 text-foreground/60" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-base">Product Photos</h3>
            <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
              {compact
                ? 'For any product type.'
                : 'Studio, lifestyle, and editorial shots for any product type — clothing, cosmetics, food, home goods.'}
            </p>
          </div>
          {!compact && (
            <span className="inline-block text-xs font-medium text-muted-foreground bg-foreground/[0.03] border border-foreground/[0.06] rounded-full px-3 py-1">
              1–2 credits per image
            </span>
          )}
          <Button
            className="w-full rounded-lg"
            size="sm"
            onClick={() => navigate('/app/generate')}
          >
            {compact ? 'Generate' : 'Start Generating'}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Virtual Try-On */}
      <Card className="group card-elevated border-0 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-px relative overflow-hidden">
        {/* Subtle top gradient band */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
        <CardContent className={`relative ${compact ? 'p-4 space-y-3' : 'p-6 space-y-5'}`}>
          <div className="flex items-start justify-between">
            <div className="w-14 h-14 rounded-2xl bg-foreground/[0.04] flex items-center justify-center">
              <Users className="w-6 h-6 text-foreground/60" />
            </div>
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Users className="w-3 h-3" />
              Try-On
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold text-base">Virtual Try-On</h3>
            <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
              {compact
                ? 'For clothing products.'
                : 'Put your clothing on diverse AI models with any pose and environment. Identity-consistent results.'}
            </p>
          </div>
          {!compact && (
            <span className="inline-block text-xs font-medium text-muted-foreground bg-foreground/[0.03] border border-foreground/[0.06] rounded-full px-3 py-1">
              3 credits per image
            </span>
          )}
          <Button
            className="w-full rounded-lg"
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
