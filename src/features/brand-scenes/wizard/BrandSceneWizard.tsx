import { useState, useEffect } from "react";
import { useWizardState, type WizardStep } from "./useWizardState";
import { WizardLayout } from "./WizardLayout";
import { Step0ChooseSource } from "./steps/Step0ChooseSource";
import { Step1ChooseModule } from "./steps/Step1ChooseModule";
import { Step2ChooseSubFamily } from "./steps/Step2ChooseSubFamily";
import { Step3BaseAnswers } from "./steps/Step3BaseAnswers";
import { Step3Reference } from "./steps/Step3Reference";
import { Step4Cast } from "./steps/Step4Cast";
import { Step4ModuleQuestions } from "./steps/Step4ModuleQuestions";
import { Step5Review } from "./steps/Step5Review";
import { Step6PreviewAndPick } from "./steps/Step6PreviewAndPick";
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
    title: "Cast & product interaction",
    subtitle: "Who's in the scene and how they relate to the product",
  },
  4: {
    title: "Scene aesthetic",
    subtitle: "Pick the kind of scene you want — we'll match the rest",
  },
  5: {
    title: "Category details",
    subtitle: "Questions tailored to the family you picked.",
  },
  6: {
    title: "Preview & pick",
    subtitle: "Generate three variants, then save the one that fits.",
  },
  7: {
    title: "Review",
    subtitle: "Confirm the payload before saving.",
  },
};

