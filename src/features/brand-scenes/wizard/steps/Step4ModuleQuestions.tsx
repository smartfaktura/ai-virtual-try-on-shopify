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
import { WatchesQuestions } from "../../modules/watches/WatchesQuestions";
import type { WatchesModuleAnswers } from "../../modules/watches/schema";
import { JewelryQuestions } from "../../modules/jewelry/JewelryQuestions";
import type { JewelryModuleAnswers } from "../../modules/jewelry/schema";
import { BagsAccessoriesQuestions } from "../../modules/bags-accessories/BagsAccessoriesQuestions";
import type { BagsAccessoriesModuleAnswers } from "../../modules/bags-accessories/schema";
import { HatsCapsBeaniesQuestions } from "../../modules/hats-caps-beanies/HatsCapsBeaniesQuestions";
import type { HatsCapsBeaniesModuleAnswers } from "../../modules/hats-caps-beanies/schema";
import { BeautyFragranceQuestions } from "../../modules/beauty-fragrance/BeautyFragranceQuestions";
import type { BeautyFragranceModuleAnswers } from "../../modules/beauty-fragrance/schema";
import { HomeQuestions } from "../../modules/home/HomeQuestions";
import type { HomeModuleAnswers } from "../../modules/home/schema";
import { TechQuestions } from "../../modules/tech/TechQuestions";
import type { TechModuleAnswers } from "../../modules/tech/schema";
import { FoodDrinkQuestions } from "../../modules/food-drink/FoodDrinkQuestions";
import type { FoodDrinkModuleAnswers } from "../../modules/food-drink/schema";
import { WellnessQuestions } from "../../modules/wellness/WellnessQuestions";
import type { WellnessModuleAnswers } from "../../modules/wellness/schema";

interface Props {
  module: BrandSceneModule;
  answers: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

export function Step4ModuleQuestions({ module, answers, onChange }: Props) {
  const pass = (patch: Record<string, unknown>) =>
    onChange(patch as Record<string, unknown>);

  if (module === "fashion") {
    return (
      <FashionQuestions
        value={answers as Partial<FashionModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "footwear") {
    return (
      <FootwearQuestions
        value={answers as Partial<FootwearModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "eyewear") {
    return (
      <EyewearQuestions
        value={answers as Partial<EyewearModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "watches") {
    return (
      <WatchesQuestions
        value={answers as Partial<WatchesModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "jewelry") {
    return (
      <JewelryQuestions
        value={answers as Partial<JewelryModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "bags-accessories") {
    return (
      <BagsAccessoriesQuestions
        value={answers as Partial<BagsAccessoriesModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "hats-caps-beanies") {
    return (
      <HatsCapsBeaniesQuestions
        value={answers as Partial<HatsCapsBeaniesModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "beauty-fragrance") {
    return (
      <BeautyFragranceQuestions
        value={answers as Partial<BeautyFragranceModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "home") {
    return (
      <HomeQuestions
        value={answers as Partial<HomeModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "tech") {
    return (
      <TechQuestions
        value={answers as Partial<TechModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "food-drink") {
    return (
      <FoodDrinkQuestions
        value={answers as Partial<FoodDrinkModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }
  if (module === "wellness") {
    return (
      <WellnessQuestions
        value={answers as Partial<WellnessModuleAnswers>}
        onChange={(patch) => pass(patch as Record<string, unknown>)}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Coming soon
      </div>
      <div className="text-base font-semibold text-foreground tracking-tight mt-1.5">
        {BRAND_SCENE_MODULE_LABELS[module]} questions ship in a later phase
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
        We'll add tailored prompts here — scene props, camera, references — one family at a time
      </p>
    </div>
  );
}
