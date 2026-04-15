import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, ArrowRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type ConversionCategory, getLayer1Copy } from '@/lib/conversionCopy';

interface PostGenerationUpgradeCardProps {
  category: ConversionCategory;
  onSeeMore: () => void;
  onDismiss: () => void;
}

export function PostGenerationUpgradeCard({ category, onSeeMore, onDismiss }: PostGenerationUpgradeCardProps) {
  const [visible, setVisible] = useState(false);
  const copy = getLayer1Copy(category);

  // 3-second delayed fade-in
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Card className={cn(
      'relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent',
      'animate-in fade-in slide-in-from-bottom-2 duration-500'
    )}>
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <CardContent className="p-5 space-y-3">
        {/* Headline */}
        <div className="flex items-start gap-2.5 pr-6">
          <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold tracking-tight leading-snug">{copy.headline}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{copy.subline}</p>
          </div>
        </div>

        {/* Unlock chips */}
        <div className="flex flex-wrap gap-1.5 pl-7 sm:pl-9">
          {copy.chips.map((chip) => (
            <Badge
              key={chip}
              variant="outline"
              className="text-[10px] font-medium px-2 py-0.5 bg-background border-border/60"
            >
              <Plus className="w-2.5 h-2.5 mr-1 text-primary" />
              {chip}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <div className="pl-7 sm:pl-9">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs font-medium text-primary"
            onClick={onSeeMore}
          >
            See what you can unlock
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
