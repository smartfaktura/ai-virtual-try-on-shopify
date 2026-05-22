import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REQUIRED_PHRASE = "AGREE";

interface Props {
  open: boolean;
  onCancel: () => void;
  onAccept: () => void;
}

export function ResponsibilityModal({ open, onCancel, onAccept }: Props) {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const [c3, setC3] = useState(false);
  const [phrase, setPhrase] = useState("");

  const canAccept = c1 && c2 && c3 && phrase.trim().toUpperCase() === REQUIRED_PHRASE;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
          </div>
          <DialogTitle className="tracking-tight">
            Reference image — quick check
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Your reference is sent to the AI as a visual guide. It replicates
            framing, lighting and environment while swapping in your product.
            Confirm the three statements below before uploading.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Row
            checked={c1}
            onChange={setC1}
            label="I own this image or have explicit permission to use it"
          />
          <Row
            checked={c2}
            onChange={setC2}
            label="It does not contain copyrighted logos, trademarks, or recognizable people without consent"
          />
          <Row
            checked={c3}
            onChange={setC3}
            label="I understand VOVV.AI will use it as a composition guide to generate a new scene with my product"
          />

          <div className="pt-2">
            <label className="text-xs text-muted-foreground">
              Type <span className="font-mono text-foreground">{REQUIRED_PHRASE}</span> to confirm
            </label>
            <Input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder={REQUIRED_PHRASE}
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="rounded-full">
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            disabled={!canAccept}
            className="rounded-full font-semibold"
          >
            I take responsibility, continue
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
    <label className="flex items-start gap-3 cursor-pointer text-sm leading-relaxed">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        className="mt-0.5"
      />
      <span>{label}</span>
    </label>
  );
}
