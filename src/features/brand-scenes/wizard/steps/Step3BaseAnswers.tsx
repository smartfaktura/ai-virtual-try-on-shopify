import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BrandSceneBaseAnswers } from "../../types";

interface Props {
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}

const AESTHETIC_PRESETS = [
  "Quiet luxury",
  "Raw editorial",
  "Minimal Scandinavian",
  "Warm artisanal",
  "Clean studio",
  "Sun-bleached coastal",
  "Architectural mono",
  "Soft natural",
  "Bold graphic",
  "Vintage film",
] as const;

export function Step3BaseAnswers({ value, onChange }: Props) {
  const current = value.aesthetic ?? "";
  const isPreset = (AESTHETIC_PRESETS as readonly string[]).includes(current);
  const [showCustom, setShowCustom] = useState(current.length > 0 && !isPreset);

  const selectPreset = (preset: string) => {
    setShowCustom(false);
    onChange({ aesthetic: preset });
  };

  const openCustom = () => {
    setShowCustom(true);
    if (isPreset) onChange({ aesthetic: "" });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Brand aesthetic
        </Label>
        <p className="text-xs text-muted-foreground">
          Pick one — or define your own.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {AESTHETIC_PRESETS.map((preset) => {
            const active = current === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => selectPreset(preset)}
                className={[
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:border-foreground/40",
                ].join(" ")}
              >
                {preset}
              </button>
            );
          })}
          {!showCustom && (
            <button
              type="button"
              onClick={openCustom}
              className="rounded-full border border-dashed border-border bg-transparent px-4 py-2 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Custom aesthetic
            </button>
          )}
        </div>

        {showCustom && (
          <Input
            value={isPreset ? "" : current}
            maxLength={120}
            onChange={(e) => onChange({ aesthetic: e.target.value })}
            placeholder="Describe your own aesthetic in a few words"
            className="mt-1 rounded-xl"
            autoFocus
          />
        )}
      </div>

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
