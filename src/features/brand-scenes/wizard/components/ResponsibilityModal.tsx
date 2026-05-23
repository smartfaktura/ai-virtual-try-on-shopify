import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onCancel: () => void;
  onAccept: () => void;
}

export function ResponsibilityModal({ open, onCancel, onAccept }: Props) {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);

  const canAccept = c1 && c2 && c3;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-1">
            <ImageIcon className="w-5 h-5 text-foreground/70" />
          </div>
          <DialogTitle className="tracking-tight">Before you upload</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Your image guides framing, lighting and mood — your product replaces the original. Please confirm:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          <Row
            checked={c1}
            onChange={setC1}
            label="I own this image or have permission to use it"
          />
          <Row
            checked={c2}
            onChange={setC2}
            label="No copyrighted logos or recognizable people"
          />
          <Row
            checked={c3}
            onChange={setC3}
            label="It's used only as a composition guide"
          />
        </div>

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onCancel} className="rounded-full">
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            disabled={!canAccept}
            className="rounded-full font-medium"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (b: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer text-sm leading-relaxed rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors px-3.5 py-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <span>{label}</span>
    </label>
  );
}
