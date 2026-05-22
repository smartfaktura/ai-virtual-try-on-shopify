import { useReducer } from "react";
import type { BrandSceneAnswers, BrandSceneModule } from "../types";

export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardState {
  step: WizardStep;
  answers: BrandSceneAnswers;
}

type Action =
  | { type: "setStep"; step: WizardStep }
  | { type: "next" }
  | { type: "back" }
  | { type: "setModule"; module: BrandSceneModule }
  | { type: "setBase"; patch: Partial<BrandSceneAnswers["base"]> }
  | { type: "setModuleAnswers"; patch: Record<string, unknown> }
  | { type: "reset" };

const initial: WizardState = {
  step: 1,
  answers: {
    module: "apparel",
    base: {},
    module_answers: {},
  },
};

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "setStep":
      return { ...state, step: action.step };
    case "next":
      return {
        ...state,
        step: Math.min(4, state.step + 1) as WizardStep,
      };
    case "back":
      return {
        ...state,
        step: Math.max(1, state.step - 1) as WizardStep,
      };
    case "setModule":
      return {
        ...state,
        answers: { ...state.answers, module: action.module, module_answers: {} },
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
