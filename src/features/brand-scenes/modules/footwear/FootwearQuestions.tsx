import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FOOTWEAR_ARCHETYPES,
  FOOTWEAR_CAMERA_FEELS,
  FOOTWEAR_MAX_CAMERA_FEELS,
  FOOTWEAR_PRESENTATIONS,
  FOOTWEAR_TEXT_MAX,
  FOOTWEAR_TYPES,
  PRESENTATIONS_WITH_PERSON,
  type FootwearArchetype,
  type FootwearPresentation,
  type FootwearType,
} from "./questions";
import type { FootwearModuleAnswers } from "./schema";

type Answers = Partial<FootwearModuleAnswers>;

interface Props {
  value: Answers;
  onChange: (patch: Answers) => void;
}

export function FootwearQuestions({ value, onChange }: Props) {
  const v: Answers = {
    archetype: value.archetype,
    footwear_type: value.footwear_type,
    presentation: value.presentation,
    scene: value.scene ?? {},
    finishing: value.finishing ?? {},
  };

  const hasPerson =
    v.presentation &&
    PRESENTATIONS_WITH_PERSON.includes(v.presentation as FootwearPresentation);

  const toggleCamera = (c: string) => {
    const cur = v.finishing?.camera_feel ?? [];
    const next = cur.includes(c as never)
      ? cur.filter((x) => x !== c)
      : cur.length < FOOTWEAR_MAX_CAMERA_FEELS
        ? [...cur, c]
        : cur;
    onChange({ finishing: { ...v.finishing, camera_feel: next as never } });
  };

  return (
    <div className="space-y-8">
      {/* Archetype */}
      <Block label="Archetype" required>
        <div className="grid grid-cols-2 gap-2">
          {FOOTWEAR_ARCHETYPES.map((a) => (
            <Chip
              key={a.value}
              active={v.archetype === a.value}
              onClick={() =>
                onChange({ archetype: a.value as FootwearArchetype })
              }
            >
              {a.label}
            </Chip>
          ))}
        </div>
      </Block>

      {/* Footwear type */}
      <Block label="Footwear type" required>
        <div className="flex flex-wrap gap-2">
          {FOOTWEAR_TYPES.map((t) => (
            <Chip
              key={t.value}
              active={v.footwear_type === t.value}
              onClick={() =>
                onChange({ footwear_type: t.value as FootwearType })
              }
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </Block>

      {/* Presentation */}
      <Block label="Presentation" required>
        <div className="grid grid-cols-2 gap-2">
          {FOOTWEAR_PRESENTATIONS.map((p) => (
            <Chip
              key={p.value}
              active={v.presentation === p.value}
              onClick={() => {
                const next: Answers = {
                  presentation: p.value as FootwearPresentation,
                };
                if (!p.hasPerson && v.scene?.pose) {
                  next.scene = { ...v.scene, pose: undefined };
                }
                onChange(next);
              }}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </Block>

      {/* Scene */}
      <Block label="Scene setting">
        <div className="space-y-3">
          <SmallField label="Surface / pedestal">
            <Input
              maxLength={FOOTWEAR_TEXT_MAX}
              value={v.scene?.surface ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, surface: e.target.value } })
              }
              placeholder="e.g. raw plaster slab, polished marble"
            />
          </SmallField>
          <SmallField label="Location specifics">
            <Input
              maxLength={FOOTWEAR_TEXT_MAX}
              value={v.scene?.location ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, location: e.target.value } })
              }
              placeholder="e.g. sunlit corridor, long shadows"
            />
          </SmallField>
          {hasPerson && (
            <SmallField label="Pose / movement">
              <Input
                maxLength={FOOTWEAR_TEXT_MAX}
                value={v.scene?.pose ?? ""}
                onChange={(e) =>
                  onChange({ scene: { ...v.scene, pose: e.target.value } })
                }
                placeholder="e.g. mid-stride, weight on heel"
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
              maxLength={FOOTWEAR_TEXT_MAX}
              value={v.finishing?.color_anchor ?? ""}
              onChange={(e) =>
                onChange({
                  finishing: { ...v.finishing, color_anchor: e.target.value },
                })
              }
              placeholder="e.g. chalk white, smoked olive"
            />
          </SmallField>
          <SmallField
            label="Camera feel"
            hint={`${(v.finishing?.camera_feel ?? []).length}/${FOOTWEAR_MAX_CAMERA_FEELS}`}
          >
            <div className="flex flex-wrap gap-2">
              {FOOTWEAR_CAMERA_FEELS.map((c) => (
                <Chip
                  key={c}
                  active={(v.finishing?.camera_feel ?? []).includes(c as never)}
                  onClick={() => toggleCamera(c)}

                >
                  {c}
                </Chip>
              ))}
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
