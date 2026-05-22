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
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center text-[11px] text-muted-foreground leading-relaxed">
        No sub-families defined for this family yet
      </div>
    );
  }

  if (subs.length === 1) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Auto-selected
        </div>
        <div className="text-base font-semibold tracking-tight mt-1.5">
          {subs[0].label}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          This family has a single sub-family — continue to the next step
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
        />
      ))}
    </div>
  );
}

