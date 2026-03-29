import React from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

const CONFIRM_TEAM = TEAM_MEMBERS.filter(m => ['Sophia', 'Kenji', 'Zara'].includes(m.name));

interface CorrectionConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetLabel: string;
  presetDescription: string;
  creditCost: number;
  creditsRemaining: number;
  onConfirm: () => void;
}

export function CorrectionConfirmModal({
  open, onOpenChange, presetLabel, presetDescription,
  creditCost, creditsRemaining, onConfirm,
}: CorrectionConfirmModalProps) {
  const canAfford = creditsRemaining >= creditCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {presetLabel}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-1">
            {presetDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Team avatars row */}
        <div className="flex items-center gap-3 py-3">
          <div className="flex -space-x-2 shrink-0">
            {CONFIRM_TEAM.map(m => (
              <img key={m.name} src={getOptimizedUrl(m.avatar, { quality: 60 })} alt={m.name} className="w-8 h-8 rounded-full border-2 border-background object-cover" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Our team will regenerate your video with these adjustments.
          </p>
        </div>

        {/* Credit cost */}
        <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cost</span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-primary" />
              {creditCost} credits
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Your balance</span>
            <span className={`text-xs font-medium ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
              {creditsRemaining} credits remaining
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm} disabled={!canAfford} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Variation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
