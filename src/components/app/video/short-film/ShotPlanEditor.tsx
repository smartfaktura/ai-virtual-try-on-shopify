import { ShotCard } from './ShotCard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import type { ShotPlanItem } from '@/types/shortFilm';

interface ShotPlanEditorProps {
  shots: ShotPlanItem[];
  onRegenerate: () => void;
}

export function ShotPlanEditor({ shots, onRegenerate }: ShotPlanEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Shot Plan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {shots.length} shots • Review and adjust your film's shot sequence.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRegenerate} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate Plan
        </Button>
      </div>

      <div className="space-y-2">
        {shots.map((shot) => (
          <ShotCard key={shot.shot_index} shot={shot} />
        ))}
      </div>
    </div>
  );
}
