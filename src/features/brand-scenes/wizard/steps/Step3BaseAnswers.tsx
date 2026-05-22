import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BrandSceneBaseAnswers } from "../../types";

interface Props {
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}

export function Step3BaseAnswers({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Field label="Aesthetic">
        <Input
          value={value.aesthetic ?? ""}
          maxLength={120}
          onChange={(e) => onChange({ aesthetic: e.target.value })}
          placeholder="e.g. quiet luxury, raw editorial"
        />
      </Field>

      <Field label="Mood">
        <Input
          value={value.mood ?? ""}
          maxLength={120}
          onChange={(e) => onChange({ mood: e.target.value })}
          placeholder="e.g. calm, golden hour, restrained"
        />
      </Field>

      <Field label="Lighting">
        <Input
          value={value.lighting ?? ""}
          maxLength={120}
          onChange={(e) => onChange({ lighting: e.target.value })}
          placeholder="e.g. soft window light, hard noon sun"
        />
      </Field>

      <Field label="Location">
        <Input
          value={value.location ?? ""}
          maxLength={160}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="e.g. concrete loft, sun-bleached coast"
        />
      </Field>

      <Field label="Framing">
        <Input
          value={value.framing ?? ""}
          maxLength={120}
          onChange={(e) => onChange({ framing: e.target.value })}
          placeholder="e.g. wide 3/4, tight crop, top-down"
        />
      </Field>

      <Field label="Notes">
        <Textarea
          value={value.notes ?? ""}
          maxLength={600}
          rows={3}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Anything else worth anchoring across every scene."
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
