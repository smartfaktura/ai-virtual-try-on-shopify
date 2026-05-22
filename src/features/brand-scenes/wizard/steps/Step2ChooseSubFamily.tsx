import { FAMILY_ID_TO_NAME, SUB_TYPES_BY_FAMILY } from "@/lib/onboardingTaxonomy";
import type { BrandSceneModule } from "../../constants";
import { WizardCard } from "../components/WizardCard";

interface Props {
  module: BrandSceneModule;
  value: string;
  onChange: (sub_family: string) => void;
}

export function Step2ChooseSubFamily({ module, value, onChange }: Props) {
  const subs = SUB_TYPES_BY_FAMILY[FAMILY_ID_TO_NAME[module]] ?? [];

  if (subs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No sub-families defined for this family yet.
        </p>
      </div>
    );
  }

  if (subs.length === 1) {
    return (
      <div className="rounded-2xl border border-border bg-muted/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Auto-selected
        </div>
        <div className="text-base font-semibold tracking-tight mt-1">
          {subs[0].label}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          This family has a single sub-family. Continue to the next step.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {subs.map((s) => (
        <WizardCard
          key={s.slug}
          active={s.slug === value}
          onClick={() => onChange(s.slug)}
          title={s.label}
          tag="Sub-family"
        />
      ))}
    </div>
  );
}
