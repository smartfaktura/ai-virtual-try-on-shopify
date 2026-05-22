import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BrandSceneBaseAnswers } from "../../types";

interface Props {
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}

export function Step2BaseAnswers({ value, onChange }: Props) {
  return (
    <div className="space-y-5">
      <Field label="Aesthetic">
        <Input
          value={value.aesthetic ?? ""}
          onChange={(e) => onChange({ aesthetic: e.target.value })}
          placeholder="e.g. quiet luxury, brutalist editorial"
        />
      </Field>
      <Field label="Mood">
        <Input
          value={value.mood ?? ""}
          onChange={(e) => onChange({ mood: e.target.value })}
          placeholder="e.g. serene, energetic, intimate"
        />
      </Field>
      <Field label="Lighting">
        <Input
          value={value.lighting ?? ""}
          onChange={(e) => onChange({ lighting: e.target.value })}
          placeholder="e.g. soft north window, harsh midday"
        />
      </Field>
      <Field label="Location">
        <Input
          value={value.location ?? ""}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="e.g. concrete loft, coastal cliff"
        />
      </Field>
      <Field label="Framing">
        <Input
          value={value.framing ?? ""}
          onChange={(e) => onChange({ framing: e.target.value })}
          placeholder="e.g. tight crop, wide editorial"
        />
      </Field>
      <Field label="Notes">
        <Textarea
          value={value.notes ?? ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Anything else worth capturing"
          rows={3}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
