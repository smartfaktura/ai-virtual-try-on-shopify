import { useState, useEffect } from "react";
import { useWizardState, type WizardStep } from "./useWizardState";
import { WizardLayout } from "./WizardLayout";
import { Step0ChooseSource } from "./steps/Step0ChooseSource";
import { Step1ChooseModule } from "./steps/Step1ChooseModule";
import { Step2ChooseSubFamily } from "./steps/Step2ChooseSubFamily";
import { Step4Environment } from "./steps/Step4Environment";
import { Step5Photography } from "./steps/Step5Photography";
import { Step3Reference } from "./steps/Step3Reference";
import { Step4Cast } from "./steps/Step4Cast";
import { Step5Review } from "./steps/Step5Review";
import { Step6PreviewAndPick } from "./steps/Step6PreviewAndPick";
import { ResponsibilityModal } from "./components/ResponsibilityModal";
import { FAMILY_ID_TO_NAME, SUB_TYPES_BY_FAMILY } from "@/lib/onboardingTaxonomy";

const RESPONSIBILITY_KEY = "brand-scenes:responsibility-accepted";

const META_WIZARD: Record<WizardStep, { title: string; subtitle?: string }> = {
  0: {
    title: "Where do we start?",
  },
  1: {
    title: "Pick a product family",
  },
  2: {
    title: "Pick a sub-family",
  },
  3: {
    title: "Who's in the scene?",
    subtitle: "Cast and how they relate to the product",
  },
  4: {
    title: "Where does it happen?",
    subtitle: "Scene type first — settings unlock after",
  },
  5: {
    title: "How is the photo taken?",
    subtitle: "Camera, light, color, finish — plain-language",
  },
  6: {
    title: "Preview",
    subtitle: "Review and generate variations",
  },
  7: {
    title: "Review",
    subtitle: "Confirm before saving",
  },
};

const META_REFERENCE: Record<WizardStep, { title: string; subtitle?: string }> = {
  ...META_WIZARD,
  3: {
    title: "Reference & intent",
    subtitle: "Your image plus how strictly the AI should follow it",
  },
  4: {
    title: "Who's in the scene?",
    subtitle: "Cast and how they relate to the product",
  },
};


export function BrandSceneWizard() {
  const { state, dispatch } = useWizardState();
  const { step, answers, sourcePicked } = state;
  const isReference = sourcePicked && answers.source === "reference";
  const META = isReference ? META_REFERENCE : META_WIZARD;

  // Phase 7j — append sub-family label to step titles so the user sees the wizard is tuned.
  const subFamilyLabel = (() => {
    if (!answers.module || !answers.sub_family) return null;
    const subs = SUB_TYPES_BY_FAMILY[FAMILY_ID_TO_NAME[answers.module]] ?? [];
    return subs.find((s) => s.slug === answers.sub_family)?.label ?? null;
  })();
  const stepShowsSubFamily = (step === 3 && !isReference) || (step === 4 && isReference);
  const baseTitle = META[step].title;
  const title =
    stepShowsSubFamily && subFamilyLabel
      ? `${baseTitle} · ${subFamilyLabel}`
      : baseTitle;
  const { subtitle } = META[step];

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

  // ---- Gating (post-reorder: Cast = step 3 in wizard flow, step 4 in reference flow) ----
  const wizardCastStep = isReference ? 4 : 3;

  const nextDisabled =
    (step === 0 && !sourcePicked) ||
    (step === 1 && !answers.module) ||
    (step === 2 && !answers.sub_family) ||
    (step === 3 && isReference && !referenceStepValid) ||
    (step === wizardCastStep && !castStepValid);


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
      if (!answers.cast?.preset) nextDisabledReason = "Choose who's in the shot";
      else if (
        answers.cast.preset !== "replicate" &&
        !answers.cast.interaction
      )
        nextDisabledReason = "Pick how the cast holds, wears, or stands next to the product";
      else if (!answers.scale?.preset)
        nextDisabledReason = "Pick a product scale";
    }
  }

  // Reset scroll to top of the wizard whenever the step changes.
  // The wizard renders inside AppShell's <main id="app-main-scroll"> which is
  // the actual scroll container — window.scrollTo is a fallback for cases
  // where the wizard mounts standalone.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const main = document.getElementById("app-main-scroll");
    if (main) main.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
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

        {/* Step 4 — wizard flow: ENVIRONMENT. Reference flow: CAST. */}
        {step === 4 && !isReference && (
          <Step4Environment
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

        {/* Step 5 — wizard flow: PHOTOGRAPHY & EDIT. (Reference flow skips to step 6.) */}
        {step === 5 && !isReference && (
          <Step5Photography
            module={answers.module}
            subFamily={answers.sub_family}
            castPreset={answers.cast?.preset}
            value={answers.base}
            onChange={(patch) => dispatch({ type: "setBase", patch })}
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
