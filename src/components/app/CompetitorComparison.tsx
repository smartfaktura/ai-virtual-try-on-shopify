import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function CompetitorComparison() {
  const comparisons = [
    { name: 'VOVV.AI', price: '$0.04', highlight: true },
    { name: 'Traditional AI Tools', price: '$0.08', highlight: false },
    { name: 'Photo Studios', price: '$0.12', highlight: false },
  ];

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Save 60-80% Compared to Alternatives</h3>
          </div>
          <p className="text-sm text-muted-foreground">Professional AI product images at a fraction of the cost</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparisons.map((comp) => (
            <div 
              key={comp.name}
              className={`p-4 rounded-lg text-center ${
                comp.highlight 
                  ? 'bg-primary/5 border-2 border-primary/20' 
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm font-semibold">{comp.name}</p>
              <p className="text-xl font-bold">{comp.price}</p>
              <p className="text-sm text-muted-foreground">per image</p>
              {comp.highlight && (
                <p className="mt-2 text-sm text-primary font-semibold">You save up to 67%</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Start free:</strong> Every account gets 20 free credits to test the quality. No credit card required.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
