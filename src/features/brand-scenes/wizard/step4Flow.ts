/**
 * Step 4 sub-flow helpers — shared between Step4Cast (rendering) and
 * BrandSceneWizard (Next/Back gating).
 *
 * Mode is persisted on `cast.extras.design_specific_look = "yes" | "skip"`.
 */
import type { BrandSceneAnswers, BrandSceneCast } from "../types";
import type { BrandSceneModule } from "../constants";
import { CAST_PRESETS_WITH_PEOPLE } from "./constants/cast";
import { resolveAll } from "./registry/resolvePresets";
import { hasOutfitVibe } from "./constants/outfit";
import { CAST_EXTRAS_FIELDS, applicableFields } from "./constants/extras";

export type Step4SubStep = "look" | "essentials" | "people" | "interaction" | "styling";

export type Step4Mode = "yes" | "skip" | undefined;

export function getStep4Mode(cast?: BrandSceneCast): Step4Mode {
  const v = cast?.extras?.design_specific_look;
  if (v === "yes" || v === "skip") return v;
  return undefined;
}

export interface Step4Context {
  module?: BrandSceneModule;
  subFamily?: string;
  isReference: boolean;
}

export interface Step4Flow {
  /** Ordered list of sub-steps the user must walk through. */
  order: Step4SubStep[];
  /** Sub-tabs visible in the tab bar (the user can click freely between these). */
  visibleTabs: Step4SubStep[];
  /** Whether the branch card ("Design a specific look?") is shown on essentials. */
  showBranchCard: boolean;
}

/**
 * Compute the cast-step sub-flow given the current answers + mode.
 *
 * - When cast preset is `replicate` or `none`, the branch card is hidden and
 *   only Essentials is part of the order.
 * - When mode === "skip", only Essentials.
 * - When mode === "yes", we add the optional tabs that have something to ask.
 */
export function computeStep4Flow(
  answers: BrandSceneAnswers,
  ctx: Step4Context,
): Step4Flow {
  const cast = answers.cast;
  const preset = cast?.preset;
  const isReplicate = preset === "replicate";
  const isNone = preset === "none";
  const hasPeople = preset ? CAST_PRESETS_WITH_PEOPLE.includes(preset) : false;

  // Fully locked casts: no branching, only Essentials.
  if (isReplicate || isNone) {
    return {
      order: ["essentials"],
      visibleTabs: ["essentials"],
      showBranchCard: false,
    };
  }

  // No preset yet — show Look first. Once the user picks "Design the look",
  // add Essentials so Next can advance to the cast/interaction picker.
  if (!preset) {
    const mode = getStep4Mode(cast);
    if (mode === "yes") {
      return {
        order: ["look", "essentials"],
        visibleTabs: ["look", "essentials"],
        showBranchCard: true,
      };
    }
    return {
      order: ["look"],
      visibleTabs: ["look"],
      showBranchCard: true,
    };
  }

  const resolved = resolveAll(ctx.module, ctx.subFamily);

  const tabs: Step4SubStep[] = ["look", "essentials"];

  // People tab — visible when the cast actually includes people.
  if (hasPeople) tabs.push("people");

  // Interaction tab — show when there are interaction dials to set.
  const showHandsOn =
    resolved.handsOnProduct.length > 0 &&
    (preset === "hands" || preset === "solo" || preset === "two" || preset === "group");
  const showBodyPart =
    preset !== "hands" && resolved.bodyPartFocus.length > 0;
  if (hasPeople || showHandsOn || showBodyPart) tabs.push("interaction");

  // Styling tab — always available (outfit quiz + note).
  tabs.push("styling");

  const mode = getStep4Mode(cast);
  let order: Step4SubStep[];
  if (!mode) order = ["look"];
  else if (mode === "skip") order = ["look", "essentials"];
  else order = tabs;

  return {
    order,
    visibleTabs: tabs,
    showBranchCard: true,
  };
}


/**
 * Returns null if the sub-step's headline is answered, else a short reason.
 *
 * Essentials reasons mirror what BrandSceneWizard's existing castStepValid
 * already enforces (cast preset + interaction + scale).
 */
export function getSubStepDisabledReason(
  sub: Step4SubStep,
  answers: BrandSceneAnswers,
  ctx: Step4Context,
): string | null {
  const cast = answers.cast;
  const preset = cast?.preset;

  if (sub === "look") {
    if (preset === "replicate" || preset === "none") return null;
    if (!getStep4Mode(cast)) {
      return "Pick whether to design a specific look";
    }
    return null;
  }


  if (sub === "essentials") {
    if (!preset) return "Choose who's in the shot";
    if (preset !== "replicate" && !cast?.interaction) {
      return "Pick how the cast holds, wears, or stands next to the product";
    }
    return null;
  }


  if (sub === "people") {
    if (!cast?.vibe) return "Pick an energy / vibe to continue";
    return null;
  }

  if (sub === "interaction") {
    // Headline = action when people are present, else hands-on-product, else gaze.
    const hasPeople = preset ? CAST_PRESETS_WITH_PEOPLE.includes(preset) : false;
    if (hasPeople && !cast?.action && !cast?.action_note?.trim())
      return "Pick an action to continue";
    if (!hasPeople && !cast?.hands_on_product) {
      return "Pick a hands-on-product gesture to continue";
    }
    return null;
  }

  if (sub === "styling") {
    // Styling is fully optional — never block Next.
    return null;
  }

  return null;
}

/**
 * Step 4 is "complete" (ready for wizard Next) when the active sub-step
 * is the last in the computed order and its headline is answered.
 */
export function isStep4Done(
  sub: Step4SubStep,
  answers: BrandSceneAnswers,
  ctx: Step4Context,
): boolean {
  const flow = computeStep4Flow(answers, ctx);
  const lastIdx = flow.order.length - 1;
  const currentIdx = flow.order.indexOf(sub);
  if (currentIdx < lastIdx) return false;
  return getSubStepDisabledReason(sub, answers, ctx) === null;
}
