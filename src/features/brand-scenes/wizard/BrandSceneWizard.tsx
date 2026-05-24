import { useMemo, useRef, useState, useEffect } from "react";
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
import {
  computeStep4Flow,
  getStep4Mode,
  getSubStepDisabledReason,
  type Step4SubStep,
} from "./step4Flow";
import { FAMILY_ID_TO_NAME, SUB_TYPES_BY_FAMILY } from "@/lib/onboardingTaxonomy";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { assembleSceneDirective } from "../prompt/assembleSceneDirective";
import type { GeneratedVariation } from "../api/brandSceneApi";

// Persists across Step 6 unmount when user navigates back/forward in the wizard,
// so a paid generation isn't silently discarded. Tied to the compiled prompt
// hash — if the user edits a prior step in a way that changes the prompt, the
// stale variations are cleared automatically.
export interface BrandSceneCache {
  promptHash: string;
  variations: GeneratedVariation[];
  selectedUrl: string | null;
}

function hashPrompt(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h.toString(36);
}



const META_WIZARD: Record<WizardStep, { title: string; subtitle?: string }> = {
  0: {
    title: "Where do we start?",
  },
  1: {
    title: "Pick a product family",
    subtitle: "Your saved scene will appear under this category in your library",
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
    title: "Review & generate",
    subtitle: "Final check before generating variations",
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
  const { user } = useAuth();
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

  const [modalOpen, setModalOpen] = useState(false);

  // Variation cache — survives Step6 unmount during back-navigation.
  const [variationCache, setVariationCache] = useState<BrandSceneCache | null>(null);
  const currentPromptHash = useMemo(
    () => hashPrompt(assembleSceneDirective(answers)),
    [answers],
  );
  // Invalidate the cache when the compiled prompt changes (user edited a prior step).
  useEffect(() => {
    if (variationCache && variationCache.promptHash !== currentPromptHash) {
      setVariationCache(null);
    }
  }, [currentPromptHash, variationCache]);

  const wizardCastStep = isReference ? 4 : 3;
  const onCastStep = step === wizardCastStep;
  const [step4SubStep, setStep4SubStep] = useState<Step4SubStep>("look");
  const [visitedSubSteps, setVisitedSubSteps] = useState<Set<Step4SubStep>>(
    () => new Set<Step4SubStep>(["look"]),
  );
  const step4Ctx = { module: answers.module, subFamily: answers.sub_family, isReference };
  const step4Flow = computeStep4Flow(answers, step4Ctx);
  const step4Mode = getStep4Mode(answers.cast);

  // Track which sub-steps the user has actually visited (controls tab ✓).
  useEffect(() => {
    if (!onCastStep) return;
    setVisitedSubSteps((prev) =>
      prev.has(step4SubStep) ? prev : new Set(prev).add(step4SubStep),
    );
  }, [onCastStep, step4SubStep]);

  // Auto-cast = treat every cast sub-step as "handled" (the system filled them).
  useEffect(() => {
    if (!onCastStep || step4Mode !== "skip") return;
    setVisitedSubSteps((prev) => {
      const next = new Set(prev);
      for (const t of step4Flow.visibleTabs) next.add(t);
      return next;
    });
  }, [onCastStep, step4Mode, step4Flow.visibleTabs]);

  // Snap to the first available sub-step if the current one disappears.
  useEffect(() => {
    if (!onCastStep) return;
    if (!step4Flow.order.includes(step4SubStep)) {
      setStep4SubStep(step4Flow.order[0] ?? "essentials");
    }
  }, [onCastStep, step4Flow.order, step4SubStep]);

  const subFamilyCount = answers.module
    ? (SUB_TYPES_BY_FAMILY[FAMILY_ID_TO_NAME[answers.module]] ?? []).length
    : 0;

  // Gating
  const referenceStepValid =
    !!answers.reference_image_paths?.length &&
    !!answers.name?.trim() &&
    !!answers.reference_intent;

  const step4SubReason = onCastStep
    ? getSubStepDisabledReason(step4SubStep, answers, step4Ctx)
    : null;

  const nextDisabled =
    (step === 0 && !sourcePicked) ||
    (step === 1 && !answers.module) ||
    (step === 2 && !answers.sub_family) ||
    (step === 3 && isReference && !referenceStepValid) ||
    (onCastStep && step4SubReason !== null);

  let nextDisabledReason: string | null = null;
  if (nextDisabled) {
    if (step === 0) nextDisabledReason = "Pick a starting point";
    else if (step === 1) nextDisabledReason = "Pick a product family";
    else if (step === 2) nextDisabledReason = "Pick a sub-family";
    else if (step === 3 && isReference) {
      if (!answers.reference_image_paths?.length)
        nextDisabledReason = "Add a reference image";
      else if (!answers.name?.trim())
        nextDisabledReason = "Name this scene";
      else if (!answers.reference_intent)
        nextDisabledReason = "Choose how strictly to follow the reference";
    } else if (onCastStep) {
      nextDisabledReason = step4SubReason;
    }
  }

  // Reset scroll to top of the wizard whenever the step changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const main = document.getElementById("app-main-scroll");
    if (main) main.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step, step4SubStep]);

  const handleNext = () => {
    // Step 4 internal sub-step navigation.
    if (onCastStep) {
      // Auto-cast on the Look chooser → skip all sub-steps, go to the next
      // wizard step. Essentials/People/Interaction/Styling are already filled.
      if (step4SubStep === "look" && step4Mode === "skip") {
        if (step === 4 && isReference) {
          dispatch({ type: "setStep", step: 6 });
          return;
        }
        dispatch({ type: "next" });
        return;
      }
      const order = step4Flow.order;
      const idx = order.indexOf(step4SubStep);
      if (idx >= 0 && idx < order.length - 1) {
        setStep4SubStep(order[idx + 1]);
        return;
      }
    }
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
    // Step 4 internal sub-step navigation.
    if (onCastStep) {
      const order = step4Flow.order;
      const idx = order.indexOf(step4SubStep);
      if (idx > 0) {
        setStep4SubStep(order[idx - 1]);
        return;
      }
    }
    if (step === 3 && subFamilyCount <= 1) {
      dispatch({ type: "setStep", step: 1 });
      return;
    }
    if (step === 6 && isReference) {
      // Returning to cast — land on the last sub-step.
      const order = step4Flow.order;
      setStep4SubStep(order[order.length - 1] ?? "essentials");
      dispatch({ type: "setStep", step: 4 });
      return;
    }
    dispatch({ type: "back" });
  };

  const handlePickReference = () => {
    if (state.responsibilityAccepted) {
      dispatch({ type: "setSource", source: "reference" });
    } else {
      setModalOpen(true);
    }
  };

  const SUB_LABEL: Record<Step4SubStep, string> = {
    look: "Look",
    essentials: "Essentials",
    people: "People",
    interaction: "Interaction",
    styling: "Styling",
  };
  const nextSubStep = (() => {
    if (!onCastStep) return null;
    const order = step4Flow.order;
    const idx = order.indexOf(step4SubStep);
    if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
    return null;
  })();
  const nextLabel = (() => {
    if (!onCastStep) return undefined;
    // Auto-cast on Look → skips all sub-steps, so just say "Continue".
    if (step4SubStep === "look" && step4Mode === "skip") return "Continue";
    return nextSubStep ? `Continue to ${SUB_LABEL[nextSubStep]}` : undefined;
  })();

  return (
    <>
      <WizardLayout
        step={step}
        source={sourcePicked ? answers.source : "wizard"}
        title={title}
        subtitle={subtitle}
        onBack={handleBack}
        onNext={handleNext}
        onGoToStep={(s) => dispatch({ type: "setStep", step: s })}
        nextDisabled={nextDisabled}
        nextDisabledReason={nextDisabledReason}
        nextLabel={nextLabel}
        isLastStep={step === 6}
      >
        {step === 0 && (
          <Step0ChooseSource
            value={answers.source}
            picked={sourcePicked}
            onChange={(s) => dispatch({ type: "setSource", source: s })}
            onPickReference={handlePickReference}
            referenceUnlocked={state.responsibilityAccepted}
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
            subStep={step4SubStep}
            onSubStepChange={setStep4SubStep}
            visitedSubSteps={visitedSubSteps}
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
            referenceOutfit={answers.reference_outfit}
            onReferenceOutfitChange={(outfit) =>
              dispatch({ type: "setReferenceOutfit", outfit })
            }
            onReferenceOutfitClear={() =>
              dispatch({ type: "clearReferenceOutfit" })
            }
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
            subStep={step4SubStep}
            onSubStepChange={setStep4SubStep}
            visitedSubSteps={visitedSubSteps}
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

        {step === 6 && (
          <Step6PreviewAndPick
            answers={answers}
            onNegativeNoteChange={(note) =>
              dispatch({ type: "setNegativeNote", note })
            }
            onNameChange={(name) => dispatch({ type: "setName", name })}
            onBack={handleBack}
            cache={variationCache}
            onCacheChange={setVariationCache}
            promptHash={currentPromptHash}
          />
        )}
      </WizardLayout>

      <ResponsibilityModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onAccept={async () => {
          if (!user) {
            toast.error("You must be signed in to continue");
            return;
          }
          const { error } = await supabase
            .from("reference_responsibility_acceptances")
            .insert({
              user_id: user.id,
              user_email: user.email ?? null,
              user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
              context: "brand_scene_wizard",
            });
          if (error) {
            toast.error("Could not record your confirmation. Please try again.");
            return;
          }
          dispatch({ type: "acceptResponsibility" });
          dispatch({ type: "setSource", source: "reference" });
          setModalOpen(false);
        }}
      />
    </>
  );
}
