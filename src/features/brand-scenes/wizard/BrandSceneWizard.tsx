import { useState } from "react";
import { useWizardState, type WizardStep } from "./useWizardState";
import { WizardLayout } from "./WizardLayout";
import { Step0ChooseSource } from "./steps/Step0ChooseSource";
import { Step1ChooseModule } from "./steps/Step1ChooseModule";
import { Step2ChooseSubFamily } from "./steps/Step2ChooseSubFamily";
import { Step3BaseAnswers } from "./steps/Step3BaseAnswers";
import { Step4ModuleQuestions } from "./steps/Step4ModuleQuestions";
import { Step5Review } from "./steps/Step5Review";
import { ResponsibilityModal } from "./components/ResponsibilityModal";
import { ReferenceImagePicker } from "./components/ReferenceImagePicker";
import { isFashionStepValid } from "../modules/fashion/FashionQuestions";
import type { FashionModuleAnswers } from "../modules/fashion/schema";
import { isFootwearStepValid } from "../modules/footwear/schema";
import type { FootwearModuleAnswers } from "../modules/footwear/schema";
import { isEyewearStepValid } from "../modules/eyewear/schema";
import type { EyewearModuleAnswers } from "../modules/eyewear/schema";
import { BRAND_SCENE_UNLOCKED_MODULES } from "../constants";
import { FAMILY_ID_TO_NAME, SUB_TYPES_BY_FAMILY } from "@/lib/onboardingTaxonomy";

const RESPONSIBILITY_KEY = "brand-scenes:responsibility-accepted";

const META: Record<WizardStep, { title: string; subtitle: string }> = {
  0: {
    title: "How do you want to build this scene?",
    subtitle: "Pick a starting point — wizard inputs or reference images.",
  },
  1: {
    title: "Choose a product family",
    subtitle: "Matches the 12 canonical families used across the app.",
  },
  2: {
    title: "Choose a sub-family",
    subtitle: "This becomes the catalog group your scene lives under.",
  },
  3: {
    title: "Brand aesthetic",
    subtitle: "The shared mood that anchors every scene you build.",
  },
  4: {
    title: "Category details",
    subtitle: "Questions tailored to the family you picked.",
  },
  5: {
    title: "Review",
    subtitle: "Confirm the payload before saving.",
  },
};

export function BrandSceneWizard() {
  const { state, dispatch } = useWizardState();
  const { step, answers } = state;
  const { title, subtitle } = META[step];

  const sessionAccepted =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(RESPONSIBILITY_KEY) === "1";
  const [modalOpen, setModalOpen] = useState(false);

  const subFamilyCount =
    (SUB_TYPES_BY_FAMILY[FAMILY_ID_TO_NAME[answers.module]] ?? []).length;

  // Step gating
  const nextDisabled =
    (step === 1 && !BRAND_SCENE_UNLOCKED_MODULES.includes(answers.module)) ||
    (step === 2 && !answers.sub_family) ||
    (step === 4 &&
      ((answers.module === "fashion" &&
        !isFashionStepValid(
          answers.module_answers as Partial<FashionModuleAnswers>,
        )) ||
        (answers.module === "footwear" &&
          !isFootwearStepValid(
            answers.module_answers as Partial<FootwearModuleAnswers>,
          )) ||
        (answers.module === "eyewear" &&
          !isEyewearStepValid(
            answers.module_answers as Partial<EyewearModuleAnswers>,
          ))));

  const handleNext = () => {
    // Auto-skip Step 2 when the family has a single sub-family
    if (step === 1 && subFamilyCount <= 1) {
      dispatch({ type: "setStep", step: 3 });
      return;
    }
    dispatch({ type: "next" });
  };

  const handleBack = () => {
    if (step === 3 && subFamilyCount <= 1) {
      dispatch({ type: "setStep", step: 1 });
      return;
    }
    dispatch({ type: "back" });
  };

  const handlePickReference = () => {
    if (sessionAccepted || state.responsibilityAccepted) {
      dispatch({ type: "setSource", source: "reference" });
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <WizardLayout
        step={step}
        title={title}
        subtitle={subtitle}
        onBack={handleBack}
        onNext={handleNext}
        nextDisabled={nextDisabled}
        isLastStep={step === 5}
      >
        {step === 0 && (
          <Step0ChooseSource
            value={answers.source}
            onChange={(s) => dispatch({ type: "setSource", source: s })}
            onPickReference={handlePickReference}
            referenceUnlocked={sessionAccepted || state.responsibilityAccepted}
          />
        )}

        {step === 1 && (
          <div className="space-y-6">
            <Step1ChooseModule
              value={answers.module}
              onChange={(m) => dispatch({ type: "setModule", module: m })}
            />
            {answers.source === "reference" && (
              <ReferenceImagePicker
                paths={answers.reference_image_paths ?? []}
                onChange={(paths) =>
                  dispatch({ type: "setReferenceImages", paths })
                }
              />
            )}
          </div>
        )}

        {step === 2 && (
          <Step2ChooseSubFamily
            module={answers.module}
            value={answers.sub_family}
            onChange={(s) => dispatch({ type: "setSubFamily", sub_family: s })}
          />
        )}

        {step === 3 && (
          <Step3BaseAnswers
            value={answers.base}
            onChange={(patch) => dispatch({ type: "setBase", patch })}
          />
        )}

        {step === 4 && (
          <Step4ModuleQuestions
            module={answers.module}
            answers={answers.module_answers}
            onChange={(patch) => dispatch({ type: "setModuleAnswers", patch })}
          />
        )}

        {step === 5 && <Step5Review answers={answers} />}
      </WizardLayout>

      <ResponsibilityModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onAccept={() => {
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(RESPONSIBILITY_KEY, "1");
          }
          dispatch({ type: "acceptResponsibility" });
          dispatch({ type: "setSource", source: "reference" });
          setModalOpen(false);
        }}
      />
    </>
  );
}
