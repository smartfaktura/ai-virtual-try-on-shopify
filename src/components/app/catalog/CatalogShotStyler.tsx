import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import type { TryOnPose } from '@/types';

export interface ShotOverride {
  poseId?: string;
  backgroundId?: string;
  customPrompt?: string;
  framing?: string;
}

interface CatalogShotStylerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comboKey: string;
  currentOverride?: ShotOverride;
  allPoses: TryOnPose[];
  onSave: (override: ShotOverride | null) => void;
}

export function CatalogShotStyler({ open, onOpenChange, comboKey, currentOverride, allPoses, onSave }: CatalogShotStylerProps) {
  const [poseId, setPoseId] = useState(currentOverride?.poseId || '__default');
  const [backgroundId, setBackgroundId] = useState(currentOverride?.backgroundId || '__default');
  const [customPrompt, setCustomPrompt] = useState(currentOverride?.customPrompt || '');
  const [framing, setFraming] = useState(currentOverride?.framing || '__default');

  // Filter by catalog-specific prefixes
  const poses = allPoses.filter(p => p.poseId.startsWith('catalogPose_'));
  const backgrounds = allPoses.filter(p => p.poseId.startsWith('catalogBg_'));

  const handleSave = () => {
    const override: ShotOverride = {};
    if (poseId) override.poseId = poseId;
    if (backgroundId) override.backgroundId = backgroundId;
    if (customPrompt.trim()) override.customPrompt = customPrompt.trim();
    if (framing) override.framing = framing;
    
    if (Object.keys(override).length === 0) {
      onSave(null);
    } else {
      onSave(override);
    }
  };

  const handleClear = () => {
    onSave(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Customize Shot</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Override Pose</Label>
            <Select value={poseId} onValueChange={setPoseId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Use default pose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Use default</SelectItem>
                {poses.map(p => (
                  <SelectItem key={p.poseId} value={p.poseId}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Override Background</Label>
            <Select value={backgroundId} onValueChange={setBackgroundId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Use default background" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Use default</SelectItem>
                {backgrounds.map(b => (
                  <SelectItem key={b.poseId} value={b.poseId}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Framing</Label>
            <Select value={framing} onValueChange={setFraming}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Use default framing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="full_body">Full Body</SelectItem>
                <SelectItem value="upper_body">Upper Body</SelectItem>
                <SelectItem value="close_up">Close Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Custom Instructions</Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. 'Make it look more luxury', 'add motion blur', 'warm golden tones'"
              className="min-h-[80px] text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          {currentOverride && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-destructive gap-1 mr-auto">
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save Override</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
