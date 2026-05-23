import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chip, AddChip } from "../components/Chip";
import { Section } from "../components/Section";
import {
  CAST_ACTIONS,
  CAST_AGES,
  CAST_GENDERS,
  CAST_INTERACTIONS,
  CAST_NOTE_MAX,
  CAST_PRESETS,
  CAST_PRESETS_WITH_PEOPLE,
  CAST_VIBES,
  type CastAction,
  type CastAge,
  type CastGender,
  type CastInteraction,
  type CastPreset,
  type CastVibe,
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
import { CAST_EXTRAS_FIELDS, applicableFields, buildsForCast } from "../constants/extras";
import { ExtrasPillField } from "../components/ExtrasPillField";
import { EthnicityChips } from "../components/EthnicityChips";
import {
  getStorytellingMoments,
  hasExplicitMoments,
} from "../registry/storytellingBySubfamily";
import { resolveAll } from "../registry/resolvePresets";
import {
  forbiddenInteractions,
  forbiddenCastPresets,
  warnings as sceneWarnings,
} from "../rules/combinationGuards";
import type {
  BrandSceneAnswers,
  BrandSceneCast,
  BrandSceneScale,
} from "../../types";
import type { BrandSceneModule } from "../../constants";

interface Props {
  module?: BrandSceneModule;
  subFamily?: string;
  source: BrandSceneAnswers["source"];
  answers: BrandSceneAnswers;
  cast?: BrandSceneCast;
  scale?: BrandSceneScale;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
  onScaleChange: (patch: Partial<BrandSceneScale>) => void;
}

type TabKey = "essentials" | "people" | "interaction" | "styling";

export function Step4Cast({
  module,
  subFamily,
  source,
  answers,
  cast,
  scale,
  onCastChange,
  onScaleChange,
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

  // Seed defaults exactly once.
  useEffect(() => {
    if (!scale?.preset) onScaleChange({ preset: scalePreset });
    if (!cast?.preset) onCastChange({ preset: resolved.defaultCast });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, subFamily]);

  // Combo guards.
  const forbiddenInter = forbiddenInteractions(preset, module, scalePreset);
  const forbiddenCast = forbiddenCastPresets(scalePreset, module);

  const visibleScales = SCALE_PRESETS.filter((s) =>
    resolved.scale.values.includes(s.value),
  );
  const showScaleSection = visibleScales.length > 1;

  const visibleCastPresets = CAST_PRESETS
    .filter((p) => p.value !== "replicate" || isReference)
    .filter((p) => !forbiddenCast.has(p.value));

  const visibleInteractions = (() => {
    const filtered = CAST_INTERACTIONS.filter((i) => !forbiddenInter.has(i.value));
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

  const [showExact, setShowExact] = useState(!!scale?.dimensions);
  const [tab, setTab] = useState<TabKey>("essentials");

  // Force essentials tab when cast is replicate (nothing else applies).
  useEffect(() => {
    if (isReplicate) setTab("essentials");
  }, [isReplicate]);

  const warnings = sceneWarnings(answers);

  // Tab availability
  const showPeopleTab = !isReplicate && hasPeople;
  const showInteractionTab =
    !isReplicate &&
    ((visibleHandsOnProduct.length > 0 &&
      (preset === "hands" || preset === "solo" || preset === "two" || preset === "group") &&
      (scalePreset === "pocket" || scalePreset === "handheld")) ||
      (preset !== "none" && preset !== "hands" && visibleBodyPart.length > 0) ||
      hasPeople ||
      preset === "two" || preset === "group");
  const showStylingTab =
    !isReplicate &&
    (
      (hasPeople &&
        wardrobes.length > 0 &&
        !["swimwear", "lingerie"].includes(subFamily ?? "")) ||
      applicableFields(CAST_EXTRAS_FIELDS, module, preset, subFamily)
        .filter((f) => f.key !== "build").length > 0 ||
      true /* note always available */
    );

  const tabs: { key: TabKey; label: string; show: boolean; count?: number }[] = [
    { key: "essentials", label: "Essentials", show: true },
    {
      key: "people",
      label: "People",
      show: showPeopleTab,
      count: countActive([
        cast?.gender?.length,
        cast?.age?.length,
        cast?.vibe,
        cast?.extras?.build,
        cast?.extras?.ethnicity,
      ]),
    },
    {
      key: "interaction",
      label: "Interaction",
      show: showInteractionTab,
      count: countActive([
        cast?.hands_on_product,
        cast?.body_part_focus,
        cast?.gaze,
        cast?.group_dynamic,
        cast?.action,
      ]),
    },
    {
      key: "styling",
      label: "Styling",
      show: showStylingTab,
      count: countActive([
        cast?.wardrobe_color,
        ...Object.entries(cast?.extras ?? {})
          .filter(([k]) => k !== "build" && k !== "ethnicity")
          .map(([, v]) => v),
        cast?.note,
      ]),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border/50 pb-3">
        {tabs
          .filter((t) => t.show)
          .map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {t.label}
                {t.key !== "essentials" && t.count ? (
                  <span
                    className={`ml-1.5 text-[10px] ${
                      active ? "text-background/70" : "text-muted-foreground/70"
                    }`}
                  >
                    · {t.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        <div className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground/60 self-center">
          {tab === "essentials" ? "Required" : "Optional"}
        </div>
      </div>

      {tab === "essentials" && (
        <div className="space-y-10 animate-fade-in">
          {/* 1. Cast preset */}
          <Section label="Who's in the shot" required missing={!preset}>
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
                  {p.label}
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

          {/* 2. Product interaction (required unless replicate) */}
          {!isReplicate && (
            <Section
              label="Product interaction"
              required
              missing={!cast?.interaction}
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

          {/* 3. Product scale */}
          {showScaleSection && (
            <Section label="Product scale" required missing={!scale?.preset}>
              <>
                <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                  {visibleScales.map((s) => (
                    <Chip
                      key={s.value}
                      active={scalePreset === s.value}
                      onClick={() => onScaleChange({ preset: s.value })}
                    >
                      {s.label}
                    </Chip>
                  ))}
                </div>
                <div className="mt-3">
                  {showExact ? (
                    <Chip
                      onClick={() => {
                        setShowExact(false);
                        onScaleChange({ dimensions: undefined });
                      }}
                    >
                      Hide exact size
                    </Chip>
                  ) : (
                    <AddChip onClick={() => setShowExact(true)} label="Exact size" />
                  )}
                </div>
                {showExact && (
                  <ExactDimensions
                    value={scale?.dimensions}
                    onChange={(d) => onScaleChange({ dimensions: d })}
                  />
                )}
              </>
            </Section>
          )}

          {/* Helpful nudge to refine */}
          {!isReplicate && (showPeopleTab || showInteractionTab || showStylingTab) && (
            <div className="pt-2">
              <p className="text-[11px] text-muted-foreground">
                Want more control? Refine{" "}
                {showPeopleTab && (
                  <TabLink onClick={() => setTab("people")}>People</TabLink>
                )}
                {showPeopleTab && showInteractionTab && ", "}
                {showInteractionTab && (
                  <TabLink onClick={() => setTab("interaction")}>Interaction</TabLink>
                )}
                {(showPeopleTab || showInteractionTab) && showStylingTab && ", "}
                {showStylingTab && (
                  <TabLink onClick={() => setTab("styling")}>Styling</TabLink>
                )}
                . All optional.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "people" && showPeopleTab && (
        <PeopleTab
          preset={preset}
          cast={cast}
          onCastChange={onCastChange}
        />
      )}

      {tab === "interaction" && showInteractionTab && (
        <InteractionTab
          preset={preset}
          hasPeople={hasPeople}
          scalePreset={scalePreset}
          visibleHandsOnProduct={visibleHandsOnProduct}
          visibleBodyPart={visibleBodyPart}
          cast={cast}
          onCastChange={onCastChange}
        />
      )}

      {tab === "styling" && showStylingTab && (
        <StylingTab
          module={module}
          subFamily={subFamily}
          preset={preset}
          hasPeople={hasPeople}
          wardrobes={wardrobes}
          cast={cast}
          onCastChange={onCastChange}
        />
      )}

      {/* Warnings — only inside refinement tabs */}
      {tab !== "essentials" && warnings.length > 0 && (
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

/* ────────────────────────── Tab: People ────────────────────────── */

function PeopleTab({
  preset,
  cast,
  onCastChange,
}: {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 animate-fade-in">
      <Section label={genderLabel}>
        <MultiSelect
          options={genderOpts}
          current={cast?.gender ?? []}
          onToggle={handleGender}
        />
      </Section>

      <Section label={ageLabel}>
        <MultiSelect
          options={ageOpts}
          current={cast?.age ?? []}
          onToggle={handleAge}
        />
      </Section>

      <Section label="Energy / vibe">
        <div className="flex flex-wrap gap-x-2 gap-y-2.5">
          {CAST_VIBES.map((v) => (
            <Chip
              key={v.value}
              active={cast?.vibe === v.value}
              onClick={() =>
                onCastChange({
                  vibe: cast?.vibe === v.value ? undefined : (v.value as CastVibe),
                })
              }
            >
              {v.label}
            </Chip>
          ))}
        </div>
      </Section>

      {builds.length > 0 && (
        <Section label="Build">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {builds.map((b) => {
              const current = cast?.extras?.build;
              return (
                <Chip
                  key={b}
                  active={current === b}
                  onClick={() => {
                    const nextExtras = { ...(cast?.extras ?? {}) };
                    if (current === b) delete nextExtras.build;
                    else nextExtras.build = b;
                    onCastChange({ extras: nextExtras });
                  }}
                >
                  {b}
                </Chip>
              );
            })}
          </div>
        </Section>
      )}

      <div className="md:col-span-2">
        <Section
          label="Ethnicity / casting hint"
          tooltip="A styling hint, not a hard cast. The AI uses it to guide features when no brand model is attached."
        >
          <EthnicityChips
            value={cast?.extras?.ethnicity}
            onChange={(next) => {
              const nextExtras = { ...(cast?.extras ?? {}) };
              if (next === undefined) delete nextExtras.ethnicity;
              else nextExtras.ethnicity = next;
              onCastChange({ extras: nextExtras });
            }}
          />
        </Section>
      </div>
    </div>
  );
}

/* ────────────────────────── Tab: Interaction ────────────────────────── */

function InteractionTab({
  preset,
  hasPeople,
  scalePreset,
  visibleHandsOnProduct,
  visibleBodyPart,
  cast,
  onCastChange,
}: {
  preset?: CastPreset;
  hasPeople: boolean;
  scalePreset: ScalePreset;
  visibleHandsOnProduct: typeof HANDS_ON_PRODUCT;
  visibleBodyPart: typeof BODY_PART_FOCUS;
  cast?: BrandSceneCast;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
}) {
  const showHandsOn =
    visibleHandsOnProduct.length > 0 &&
    (preset === "hands" || preset === "solo" || preset === "two" || preset === "group") &&
    (scalePreset === "pocket" || scalePreset === "handheld");
  const showBodyPart =
    preset !== "none" && preset !== "hands" && visibleBodyPart.length > 0;
  const showGroup = preset === "two" || preset === "group";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 animate-fade-in">
      {showHandsOn && (
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

      {hasPeople && (
        <Section label="Action">
          <div className="flex flex-wrap gap-x-2 gap-y-2.5">
            {CAST_ACTIONS.map((a) => (
              <Chip
                key={a.value}
                active={cast?.action === a.value}
                onClick={() =>
                  onCastChange({
                    action:
                      cast?.action === a.value
                        ? undefined
                        : (a.value as CastAction),
                  })
                }
              >
                {a.label}
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
}: {
  module?: BrandSceneModule;
  subFamily?: string;
  preset?: CastPreset;
  hasPeople: boolean;
  wardrobes: typeof WARDROBE_COLORS;
  cast?: BrandSceneCast;
  onCastChange: (patch: Partial<BrandSceneCast>) => void;
}) {
  const showWardrobe =
    hasPeople &&
    wardrobes.length > 0 &&
    !["swimwear", "lingerie"].includes(subFamily ?? "");

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

  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        {showWardrobe && (
          <Section label="Wardrobe color anchor">
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

      <Section label="Note">
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

function TabLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-foreground underline-offset-2 hover:underline"
    >
      {children}
    </button>
  );
}

function countActive(vals: Array<unknown>): number {
  return vals.filter((v) => {
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    if (typeof v === "number" && v === 0) return false;
    return true;
  }).length;
}

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
