import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EYEWEAR_ARCHETYPES,
  EYEWEAR_CAMERA_FEELS,
  EYEWEAR_MAX_CAMERA_FEELS,
  EYEWEAR_PRESENTATIONS,
  EYEWEAR_PRESENTATIONS_WITH_PERSON,
  EYEWEAR_TEXT_MAX,
  EYEWEAR_TYPES,
  type EyewearArchetype,
  type EyewearPresentation,
  type EyewearType,
} from "./questions";
import type { EyewearModuleAnswers } from "./schema";

type Answers = Partial<EyewearModuleAnswers>;

interface Props {
  value: Answers;
  onChange: (patch: Answers) => void;
}

export function EyewearQuestions({ value, onChange }: Props) {
  const v: Answers = {
    archetype: value.archetype,
    eyewear_type: value.eyewear_type,
    presentation: value.presentation,
    scene: value.scene ?? {},
    finishing: value.finishing ?? {},
  };

  const hasPerson =
    v.presentation &&
    EYEWEAR_PRESENTATIONS_WITH_PERSON.includes(
      v.presentation as EyewearPresentation,
    );

  const toggleCamera = (c: string) => {
    const cur = v.finishing?.camera_feel ?? [];
    const next = cur.includes(c as never)
      ? cur.filter((x) => x !== c)
      : cur.length < EYEWEAR_MAX_CAMERA_FEELS
        ? [...cur, c]
        : cur;
    onChange({ finishing: { ...v.finishing, camera_feel: next as never } });
  };

  return (
    <div className="space-y-8">
      {/* Archetype */}
      <Block label="Archetype" required>
        <div className="grid grid-cols-2 gap-2">
          {EYEWEAR_ARCHETYPES.map((a) => (
            <Chip
              key={a.value}
              active={v.archetype === a.value}
              onClick={() =>
                onChange({ archetype: a.value as EyewearArchetype })
              }
            >
              {a.label}
            </Chip>
          ))}
        </div>
      </Block>

      {/* Eyewear type */}
      <Block label="Eyewear type" required>
        <div className="flex flex-wrap gap-2">
          {EYEWEAR_TYPES.map((t) => (
            <Chip
              key={t.value}
              active={v.eyewear_type === t.value}
              onClick={() =>
                onChange({ eyewear_type: t.value as EyewearType })
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
          {EYEWEAR_PRESENTATIONS.map((p) => (
            <Chip
              key={p.value}
              active={v.presentation === p.value}
              onClick={() => {
                const next: Answers = {
                  presentation: p.value as EyewearPresentation,
                };
                if (!p.hasPerson && v.scene?.expression) {
                  next.scene = { ...v.scene, expression: undefined };
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
              maxLength={EYEWEAR_TEXT_MAX}
              value={v.scene?.surface ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, surface: e.target.value } })
              }
              placeholder="e.g. warm concrete slab, sand"
            />
          </SmallField>
          <SmallField label="Location specifics">
            <Input
              maxLength={EYEWEAR_TEXT_MAX}
              value={v.scene?.location ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, location: e.target.value } })
              }
              placeholder="e.g. sunlit terrace, harsh shadows"
            />
          </SmallField>
          {hasPerson && (
            <SmallField label="Expression / pose">
              <Input
                maxLength={EYEWEAR_TEXT_MAX}
                value={v.scene?.expression ?? ""}
                onChange={(e) =>
                  onChange({
                    scene: { ...v.scene, expression: e.target.value },
                  })
                }
                placeholder="e.g. chin tilted up, eyes closed"
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
              maxLength={EYEWEAR_TEXT_MAX}
              value={v.finishing?.color_anchor ?? ""}
              onChange={(e) =>
                onChange({
                  finishing: { ...v.finishing, color_anchor: e.target.value },
                })
              }
              placeholder="e.g. amber tortoise, matte black"
            />
          </SmallField>
          <SmallField
            label="Camera feel"
            hint={`${(v.finishing?.camera_feel ?? []).length}/${EYEWEAR_MAX_CAMERA_FEELS}`}
          >
            <div className="flex flex-wrap gap-2">
              {EYEWEAR_CAMERA_FEELS.map((c) => (
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
