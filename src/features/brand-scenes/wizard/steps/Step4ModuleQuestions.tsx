import {
  BRAND_SCENE_MODULE_LABELS,
  type BrandSceneModule,
} from "../../constants";
import { FashionQuestions } from "../../modules/fashion/FashionQuestions";
import type { FashionModuleAnswers } from "../../modules/fashion/schema";
import { FootwearQuestions } from "../../modules/footwear/FootwearQuestions";
import type { FootwearModuleAnswers } from "../../modules/footwear/schema";
import { EyewearQuestions } from "../../modules/eyewear/EyewearQuestions";
import type { EyewearModuleAnswers } from "../../modules/eyewear/schema";

interface Props {
  module: BrandSceneModule;
  answers: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

export function Step4ModuleQuestions({ module, answers, onChange }: Props) {
  if (module === "fashion") {
    return (
      <FashionQuestions
        value={answers as Partial<FashionModuleAnswers>}
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

  if (module === "eyewear") {
    return (
      <EyewearQuestions
        value={answers as Partial<EyewearModuleAnswers>}
        onChange={(patch) => onChange(patch as Record<string, unknown>)}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Coming soon
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight mt-1.5">
        {BRAND_SCENE_MODULE_LABELS[module]} questions ship in a later phase
      </h3>
      <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
        We'll add tailored prompts here — scene props, camera, references — one family at a time
      </p>
    </div>
  );
}
