import { useReducer } from "react";
import type { BrandSceneAnswers } from "../types";
import type { BrandSceneModule, BrandSceneSource } from "../constants";
import { FAMILY_ID_TO_NAME, SUB_TYPES_BY_FAMILY } from "@/lib/onboardingTaxonomy";

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  step: WizardStep;
  responsibilityAccepted: boolean;
  answers: BrandSceneAnswers;
}

type Action =
  | { type: "setStep"; step: WizardStep }
  | { type: "next" }
  | { type: "back" }
  | { type: "setSource"; source: BrandSceneSource }
  | { type: "setModule"; module: BrandSceneModule }
  | { type: "setSubFamily"; sub_family: string }
  | { type: "setBase"; patch: Partial<BrandSceneAnswers["base"]> }
  | { type: "setModuleAnswers"; patch: Record<string, unknown> }
  | {
      type: "setReferenceImage";
      path: string | null;
      previewUrl: string | null;
    }
  | { type: "setName"; name: string }
  | { type: "setPlacementHint"; hint: string }
  | { type: "setNote"; note: string }
  | { type: "acceptResponsibility" }
  | { type: "reset" };

/** Returns the only sub-family slug if the family has exactly one; else "". */
function autoSubFamily(module: BrandSceneModule | undefined): string {
  if (!module) return "";
  const subs = SUB_TYPES_BY_FAMILY[FAMILY_ID_TO_NAME[module]] ?? [];
  return subs.length === 1 ? subs[0].slug : "";
}

const initial: WizardState = {
  step: 0,
  responsibilityAccepted: false,
  answers: {
    source: "wizard",
    // No pre-selected family — user must explicitly pick one in Step 1.
    module: undefined,
    sub_family: "",
    base: {},
    module_answers: {},
  },
};

const MAX_STEP: WizardStep = 5;

function clampStep(n: number): WizardStep {
  return Math.max(0, Math.min(MAX_STEP, n)) as WizardStep;
}

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "setStep":
      return { ...state, step: action.step };
    case "next":
      return { ...state, step: clampStep(state.step + 1) };
    case "back":
      return { ...state, step: clampStep(state.step - 1) };
    case "setSource":
      return {
        ...state,
        answers: {
          ...state.answers,
          source: action.source,
          reference_image_paths:
            action.source === "wizard"
              ? undefined
              : state.answers.reference_image_paths,
          reference_preview_url:
            action.source === "wizard"
              ? undefined
              : state.answers.reference_preview_url,
          placement_hint:
            action.source === "wizard"
              ? undefined
              : state.answers.placement_hint,
        },
      };
    case "setModule":
      return {
        ...state,
        answers: {
          ...state.answers,
          module: action.module,
          sub_family: autoSubFamily(action.module),
          module_answers: {},
        },
      };
    case "setSubFamily":
      return {
        ...state,
        answers: { ...state.answers, sub_family: action.sub_family },
      };
    case "setBase":
      return {
        ...state,
        answers: {
          ...state.answers,
          base: { ...state.answers.base, ...action.patch },
        },
      };
    case "setModuleAnswers":
      return {
        ...state,
        answers: {
          ...state.answers,
          module_answers: { ...state.answers.module_answers, ...action.patch },
        },
      };
    case "setReferenceImage":
      return {
        ...state,
        answers: {
          ...state.answers,
          reference_image_paths: action.path ? [action.path] : undefined,
          reference_preview_url: action.previewUrl ?? undefined,
        },
      };
    case "setName":
      return { ...state, answers: { ...state.answers, name: action.name } };
    case "setPlacementHint":
      return {
        ...state,
        answers: { ...state.answers, placement_hint: action.hint || undefined },
      };
    case "setNote":
      return {
        ...state,
        answers: { ...state.answers, note: action.note || undefined },
      };
    case "acceptResponsibility":
      return { ...state, responsibilityAccepted: true };
    case "reset":
      return initial;
    default:
      return state;
  }
}

export function useWizardState() {
  const [state, dispatch] = useReducer(reducer, initial);
  return { state, dispatch };
}

export { MAX_STEP };