const META_REFERENCE: Record<WizardStep, { title: string; subtitle: string }> = {
  ...META_WIZARD,
  3: {
    title: "Reference & intent",
    subtitle:
      "Your image plus how strictly the AI should follow it.",
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

  // Gating
  const referenceStepValid =
    !!answers.reference_image_paths?.length &&
    !!answers.name?.trim() &&
    !!answers.reference_intent;

  const castStepValid =
    !!answers.cast?.preset &&
    (answers.cast.preset === "replicate" || !!answers.cast.interaction) &&
    !!answers.scale?.preset;

  const moduleHasCustomQuestions =
    answers.module &&
    BRAND_SCENE_UNLOCKED_MODULES.includes(answers.module);

  const moduleStepValid = !moduleHasCustomQuestions
    ? true
    : answers.module === "fashion"
      ? isFashionStepValid(answers.module_answers as Partial<FashionModuleAnswers>)
      : answers.module === "footwear"
        ? isFootwearStepValid(
            answers.module_answers as Partial<FootwearModuleAnswers>,
          )
        : answers.module === "eyewear"
          ? isEyewearStepValid(
              answers.module_answers as Partial<EyewearModuleAnswers>,
            )
          : true;

  // ---- Gating (post-reorder: Cast = step 3 in wizard flow, step 4 in reference flow) ----
  const wizardCastStep = isReference ? 4 : 3;
  const wizardAestheticStep = isReference ? null : 4;

  const nextDisabled =
    (step === 1 && !answers.module) ||
    (step === 2 && !answers.sub_family) ||
    (step === 3 && isReference && !referenceStepValid) ||
    (step === wizardCastStep && !castStepValid) ||
    (step === 5 && !isReference && !moduleStepValid);

  let nextDisabledReason: string | null = null;
  if (nextDisabled) {
    if (step === 1) nextDisabledReason = "Pick a product family";
    else if (step === 2) nextDisabledReason = "Pick a sub-family";
    else if (step === 3 && isReference) {
      if (!answers.reference_image_paths?.length)
        nextDisabledReason = "Add a reference image";
      else if (!answers.name?.trim())
        nextDisabledReason = "Name this scene";
      else if (!answers.reference_intent)
        nextDisabledReason = "Choose how strictly to follow the reference";
    } else if (step === wizardCastStep) {
      if (!answers.cast?.preset) nextDisabledReason = "Pick a cast option";
      else if (
        answers.cast.preset !== "replicate" &&
        !answers.cast.interaction
      )
        nextDisabledReason = "Pick how the cast interacts with the product";
      else if (!answers.scale?.preset)
        nextDisabledReason = "Pick a product scale";
    } else if (step === 5) {
      nextDisabledReason = "Answer the required category questions";
    }
  }
  void wizardAestheticStep;

  // Reset scroll to top of the wizard whenever the step changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
    // Also reset any scrollable ancestor (when the wizard sits inside a sticky shell).
    let el: HTMLElement | null = document.querySelector(
      "[data-wizard-root]",
    ) as HTMLElement | null;
    while (el) {
      if (el.scrollTop > 0) el.scrollTop = 0;
      el = el.parentElement;
    }
  }, [step]);

  const handleNext = () => {
    // Step 1: auto-skip sub-family if only one option.
    if (step === 1 && subFamilyCount <= 1) {
      dispatch({ type: "setStep", step: 3 });
      return;
    }
    // Reference flow: Cast (step 4) → skip module questions → Preview (step 6).
    if (step === 4 && isReference) {
      dispatch({ type: "setStep", step: 6 });
      return;
    }
    dispatch({ type: "next" });
  };

  const handleBack = () => {
    if (step === 3 && subFamilyCount <= 1) {
      dispatch({ type: "setStep", step: 1 });
      return;
    }
    if (step === 6 && isReference) {
      dispatch({ type: "setStep", step: 4 });
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
        nextDisabledReason={nextDisabledReason}
        isLastStep={step === 7}
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

        {/* Step 3 — wizard flow: CAST. Reference flow: REFERENCE & INTENT. */}
        {step === 3 && !isReference && (
          <Step4Cast
            module={answers.module}
            subFamily={answers.sub_family}
            source={answers.source}
            answers={answers}
            cast={answers.cast}
            scale={answers.scale}
            onCastChange={(patch) => dispatch({ type: "setCast", patch })}
            onScaleChange={(patch) => dispatch({ type: "setScale", patch })}
          />
        )}

        {step === 3 && isReference && (
          <Step3Reference
            imagePath={answers.reference_image_paths?.[0]}
            previewUrl={answers.reference_preview_url}
            name={answers.name}
            intent={answers.reference_intent}
            note={answers.note}
            onImageChange={(path, previewUrl) =>
              dispatch({ type: "setReferenceImage", path, previewUrl })
            }
            onNameChange={(name) => dispatch({ type: "setName", name })}
            onIntentChange={(intent) =>
              dispatch({ type: "setReferenceIntent", intent })
            }
            onNoteChange={(note) => dispatch({ type: "setNote", note })}
          />
        )}

        {/* Step 4 — wizard flow: SCENE AESTHETIC. Reference flow: CAST. */}
        {step === 4 && !isReference && (
          <Step3BaseAnswers
            module={answers.module}
            subFamily={answers.sub_family}
            castPreset={answers.cast?.preset}
            value={answers.base}
            onChange={(patch) => dispatch({ type: "setBase", patch })}
          />
        )}

        {step === 4 && isReference && (
          <Step4Cast
            module={answers.module}
            subFamily={answers.sub_family}
            source={answers.source}
            answers={answers}
            cast={answers.cast}
            scale={answers.scale}
            onCastChange={(patch) => dispatch({ type: "setCast", patch })}
            onScaleChange={(patch) => dispatch({ type: "setScale", patch })}
          />
        )}

        {step === 5 && !isReference && answers.module && (
          <Step4ModuleQuestions
            module={answers.module}
            answers={answers.module_answers}
            onChange={(patch) => dispatch({ type: "setModuleAnswers", patch })}
          />
        )}

        {step === 6 && <Step6PreviewAndPick answers={answers} />}

        {step === 7 && (
          <Step5Review
            answers={answers}
            onNegativeNoteChange={(note) =>
              dispatch({ type: "setNegativeNote", note })
            }
          />
        )}
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
