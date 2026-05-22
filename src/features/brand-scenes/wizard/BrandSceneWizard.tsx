import { useState } from "react";
import { useWizardState, type WizardStep } from "./useWizardState";
import { WizardLayout } from "./WizardLayout";
import { Step0ChooseSource } from "./steps/Step0ChooseSource";
import { Step1ChooseModule } from "./steps/Step1ChooseModule";
import { Step2ChooseSubFamily } from "./steps/Step2ChooseSubFamily";
import { Step3BaseAnswers } from "./steps/Step3BaseAnswers";
import { Step3Reference } from "./steps/Step3Reference";
import { Step4ModuleQuestions } from "./steps/Step4ModuleQuestions";
import { Step5Review } from "./steps/Step5Review";
import { ResponsibilityModal } from "./components/ResponsibilityModal";
import { isFashionStepValid } from "../modules/fashion/schema";
import type { FashionModuleAnswers } from "../modules/fashion/schema";
import { isFootwearStepValid } from "../modules/footwear/schema";
import type { FootwearModuleAnswers } from "../modules/footwear/schema";
import { isEyewearStepValid } from "../modules/eyewear/schema";
import type { EyewearModuleAnswers } from "../modules/eyewear/schema";
import { BRAND_SCENE_UNLOCKED_MODULES } from "../constants";
import { FAMILY_ID_TO_NAME, SUB_TYPES_BY_FAMILY } from "@/lib/onboardingTaxonomy";

const RESPONSIBILITY_KEY = "brand-scenes:responsibility-accepted";

const META_WIZARD: Record<WizardStep, { title: string; subtitle: string }> = {
  0: {
    title: "How do you want to build this scene?",
    subtitle: "Pick a starting point — wizard inputs or a reference image.",
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
    title: "Scene aesthetic",
    subtitle: "Pick the kind of scene you want — we'll match the rest.",
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

const META_REFERENCE: Record<WizardStep, { title: string; subtitle: string }> = {
  0: META_WIZARD[0],
  1: META_WIZARD[1],
  2: META_WIZARD[2],
  3: {
    title: "Reference & details",
    subtitle:
      "Your image is the brief — we'll replicate framing, lighting, and environment.",
  },
  4: META_WIZARD[4],
  5: {
    title: "Review",
    subtitle: "Confirm before saving.",
  },
};

export function BrandSceneWizard() {
  const { state, dispatch } = useWizardState();
  const { step, answers } = state;
  const isReference = answers.source === "reference";
  const META = isReference ? META_REFERENCE : META_WIZARD;
  const { title, subtitle } = META[step];

  const sessionAccepted =
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(RESPONSIBILITY_KEY) === "1";
  const [modalOpen, setModalOpen] = useState(false);

  const subFamilyCount = answers.module
    ? (SUB_TYPES_BY_FAMILY[FAMILY_ID_TO_NAME[answers.module]] ?? []).length
    : 0;

  // Step gating
  const referenceStepValid =
    !!answers.reference_image_paths?.length &&
    !!answers.name &&
    answers.name.trim().length > 0;

  const moduleHasCustomQuestions =
    answers.module &&
    BRAND_SCENE_UNLOCKED_MODULES.includes(answers.module);

  const moduleStepValid = !moduleHasCustomQuestions
    ? true
    : answers.module === "fashion"
      ? isFashionStepValid(
          answers.module_answers as Partial<FashionModuleAnswers>,
        )
      : answers.module === "footwear"
        ? isFootwearStepValid(
            answers.module_answers as Partial<FootwearModuleAnswers>,
          )
        : answers.module === "eyewear"
          ? isEyewearStepValid(
              answers.module_answers as Partial<EyewearModuleAnswers>,
            )
          : true;

  const nextDisabled =
    (step === 1 && !answers.module) ||
    (step === 2 && !answers.sub_family) ||
    (step === 3 && isReference && !referenceStepValid) ||
    (step === 4 && !isReference && !moduleStepValid);

  const handleNext = () => {
    // Auto-skip Step 2 when the family has a single sub-family
    if (step === 1 && subFamilyCount <= 1) {
      dispatch({ type: "setStep", step: 3 });
      return;
    }
    // Reference path skips Step 4 (module questions)
    if (step === 3 && isReference) {
      dispatch({ type: "setStep", step: 5 });
      return;
    }
    dispatch({ type: "next" });
  };

  const handleBack = () => {
    if (step === 3 && subFamilyCount <= 1) {
      dispatch({ type: "setStep", step: 1 });
      return;
    }
    if (step === 5 && isReference) {
      dispatch({ type: "setStep", step: 3 });
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
        source={answers.source}
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
          <Step1ChooseModule
            value={answers.module}
            onChange={(m) => dispatch({ type: "setModule", module: m })}
          />
        )}

        {step === 2 && answers.module && (
          <Step2ChooseSubFamily
            module={answers.module}
            value={answers.sub_family}
            onChange={(s) => dispatch({ type: "setSubFamily", sub_family: s })}
          />
        )}

        {step === 3 && !isReference && (
          <Step3BaseAnswers
            value={answers.base}
            onChange={(patch) => dispatch({ type: "setBase", patch })}
          />
        )}

        {step === 3 && isReference && (
          <Step3Reference
            imagePath={answers.reference_image_paths?.[0]}
            previewUrl={answers.reference_preview_url}
            name={answers.name}
            placementHint={answers.placement_hint}
            note={answers.note}
            onImageChange={(path, previewUrl) =>
              dispatch({ type: "setReferenceImage", path, previewUrl })
            }
            onNameChange={(name) => dispatch({ type: "setName", name })}
            onPlacementChange={(hint) =>
              dispatch({ type: "setPlacementHint", hint })
            }
            onNoteChange={(note) => dispatch({ type: "setNote", note })}
          />
        )}

        {step === 4 && !isReference && answers.module && (
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
