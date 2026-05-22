import { Sparkles } from "lucide-react";
import type { BrandSceneModule } from "../../constants";
import { ApparelQuestions } from "../../modules/apparel/ApparelQuestions";
import type { ApparelModuleAnswers } from "../../modules/apparel/schema";
import { FootwearQuestions } from "../../modules/footwear/FootwearQuestions";
import type { FootwearModuleAnswers } from "../../modules/footwear/schema";

const LABELS: Record<BrandSceneModule, string> = {
  apparel: "Apparel",
  footwear: "Footwear",
  eyewear: "Eyewear",
  bags: "Bags",
  fragrance: "Fragrance",
  activewear: "Activewear",
  accessories: "Accessories",
  beauty: "Beauty",
  home: "Home",
};

interface Props {
  module: BrandSceneModule;
  answers: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

export function Step3ModuleQuestions({ module, answers, onChange }: Props) {
  if (module === "apparel") {
    return (
      <ApparelQuestions
        value={answers as Partial<ApparelModuleAnswers>}
        onChange={(patch) => onChange(patch as Record<string, unknown>)}
      />
    );
  }

  if (module === "footwear") {
    return (
      <FootwearQuestions
        value={answers as Partial<FootwearModuleAnswers>}
        onChange={(patch) => onChange(patch as Record<string, unknown>)}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        Module-specific questions for {LABELS[module]} ship in a later phase
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        We'll add tailored prompts here — outfit, scene props, camera, references — one category at a time.
      </p>
    </div>
  );
}
