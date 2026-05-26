import { useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { Chip, AddChip } from "../components/Chip";
import { Section } from "../components/Section";
import { OutfitQuiz } from "../components/OutfitQuiz";
import { hasOutfitVibe } from "../constants/outfit";
import {
  CAST_ACTIONS,
  posesForCast,
  CAST_AGES,
  CAST_GENDERS,
  CAST_INTERACTIONS,
  CAST_NOTE_MAX,
  CAST_PRESETS,
  CAST_PRESETS_WITH_PEOPLE,
  type CastAction,
  type CastAge,
  type CastGender,
  type CastInteraction,
  type CastPreset,
} from "../constants/cast";
import {
  SCALE_PRESETS,
  SCALE_UNITS,
  type ScalePreset,
  type ScaleUnit,
} from "../constants/scale";
import { WARDROBE_COLORS, type WardrobeColor } from "../constants/scene";
import {
  BODY_PART_FOCUS,
  GAZE_DIRECTIONS,
  GROUP_DYNAMICS,
  HANDS_ON_PRODUCT,
  type BodyPartFocus,
  type GazeDirection,
  type GroupDynamic,
  type HandsOnProduct,
} from "../constants/sceneExtras";
import { ChipRowWithOther } from "./_baseHelpers";
import { FeaturedModelPicker } from "../components/FeaturedModelPicker";
import { CAST_EXTRAS_FIELDS, applicableFields } from "../constants/extras";
import { ExtrasPillField } from "../components/ExtrasPillField";
import { EthnicityChips } from "../components/EthnicityChips";
import {
  getStorytellingMoments,
  hasExplicitMoments,
} from "../registry/storytellingBySubfamily";
import { resolveSubfamilyGuide } from "../registry/subfamilyGuides";
import {
  LINGERIE_POSE_SUGGESTIONS,
  LINGERIE_CAMERA_ANGLES,
  LINGERIE_FRAMINGS,
  LINGERIE_MOODS,
  isLingerie,
} from "../registry/lingerieCast";
import { resolveAll } from "../registry/resolvePresets";
import {
  forbiddenInteractions,
  forbiddenCastPresets,
  warnings as sceneWarnings,
} from "../rules/combinationGuards";
import {
  computeStep4Flow,
  getStep4Mode,
  getSubStepDisabledReason,
  type Step4SubStep,
} from "../step4Flow";
import type {
  BrandSceneAnswers,
  BrandSceneCast,
  BrandSceneScale,
} from "../../types";
import type { BrandSceneModule } from "../../constants";

/** Canonical pose note used when the user wants the cast to mirror the reference image. */
const REFERENCE_POSE_NOTE =
  "Match the pose, framing, body language and gaze from the reference image";

interface Props {
  module?: BrandSceneModule;
  subFamily?: string;
  source: BrandSceneAnswers["source"];
  answers: BrandSceneAnswers;
  cast?: BrandSceneCast;
  scale?: BrandSceneScale;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
  onScaleChange: (patch: Partial<BrandSceneScale>) => void;
  /** Optional — used by Auto-cast to seed scene defaults (lens, DoF, finish). */
  onBaseChange?: (patch: Partial<NonNullable<BrandSceneAnswers["base"]>>) => void;
  /** Active sub-step (controlled by the wizard so footer Next can advance it). */
  subStep?: Step4SubStep;
  onSubStepChange?: (s: Step4SubStep) => void;
  /** Sub-steps the user has actually visited (controls ✓ display). */
  visitedSubSteps?: Set<Step4SubStep>;
}

export function Step4Cast({
  module,
  subFamily,
  source,
  answers,
  cast,
  scale,
  onCastChange,
  onScaleChange,
  onBaseChange,
  subStep = "essentials",
  onSubStepChange,
  visitedSubSteps,
}: Props) {
  const isReference = source === "reference";
  const resolved = useMemo(
    () => resolveAll(module, subFamily),
    [module, subFamily],
  );
  const preset: CastPreset | undefined = cast?.preset;
  const hasPeople = preset
    ? CAST_PRESETS_WITH_PEOPLE.includes(preset)
    : false;
  const isReplicate = preset === "replicate";
  const scalePreset: ScalePreset = scale?.preset ?? resolved.scale.default;

  // No auto-seed: the user must explicitly pick cast & scale.


  const forbiddenInter = forbiddenInteractions(preset, module, scalePreset);
  const forbiddenCast = forbiddenCastPresets(scalePreset, module);


  const allowedCastSet = new Set<string>(resolved.castPresets);
  const visibleCastPresets = CAST_PRESETS
    .filter((p) => p.value !== "replicate" || isReference)
    .filter((p) => !forbiddenCast.has(p.value))
    .filter((p) => p.value === "replicate" || allowedCastSet.has(p.value));

  const labelForCastPreset = (_value: CastPreset, fallback: string): string => fallback;
  const sectionLabels = {
    cast: "Who's in the shot",
    interaction: "How the product appears",
    interactionHelper: "Defines how any product placed into this scene will be staged",
  };

  const visibleInteractions = (() => {
    const allowed = new Set(resolved.interactions as string[]);
    const filtered = CAST_INTERACTIONS.filter(
      (i) => allowed.has(i.value) && !forbiddenInter.has(i.value),
    );
    const rank = (v: string) => {
      const idx = resolved.interactions.indexOf(v as CastInteraction);
      return idx === -1 ? 999 : idx;
    };
    return [...filtered].sort((a, b) => rank(a.value) - rank(b.value));
  })();

  const visibleHandsOnProduct =
    HANDS_ON_PRODUCT.filter((h) => resolved.handsOnProduct.includes(h.value));
  const visibleBodyPart =
    BODY_PART_FOCUS.filter((b) => resolved.bodyPartFocus.includes(b.value));
  const wardrobes =
    WARDROBE_COLORS.filter((w) => resolved.wardrobeColors.includes(w.value));

  

  const flow = useMemo(
    () => computeStep4Flow(answers, { module, subFamily, isReference }),
    [answers, module, subFamily, isReference],
  );

  // If the active sub-step is no longer visible (cast changed), bounce back.
  useEffect(() => {
    if (!flow.visibleTabs.includes(subStep)) {
      onSubStepChange?.(flow.visibleTabs[0] ?? "essentials");
    }
  }, [flow.visibleTabs, subStep, onSubStepChange]);

  const mode = getStep4Mode(cast);
  const warnings = sceneWarnings(answers);

  const setMode = (next: "yes" | "skip") => {
    const nextExtras = { ...(cast?.extras ?? {}) };
    nextExtras.design_specific_look = next;
    if (next === "skip") {
      const seededPreset = (cast?.preset ?? resolved.defaultCast) as CastPreset;
      const seededHasPeople = CAST_PRESETS_WITH_PEOPLE.includes(seededPreset);

      // Prefer "wearing" for on-body categories, else first available interaction.
      const preferredInteraction: CastInteraction | undefined =
        resolved.interactions.includes("wearing" as CastInteraction)
          ? ("wearing" as CastInteraction)
          : (visibleInteractions[0]?.value as CastInteraction | undefined);

      const patch: Partial<BrandSceneCast> = {
        extras: nextExtras,
        preset: seededPreset,
        interaction: cast?.interaction ?? preferredInteraction,
      };
      
      if (!cast?.hands_on_product && resolved.handsOnProduct[0]) {
        patch.hands_on_product = resolved.handsOnProduct[0] as HandsOnProduct;
      }
      if (!cast?.body_part_focus && resolved.bodyPartFocus[0]) {
        patch.body_part_focus = resolved.bodyPartFocus[0] as BodyPartFocus;
      }
      if (seededHasPeople) {
        if (!cast?.action) patch.action = "still" as CastAction;
        if (!cast?.gaze) patch.gaze = "away" as GazeDirection;
        if (!cast?.age || cast.age.length === 0) patch.age = ["adult" as CastAge];
      }
      onCastChange(patch);

      if (!scale?.preset) onScaleChange({ preset: resolved.scale.default });

      // Seed editorial scene defaults so Auto-cast produces a cohesive image.
      if (onBaseChange) {
        const base = answers.base ?? {};
        const basePatch: Partial<NonNullable<BrandSceneAnswers["base"]>> = {};
        if (!base.lens && resolved.lens[0]) basePatch.lens = resolved.lens[0];
        if (!base.depth_of_field && resolved.depthOfField[0]) {
          basePatch.depth_of_field = resolved.depthOfField[0];
        }
        if (!base.finish && resolved.finishes[0]) basePatch.finish = resolved.finishes[0];
        if (Object.keys(basePatch).length) onBaseChange(basePatch);
      }
    } else {
      onCastChange({ extras: nextExtras });
      // No auto-advance — let the user confirm by clicking Next.
    }
  };


  // Headline missing flags for the dot indicators.

  const interactionHeadlineMissing = (() => {
    if (hasPeople) return !cast?.action && !cast?.action_note?.trim();
    return !cast?.hands_on_product;
  })();
  const outfitVibeMissing = false;

  const activeTabRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [subStep]);


  return (
    <div className="space-y-8">
      {/* Tabs */}
      {flow.visibleTabs.length > 1 && (
        <div className="space-y-2">
          {subStep !== "look" && (
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 sm:hidden">
              Step {Math.max(1, flow.visibleTabs.indexOf(subStep) + 1)} of {flow.visibleTabs.length}
            </div>
          )}
          <div className="-mx-4 px-4 overflow-x-auto no-scrollbar snap-x snap-mandatory sm:overflow-visible sm:mx-0 sm:px-0 border-b border-border/50">
            <div className="flex items-center gap-5 sm:gap-6 sm:flex-wrap whitespace-nowrap">
              {flow.visibleTabs.map((t) => {
                const active = subStep === t;
                const labelMap: Record<Step4SubStep, string> = {
                  look: "Look",
                  essentials: "Essentials",
                  people: "People",
                  interaction: "Interaction",
                  styling: "Styling · optional",
                };
                const headlineAnswered =
                  getSubStepDisabledReason(t, answers, { module, subFamily, isReference }) === null;
                const visited = visitedSubSteps?.has(t) ?? (t === subStep);
                const done = headlineAnswered && visited;
                return (
                  <button
                    key={t}
                    type="button"
                    ref={active ? activeTabRef : undefined}
                    onClick={() => onSubStepChange?.(t)}
                    className={`relative pb-3 -mb-px border-b-2 text-[12px] font-medium transition-colors inline-flex items-center gap-1.5 snap-start shrink-0 ${
                      active
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{labelMap[t]}</span>
                    {done && (
                      <Check
                        className={`w-3 h-3 ${
                          active ? "text-foreground" : "text-foreground/50"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
              {subStep !== "look" && (
                <div className="hidden sm:block ml-auto pb-3 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  Step {Math.max(1, flow.visibleTabs.indexOf(subStep) + 1)} of {flow.visibleTabs.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {subStep === "look" && flow.showBranchCard && (
        <div className="animate-fade-in space-y-6 pt-6">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            <BranchCard
              active={mode === "skip"}
              title="Auto-cast"
              body="We pick cast, interaction and scale"
              secondary
              onClick={() => setMode("skip")}
            />
            <BranchCard
              active={mode === "yes"}
              title="Design the look"
              body="Choose cast, interaction and styling yourself"
              recommended
              onClick={() => setMode("yes")}
            />
          </div>
          {mode === "skip" && (
            <div className="mx-auto max-w-2xl">
              <AutoCastSummary
                cast={cast}
                scale={scale}
                hasPeople={hasPeople}
                onJumpToEssentials={() => onSubStepChange?.("essentials")}
                onJumpToInteraction={() => onSubStepChange?.("interaction")}
              />
            </div>
          )}
        </div>
      )}


      {subStep === "essentials" && (
        <div className="space-y-10 animate-fade-in">
          {/* Cast preset */}
          <Section label={sectionLabels.cast} required missing={!preset}>
            <div className="flex flex-wrap gap-x-2 gap-y-2.5">
              {visibleCastPresets.map((p) => (
                <Chip
                  key={p.value}
                  active={preset === p.value}
                  onClick={() => {
                    if (p.value === "replicate") {
                      onCastChange({
                        preset: "replicate",
                        gender: undefined,
                        age: undefined,
                        vibe: undefined,
                        interaction: undefined,
                        action: undefined,
                        body_part_focus: undefined,
                        gaze: undefined,
                        group_dynamic: undefined,
                        hands_on_product: undefined,
                      });
                      return;
                    }
                    onCastChange({
                      preset: p.value,
                      interaction:
                        cast?.interaction &&
                        !forbiddenInteractions(p.value, module, scalePreset).has(
                          cast.interaction,
                        )
                          ? cast.interaction
                          : undefined,
                      group_dynamic:
                        p.value === "two" || p.value === "group"
                          ? cast?.group_dynamic
                          : undefined,
                    });
                  }}
                >
                  {labelForCastPreset(p.value, p.label)}
                </Chip>
              ))}
            </div>
          </Section>

          {isReplicate && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Subject, pose, framing and lighting will be locked to your reference.
              Product scale below still applies because the inserted product may
              differ from what's in the image.
            </p>
          )}

          {/* Product interaction (required unless replicate) */}
          {!isReplicate && (
            <Section
              label={sectionLabels.interaction}
              required
              missing={!cast?.interaction}
              helper={sectionLabels.interactionHelper}
            >
              <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                {visibleInteractions.map((i) => (
                  <Chip
                    key={i.value}
                    active={cast?.interaction === i.value}
                    onClick={() =>
                      onCastChange({ interaction: i.value as CastInteraction })
                    }
                  >
                    {i.label}
                  </Chip>
                ))}
              </div>
            </Section>
          )}

        </div>
      )}

      {subStep === "people" && !isReplicate && (
        <PeopleTab
          module={module}
          subFamily={subFamily}
          preset={preset}
          cast={cast}
          onCastChange={onCastChange}
        />
      )}

      {subStep === "interaction" && !isReplicate && (
        <InteractionTab
          module={module}
          subFamily={subFamily}
          preset={preset}
          hasPeople={hasPeople}
          scalePreset={scalePreset}
          visibleHandsOnProduct={visibleHandsOnProduct}
          visibleBodyPart={visibleBodyPart}
          cast={cast}
          onCastChange={onCastChange}
          headlineMissing={interactionHeadlineMissing}
          isReference={isReference}
        />
      )}

      {subStep === "styling" && !isReplicate && (
        <StylingTab
          module={module}
          subFamily={subFamily}
          preset={preset}
          hasPeople={hasPeople}
          wardrobes={wardrobes}
          cast={cast}
          onCastChange={onCastChange}
          outfitVibeMissing={outfitVibeMissing}
        />
      )}

      {/* Warnings — only inside refinement tabs */}
      {subStep !== "essentials" && warnings.length > 0 && (
        <div className="space-y-2 pt-6 border-t border-border/40">
          {warnings.map((w, i) => (
            <p
              key={i}
              className={`text-[11px] rounded-xl border px-3 py-2 ${
                w.severity === "warn"
                  ? "border-foreground/30 text-foreground/80"
                  : "border-border text-muted-foreground"
              }`}
            >
              {w.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── Branch card ────────────────────────── */

function BranchCard({
  active,
  title,
  body,
  recommended = false,
  secondary = false,
  onClick,
}: {
  active: boolean;
  title: string;
  body?: string;
  recommended?: boolean;
  secondary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative text-left rounded-2xl border px-5 py-6 transition-colors ${
        active
          ? "border-foreground border-2 bg-foreground/[0.04] ring-1 ring-foreground/10"
          : "border-border hover:border-foreground/40 hover:bg-muted/40"
      }`}
    >
      {recommended && !active && (
        <span className="absolute -top-2 left-4 rounded-full bg-foreground px-2 py-0.5 text-[9px] uppercase tracking-widest text-background">
          Recommended
        </span>
      )}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-sm ${
            secondary ? "font-medium text-foreground/80" : "font-semibold"
          }`}
        >
          {title}
        </span>
        {active && <Check className="w-3.5 h-3.5 text-foreground" />}
      </div>
      {body && (
        <p
          className={`text-[11px] leading-relaxed mt-1.5 ${
            secondary ? "text-muted-foreground/80" : "text-muted-foreground"
          }`}
        >
          {body}
        </p>
      )}
      {active && <span className="sr-only">Selected</span>}
    </button>
  );
}

/* ──────────────────────── Auto-cast summary ─────────────────────── */

function AutoCastSummary({
  cast,
  scale,
  onJumpToEssentials,
  onJumpToInteraction,
  hasPeople,
}: {
  cast?: BrandSceneCast;
  scale?: BrandSceneScale;
  onJumpToEssentials: () => void;
  onJumpToInteraction?: () => void;
  hasPeople: boolean;
}) {
  const presetLabel = CAST_PRESETS.find((p) => p.value === cast?.preset)?.label;
  const interactionLabel = CAST_INTERACTIONS.find(
    (i) => i.value === cast?.interaction,
  )?.label;
  const poseLabel =
    cast?.action_note ??
    CAST_ACTIONS.find((a) => a.value === cast?.action)?.label;
  const chips: { label: string; onClick: () => void; emphasize?: boolean }[] = [];
  if (presetLabel) chips.push({ label: presetLabel, onClick: onJumpToEssentials });
  if (interactionLabel)
    chips.push({ label: interactionLabel, onClick: onJumpToEssentials });
  if (hasPeople && poseLabel && onJumpToInteraction)
    chips.push({ label: `Pose: ${poseLabel}`, onClick: onJumpToInteraction, emphasize: true });
  if (!chips.length) return null;
  return (
    <div className="mx-auto max-w-2xl mt-5 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
          Auto-picked
        </div>
        <button
          type="button"
          onClick={onJumpToEssentials}
          className="text-[11px] text-foreground/70 underline-offset-2 hover:underline"
        >
          Adjust
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={c.onClick}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] transition-colors ${
              c.emphasize
                ? "border-foreground/40 bg-card text-foreground hover:border-foreground"
                : "border-border bg-card text-foreground/80 hover:border-foreground/40"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {hasPeople && onJumpToInteraction && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Pose strongly affects composition — tap it above to fine-tune
        </p>
      )}
    </div>
  );
}

/* ────────────────────────── Tab: People ────────────────────────── */

function PeopleTab({
  module,
  subFamily,
  preset,
  cast,
  onCastChange,
}: {
  module?: BrandSceneModule;
  subFamily?: string;
  preset?: CastPreset;
  cast?: BrandSceneCast;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
}) {
  const isSingle = preset === "solo" || preset === "hands";
  const genderOpts = isSingle
    ? CAST_GENDERS.filter((g) => g.value !== "mixed")
    : CAST_GENDERS;
  const ageOpts = isSingle
    ? CAST_AGES.filter((a) => a.value !== "mixed")
    : CAST_AGES;
  const genderLabel = isSingle ? "Gender" : "Gender mix";
  const ageLabel = isSingle ? "Age range" : "Age range (mix)";
  const lingerie = isLingerie(module, subFamily);

  const handleGender = (v: string) => {
    if (isSingle) {
      const current = (cast?.gender ?? [])[0];
      onCastChange({ gender: current === v ? [] : [v as CastGender] });
    } else {
      onCastChange({ gender: toggleArr(cast?.gender ?? [], v as CastGender) });
    }
  };
  const handleAge = (v: string) => {
    if (isSingle) {
      const current = (cast?.age ?? [])[0];
      onCastChange({ age: current === v ? [] : [v as CastAge] });
    } else {
      onCastChange({ age: toggleArr(cast?.age ?? [], v as CastAge) });
    }
  };

  const builds = buildsForCast(preset);

  // Normalize model_ref ↔ model_refs (primary mirrors slot 0).
  const refs = (cast?.model_refs && cast.model_refs.length > 0)
    ? cast.model_refs
    : cast?.model_ref
      ? [cast.model_ref]
      : [];
  const hasAnyModel = refs.length > 0;

  void hasAnyModel;


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 animate-fade-in">
      <div className="md:col-span-2">
        <Section
          label={refs.length > 1 || preset === "two" || preset === "group" ? "Featured models" : "Featured model"}
        >
          <FeaturedModelPicker
            preset={preset}
            refs={refs}
            onChange={(nextRefs) =>
              onCastChange({
                model_refs: nextRefs.length > 0 ? nextRefs : undefined,
                model_ref: nextRefs[0],
              })
            }
          />
        </Section>
      </div>

      {lingerie && (
        <div className="md:col-span-2">
          <Section label="Lingerie mood">
            <div className="flex flex-wrap gap-x-2 gap-y-2.5">
              {LINGERIE_MOODS.map((m) => {
                const current = cast?.extras?.lingerie_mood;
                return (
                  <Chip
                    key={m.value}
                    active={current === m.value}
                    onClick={() => {
                      const nextExtras = { ...(cast?.extras ?? {}) };
                      if (current === m.value) delete nextExtras.lingerie_mood;
                      else nextExtras.lingerie_mood = m.value;
                      onCastChange({ extras: nextExtras });
                    }}
                  >
                    {m.label}
                  </Chip>
                );
              })}
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── Tab: Interaction ────────────────────────── */

function InteractionTab({
  module,
  subFamily,
  preset,
  hasPeople,
  scalePreset,
  visibleHandsOnProduct,
  visibleBodyPart,
  cast,
  onCastChange,
  headlineMissing,
  isReference,
}: {
  module?: BrandSceneModule;
  subFamily?: string;
  preset?: CastPreset;
  hasPeople: boolean;
  scalePreset: ScalePreset;
  visibleHandsOnProduct: ReadonlyArray<{ value: string; label: string }>;
  visibleBodyPart: ReadonlyArray<{ value: string; label: string }>;
  cast?: BrandSceneCast;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
  headlineMissing: boolean;
  isReference?: boolean;
}) {
  const showHandsOn =
    visibleHandsOnProduct.length > 0 &&
    (preset === "hands" || preset === "solo" || preset === "two" || preset === "group") &&
    (scalePreset === "pocket" || scalePreset === "handheld");
  const showBodyPart =
    preset !== "none" && preset !== "hands" && visibleBodyPart.length > 0;
  const showGroup = preset === "two" || preset === "group";
  const lingerie = isLingerie(module, subFamily) && hasPeople;

  const showReferencePosePill = !!isReference && hasPeople;
  const referenceActive = cast?.action_note === REFERENCE_POSE_NOTE;

  // Pre-select "As reference image" the first time the user reaches the
  // interaction sub-step in a reference flow, so the generated variations
  // follow the reference pose unless the user picks something else.
  const seededRefPoseRef = useRef(false);
  useEffect(() => {
    if (!showReferencePosePill) return;
    if (seededRefPoseRef.current) return;
    if (cast?.action || cast?.action_note?.trim()) {
      seededRefPoseRef.current = true;
      return;
    }
    seededRefPoseRef.current = true;
    onCastChange({ action: undefined, action_note: REFERENCE_POSE_NOTE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReferencePosePill]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 animate-fade-in">
      {hasPeople && (
        <div className="md:col-span-2">
          <Section label="Pose" required missing={headlineMissing}>
            <p className="-mt-2 mb-3 text-[11px] text-muted-foreground">
              Sets the body language and composition
            </p>
            {showReferencePosePill && (
              <div className="mb-3">
                <Chip
                  active={referenceActive}
                  onClick={() =>
                    onCastChange({
                      action: undefined,
                      action_note: referenceActive ? undefined : REFERENCE_POSE_NOTE,
                    })
                  }
                >
                  As reference image
                </Chip>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Follow the pose, framing and gaze from your uploaded image
                </p>
              </div>
            )}
            <ChipRowWithOther
              options={posesForCast(preset, scalePreset)}
              current={cast?.action_note ? undefined : cast?.action}
              custom={referenceActive ? undefined : cast?.action_note}
              onPick={(v) =>
                onCastChange({
                  action: v as CastAction | undefined,
                  action_note: undefined,
                })
              }
              onCustom={(c) =>
                onCastChange({
                  action_note: c,
                  action: c ? undefined : cast?.action,
                })
              }
              placeholder="e.g. mid-jump, sitting on stairs, arms crossed"
            />
          </Section>
        </div>
      )}

      {lingerie && (
        <div className="md:col-span-2">
          <Section label="Lingerie pose suggestions">
            <p className="-mt-2 mb-3 text-[11px] text-muted-foreground">
              Tap to set a curated pose (fills the Pose note above)
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-2.5">
              {LINGERIE_POSE_SUGGESTIONS.map((p) => (
                <Chip
                  key={p}
                  active={cast?.action_note === p}
                  onClick={() =>
                    onCastChange({
                      action_note: cast?.action_note === p ? undefined : p,
                      action: undefined,
                    })
                  }
                >
                  {p}
                </Chip>
              ))}
            </div>
          </Section>
        </div>
      )}

      {lingerie && (
        <Section label="Camera angle">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {LINGERIE_CAMERA_ANGLES.map((a) => {
              const current = cast?.extras?.lingerie_camera_angle;
              return (
                <Chip
                  key={a.value}
                  active={current === a.value}
                  onClick={() => {
                    const nextExtras = { ...(cast?.extras ?? {}) };
                    if (current === a.value) delete nextExtras.lingerie_camera_angle;
                    else nextExtras.lingerie_camera_angle = a.value;
                    onCastChange({ extras: nextExtras });
                  }}
                >
                  {a.label}
                </Chip>
              );
            })}
          </div>
        </Section>
      )}

      {lingerie && (
        <Section label="Framing">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {LINGERIE_FRAMINGS.map((f) => {
              const current = cast?.extras?.lingerie_framing;
              return (
                <Chip
                  key={f.value}
                  active={current === f.value}
                  onClick={() => {
                    const nextExtras = { ...(cast?.extras ?? {}) };
                    if (current === f.value) delete nextExtras.lingerie_framing;
                    else nextExtras.lingerie_framing = f.value;
                    onCastChange({ extras: nextExtras });
                  }}
                >
                  {f.label}
                </Chip>
              );
            })}
          </div>
        </Section>
      )}

      {!hasPeople && showHandsOn && (
        <div className="md:col-span-2">
          <Section label="Hands on product" required missing={headlineMissing}>
            <div className="flex flex-wrap gap-x-2 gap-y-2.5">
              {visibleHandsOnProduct.map((h) => (
                <Chip
                  key={h.value}
                  active={cast?.hands_on_product === h.value}
                  onClick={() =>
                    onCastChange({
                      hands_on_product:
                        cast?.hands_on_product === h.value
                          ? undefined
                          : (h.value as HandsOnProduct),
                    })
                  }
                >
                  {h.label}
                </Chip>
              ))}
            </div>
          </Section>
        </div>
      )}

      {hasPeople && showHandsOn && (
        <Section label="Hands on product">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {visibleHandsOnProduct.map((h) => (
              <Chip
                key={h.value}
                active={cast?.hands_on_product === h.value}
                onClick={() =>
                  onCastChange({
                    hands_on_product:
                      cast?.hands_on_product === h.value
                        ? undefined
                        : (h.value as HandsOnProduct),
                  })
                }
              >
                {h.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {showBodyPart && (
        <Section label="Body-part focus">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {visibleBodyPart.map((b) => (
              <Chip
                key={b.value}
                active={cast?.body_part_focus === b.value}
                onClick={() =>
                  onCastChange({
                    body_part_focus:
                      cast?.body_part_focus === b.value
                        ? undefined
                        : (b.value as BodyPartFocus),
                  })
                }
              >
                {b.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {hasPeople && (
        <Section label="Gaze direction">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {GAZE_DIRECTIONS.map((g) => (
              <Chip
                key={g.value}
                active={cast?.gaze === g.value}
                onClick={() =>
                  onCastChange({
                    gaze:
                      cast?.gaze === g.value
                        ? undefined
                        : (g.value as GazeDirection),
                  })
                }
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {showGroup && (
        <Section label="Group dynamic">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {GROUP_DYNAMICS.map((g) => (
              <Chip
                key={g.value}
                active={cast?.group_dynamic === g.value}
                onClick={() =>
                  onCastChange({
                    group_dynamic:
                      cast?.group_dynamic === g.value
                        ? undefined
                        : (g.value as GroupDynamic),
                  })
                }
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ────────────────────────── Tab: Styling ────────────────────────── */

function StylingTab({
  module,
  subFamily,
  preset,
  hasPeople,
  wardrobes,
  cast,
  onCastChange,
  outfitVibeMissing,
}: {
  module?: BrandSceneModule;
  subFamily?: string;
  preset?: CastPreset;
  hasPeople: boolean;
  wardrobes: ReadonlyArray<{ value: string; label: string }>;
  cast?: BrandSceneCast;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
  outfitVibeMissing: boolean;
}) {
  const showWardrobe =
    hasPeople &&
    wardrobes.length > 0 &&
    !["swimwear", "lingerie"].includes(subFamily ?? "");
  const showOutfit =
    hasPeople && preset !== "hands" && preset !== "none";
  const hideGarments = ["swimwear", "lingerie"].includes(subFamily ?? "");

  const extraFields = applicableFields(CAST_EXTRAS_FIELDS, module, preset, subFamily)
    .filter((f) => f.key !== "build")
    .map((f) => {
      if (f.key === "storytelling_moment") {
        const moments = getStorytellingMoments(module, subFamily);
        if (preset === "hands" && !hasExplicitMoments(module, subFamily)) {
          return null;
        }
        return { ...f, presets: moments };
      }
      if (f.key === "build") {
        return { ...f, presets: buildsForCast(preset) };
      }
      return f;
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  const guide = resolveSubfamilyGuide(module, subFamily);
  const showHeroBanner = !!guide?.mustWearProduct && hasPeople;

  return (
    <div className="animate-fade-in space-y-10">
      {showHeroBanner && (
        <div className="rounded-2xl border border-foreground/20 bg-foreground/[0.03] px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Hero garment enforced — {guide!.productNoun}
          </div>
          <p className="text-[11px] text-foreground/80 mt-1.5 leading-relaxed">
            {guide!.wardrobe}
          </p>
        </div>
      )}

      {showOutfit && (
        <OutfitQuiz
          value={cast?.outfit}
          onChange={(next) => onCastChange({ outfit: next })}
          hideGarments={hideGarments}
        />
      )}

      {(showWardrobe || extraFields.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {showWardrobe && (
            <Section label="Wardrobe color anchor · optional">
              <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                {wardrobes.map((w) => (
                  <Chip
                    key={w.value}
                    active={cast?.wardrobe_color === w.value}
                    onClick={() =>
                      onCastChange({
                        wardrobe_color:
                          cast?.wardrobe_color === w.value
                            ? undefined
                            : (w.value as WardrobeColor),
                      })
                    }
                  >
                    {w.label}
                  </Chip>
                ))}
              </div>
            </Section>
          )}

          {extraFields.map((f) => (
            <ExtrasPillField
              key={f.key}
              field={f}
              value={cast?.extras?.[f.key]}
              onChange={(next) => {
                const nextExtras = { ...(cast?.extras ?? {}) };
                if (next === undefined) delete nextExtras[f.key];
                else nextExtras[f.key] = next;
                onCastChange({ extras: nextExtras });
              }}
            />
          ))}
        </div>
      )}

      <Section label="Note · optional">
        <Textarea
          value={cast?.note ?? ""}
          maxLength={CAST_NOTE_MAX}
          rows={2}
          onChange={(e) => onCastChange({ note: e.target.value })}
          placeholder="e.g. lead athlete dribbles, second player watches in background"
          className="rounded-xl resize-none"
        />
      </Section>
    </div>
  );
}

/* ────────────────────────── Helpers ────────────────────────── */

function toggleArr<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function MultiSelect({
  options,
  current,
  onToggle,
}: {
  options: readonly { value: string; label: string }[];
  current: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-2.5">
      {options.map((o) => (
        <Chip
          key={o.value}
          active={current.includes(o.value)}
          onClick={() => onToggle(o.value)}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function ExactDimensions({
  value,
  onChange,
}: {
  value?: { w: number; h: number; d?: number; units: ScaleUnit };
  onChange: (d: { w: number; h: number; d?: number; units: ScaleUnit }) => void;
}) {
  const v = value ?? { w: 0, h: 0, units: "cm" as ScaleUnit };
  const set = (patch: Partial<typeof v>) => onChange({ ...v, ...patch });

  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <NumberField label="W" value={v.w} onChange={(n) => set({ w: n })} />
      <NumberField label="H" value={v.h} onChange={(n) => set({ h: n })} />
      <NumberField
        label="D"
        value={v.d ?? 0}
        onChange={(n) => set({ d: n || undefined })}
      />
      <div>
        <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Units
        </Label>
        <div className="flex gap-1 mt-1.5">
          {SCALE_UNITS.map((u) => (
            <Chip key={u} active={v.units === u} onClick={() => set({ units: u })}>
              {u}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="rounded-xl mt-1.5"
      />
    </div>
  );
}
