import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Users, ArrowRight } from 'lucide-react';

interface GenerationModeCardsProps {
  compact?: boolean;
}

export function GenerationModeCards({ compact = false }: GenerationModeCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Product Photos */}
      <div className="relative rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">Product Photos</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {compact
              ? 'For any product type.'
              : 'Studio, lifestyle, and editorial shots for any product type — clothing, cosmetics, food, home goods.'}
          </p>
        </div>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-3">
            1–2 credits per image
          </p>
        )}
        <Button
          className="w-full rounded-full font-semibold gap-2 mt-4 shadow-lg shadow-primary/25"
          onClick={() => navigate('/app/freestyle')}
        >
          {compact ? 'Generate' : 'Start Generating'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Virtual Try-On */}
      <div className="relative rounded-2xl border border-border bg-card p-6 flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <Badge variant="secondary" className="text-[10px] gap-1 rounded-full">
            <Users className="w-3 h-3" />
            Try-On
          </Badge>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">Virtual Try-On</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {compact
              ? 'For clothing products.'
              : 'Put your clothing on diverse AI models with any pose and environment. Identity-consistent results.'}
          </p>
        </div>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-3">
            3 credits per image
          </p>
        )}
        <Button
          className="w-full rounded-full font-semibold gap-2 mt-4"
          variant="outline"
          onClick={() => navigate('/app/generate?mode=virtual-try-on')}
        >
          {compact ? 'Try On' : 'Try It'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
