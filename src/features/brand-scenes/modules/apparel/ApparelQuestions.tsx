import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  APPAREL_ARCHETYPES,
  APPAREL_CAMERA_FEELS,
  APPAREL_GARMENTS,
  APPAREL_MAX_CAMERA_FEELS,
  APPAREL_MAX_GARMENTS,
  APPAREL_TEXT_MAX,
  APPAREL_WEARERS,
  WEARERS_WITH_PERSON,
  type ApparelArchetype,
  type ApparelWearer,
} from "./questions";
import type { ApparelModuleAnswers } from "./schema";

type Answers = Partial<ApparelModuleAnswers>;

interface Props {
  value: Answers;
  onChange: (patch: Answers) => void;
}

export function ApparelQuestions({ value, onChange }: Props) {
  const v: Answers = {
    archetype: value.archetype,
    garment_focus: value.garment_focus ?? [],
    wearer: value.wearer,
    scene: value.scene ?? {},
    finishing: value.finishing ?? {},
  };

  const hasPerson =
    v.wearer && WEARERS_WITH_PERSON.includes(v.wearer as ApparelWearer);

  const toggleGarment = (g: string) => {
    const cur = v.garment_focus ?? [];
    if (cur.includes(g as never)) {
      onChange({ garment_focus: cur.filter((x) => x !== g) as never });
    } else if (cur.length < APPAREL_MAX_GARMENTS) {
      onChange({ garment_focus: [...cur, g] as never });
    }
  };

  const toggleCamera = (c: string) => {
    const cur = v.finishing?.camera_feel ?? [];
    const next = cur.includes(c as never)
      ? cur.filter((x) => x !== c)
      : cur.length < APPAREL_MAX_CAMERA_FEELS
        ? [...cur, c]
        : cur;
    onChange({ finishing: { ...v.finishing, camera_feel: next as never } });
  };

  return (
    <div className="space-y-8">
      {/* Archetype */}
      <Block label="Archetype" required>
        <div className="grid grid-cols-2 gap-2">
          {APPAREL_ARCHETYPES.map((a) => {
            const active = v.archetype === a.value;
            return (
              <Chip
                key={a.value}
                active={active}
                onClick={() =>
                  onChange({ archetype: a.value as ApparelArchetype })
                }
              >
                {a.label}
              </Chip>
            );
          })}
        </div>
      </Block>

      {/* Garment focus */}
      <Block
        label="Garment focus"
        required
        hint={`${(v.garment_focus ?? []).length}/${APPAREL_MAX_GARMENTS}`}
      >
        <div className="flex flex-wrap gap-2">
          {APPAREL_GARMENTS.map((g) => {
            const active = (v.garment_focus ?? []).includes(g as never);
            return (
              <Chip key={g} active={active} onClick={() => toggleGarment(g)}>
                {g}
              </Chip>
            );
          })}
        </div>
      </Block>

      {/* Wearer */}
      <Block label="Wearer" required>
        <div className="grid grid-cols-2 gap-2">
          {APPAREL_WEARERS.map((w) => {
            const active = v.wearer === w.value;
            return (
              <Chip
                key={w.value}
                active={active}
                onClick={() => {
                  const next: Answers = { wearer: w.value as ApparelWearer };
                  if (!w.hasPerson && v.scene?.pose) {
                    next.scene = { ...v.scene, pose: undefined };
                  }
                  onChange(next);
                }}
              >
                {w.label}
              </Chip>
            );
          })}
        </div>
      </Block>

      {/* Scene */}
      <Block label="Scene setting">
        <div className="space-y-3">
          <SmallField label="Location specifics">
            <Input
              maxLength={APPAREL_TEXT_MAX}
              value={v.scene?.location ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, location: e.target.value } })
              }
              placeholder="e.g. concrete loft with arched windows"
            />
          </SmallField>
          <SmallField label="Props & styling">
            <Input
              maxLength={APPAREL_TEXT_MAX}
              value={v.scene?.props ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, props: e.target.value } })
              }
              placeholder="e.g. vintage chair, draped fabric"
            />
          </SmallField>
          {hasPerson && (
            <SmallField label="Pose / energy">
              <Input
                maxLength={APPAREL_TEXT_MAX}
                value={v.scene?.pose ?? ""}
                onChange={(e) =>
                  onChange({ scene: { ...v.scene, pose: e.target.value } })
                }
                placeholder="e.g. leaning relaxed, hand in pocket"
              />
            </SmallField>
          )}
        </div>
      </Block>

      {/* Finishing */}
      <Block label="Finishing">
        <div className="space-y-3">
          <SmallField label="Color anchor">
            <Input
              maxLength={APPAREL_TEXT_MAX}
              value={v.finishing?.color_anchor ?? ""}
              onChange={(e) =>
                onChange({
                  finishing: { ...v.finishing, color_anchor: e.target.value },
                })
              }
              placeholder="e.g. warm sand, smoked olive"
            />
          </SmallField>
          <SmallField
            label="Camera feel"
            hint={`${(v.finishing?.camera_feel ?? []).length}/${APPAREL_MAX_CAMERA_FEELS}`}
          >
            <div className="flex flex-wrap gap-2">
              {APPAREL_CAMERA_FEELS.map((c) => {
                const active = (v.finishing?.camera_feel ?? []).includes(
                  c as never,
                );
                return (
                  <Chip
                    key={c}
                    active={active}
                    onClick={() => toggleCamera(c)}
                    size="sm"
                  >
                    {c}
                  </Chip>
                );
              })}
            </div>
          </SmallField>
        </div>
      </Block>
    </div>
  );
}

function Block({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
          {required && <span className="text-foreground/60 ml-1">·</span>}
        </Label>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function SmallField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border transition-colors",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-foreground/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/** Quick predicate used by the wizard to enable/disable the Next button. */
export function isApparelStepValid(a: Answers): boolean {
  return (
    !!a.archetype &&
    !!a.wearer &&
    Array.isArray(a.garment_focus) &&
    a.garment_focus.length >= 1 &&
    a.garment_focus.length <= APPAREL_MAX_GARMENTS
  );
}
