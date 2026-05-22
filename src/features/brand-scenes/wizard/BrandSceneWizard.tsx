import { useWizardState } from "./useWizardState";
import { WizardLayout } from "./WizardLayout";
import { Step1ChooseModule } from "./steps/Step1ChooseModule";
import { Step2BaseAnswers } from "./steps/Step2BaseAnswers";
import { Step3ModuleQuestions } from "./steps/Step3ModuleQuestions";
import { Step4Review } from "./steps/Step4Review";
import { isApparelStepValid } from "../modules/apparel/ApparelQuestions";
import type { ApparelModuleAnswers } from "../modules/apparel/schema";
import { isFootwearStepValid } from "../modules/footwear/schema";
import type { FootwearModuleAnswers } from "../modules/footwear/schema";

const META: Record<
  1 | 2 | 3 | 4,
  { title: string; subtitle: string }
> = {
  1: { title: "Choose a category", subtitle: "Which product family is this scene for?" },
  2: { title: "Brand aesthetic", subtitle: "The shared mood that anchors every scene you build" },
  3: { title: "Category details", subtitle: "Questions tailored to the category you picked" },
  4: { title: "Review", subtitle: "Confirm the payload before saving" },
};

export function BrandSceneWizard() {
  const { state, dispatch } = useWizardState();
  const { step, answers } = state;
  const { title, subtitle } = META[step];

  const nextDisabled =
    step === 3 &&
    ((answers.module === "apparel" &&
      !isApparelStepValid(
        answers.module_answers as Partial<ApparelModuleAnswers>,
      )) ||
      (answers.module === "footwear" &&
        !isFootwearStepValid(
          answers.module_answers as Partial<FootwearModuleAnswers>,
        )));

  return (
    <WizardLayout
      step={step}
      title={title}
      subtitle={subtitle}
      onBack={() => dispatch({ type: "back" })}
      onNext={() => dispatch({ type: "next" })}
      nextDisabled={nextDisabled}
      isLastStep={step === 4}
    >
      {step === 1 && (
        <Step1ChooseModule
          value={answers.module}
          onChange={(m) => dispatch({ type: "setModule", module: m })}
        />
      )}
      {step === 2 && (
        <Step2BaseAnswers
          value={answers.base}
          onChange={(patch) => dispatch({ type: "setBase", patch })}
        />
      )}
      {step === 3 && (
        <Step3ModuleQuestions
          module={answers.module}
          answers={answers.module_answers}
          onChange={(patch) => dispatch({ type: "setModuleAnswers", patch })}
        />
      )}
      {step === 4 && <Step4Review answers={answers} />}
    </WizardLayout>
  );
}
