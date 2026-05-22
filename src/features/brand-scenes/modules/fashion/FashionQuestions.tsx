import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chip, AddChip } from "../../wizard/components/Chip";
import {
  FASHION_CAMERA_FEELS,
  FASHION_MAX_CAMERA_FEELS,
  FASHION_MAX_VIBES,
  FASHION_SETTINGS,
  FASHION_TEXT_MAX,
  FASHION_VIBES,
  FASHION_WEARERS,
  WEARERS_WITH_PERSON,
  type FashionWearer,
} from "./questions";
import {
  isFashionStepValid as isFashionStepValidImpl,
  type FashionModuleAnswers,
} from "./schema";

type Answers = Partial<FashionModuleAnswers>;

interface Props {
  value: Answers;
  onChange: (patch: Answers) => void;
}

export function FashionQuestions({ value, onChange }: Props) {
  const v: Answers = {
    wearer: value.wearer,
    scene: value.scene ?? {},
    finishing: value.finishing ?? {},
  };

  const hasPerson =
    v.wearer && WEARERS_WITH_PERSON.includes(v.wearer as FashionWearer);

  const settingValue = v.scene?.location ?? "";
  const isCustomSetting =
    settingValue.length > 0 &&
    !(FASHION_SETTINGS as readonly string[]).includes(settingValue);
  const [showCustomSetting, setShowCustomSetting] = useState(isCustomSetting);

  const vibeList = (v.scene?.props ?? "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleVibe = (vibe: string) => {
    const next = vibeList.includes(vibe)
      ? vibeList.filter((x) => x !== vibe)
      : vibeList.length < FASHION_MAX_VIBES
        ? [...vibeList, vibe]
        : vibeList;
    onChange({ scene: { ...v.scene, props: next.join(" · ") } });
  };

  const toggleCamera = (c: string) => {
    const cur = v.finishing?.camera_feel ?? [];
    const next = cur.includes(c as never)
      ? cur.filter((x) => x !== c)
      : cur.length < FASHION_MAX_CAMERA_FEELS
        ? [...cur, c]
        : cur;
    onChange({ finishing: { ...v.finishing, camera_feel: next as never } });
  };

  return (
    <div className="space-y-8">
      <Block label="Who's wearing it" required>
        <div className="flex flex-wrap gap-2">
          {FASHION_WEARERS.map((w) => (
            <Chip
              key={w.value}
              active={v.wearer === w.value}
              onClick={() => {
                const next: Answers = { wearer: w.value as FashionWearer };
                if (!w.hasPerson && v.scene?.pose) {
                  next.scene = { ...v.scene, pose: undefined };
                }
                onChange(next);
              }}
            >
              {w.label}
            </Chip>
          ))}
        </div>
      </Block>

      <Block label="Setting">
        <div className="flex flex-wrap gap-2">
          {FASHION_SETTINGS.map((s) => {
            const active = settingValue === s;
            return (
              <Chip
                key={s}
                active={active}
                onClick={() => {
                  setShowCustomSetting(false);
                  onChange({ scene: { ...v.scene, location: s } });
                }}
              >
                {s}
              </Chip>
            );
          })}
          {!showCustomSetting && (
            <AddChip
              onClick={() => {
                setShowCustomSetting(true);
                if (!isCustomSetting) {
                  onChange({ scene: { ...v.scene, location: "" } });
                }
              }}
            />
          )}
        </div>
        {showCustomSetting && (
          <Input
            value={isCustomSetting ? settingValue : ""}
            maxLength={FASHION_TEXT_MAX}
            onChange={(e) =>
              onChange({ scene: { ...v.scene, location: e.target.value } })
            }
            placeholder="Describe your own setting"
            className="rounded-xl"
            autoFocus
          />
        )}
      </Block>

      <Block
        label="Vibe & props"
        hint={`${vibeList.length}/${FASHION_MAX_VIBES}`}
      >
        <div className="flex flex-wrap gap-2">
          {FASHION_VIBES.map((vibe) => (
            <Chip
              key={vibe}
              active={vibeList.includes(vibe)}
              onClick={() => toggleVibe(vibe)}
            >
              {vibe}
            </Chip>
          ))}
        </div>
      </Block>

      <Block
        label="Camera feel"
        hint={`${(v.finishing?.camera_feel ?? []).length}/${FASHION_MAX_CAMERA_FEELS}`}
      >
        <div className="flex flex-wrap gap-2">
          {FASHION_CAMERA_FEELS.map((c) => {
            const active = (v.finishing?.camera_feel ?? []).includes(c as never);
            return (
              <Chip key={c} active={active} onClick={() => toggleCamera(c)}>
                {c}
              </Chip>
            );
          })}
        </div>
      </Block>

      <Block label="Color anchor">
        <Input
          maxLength={FASHION_TEXT_MAX}
          value={v.finishing?.color_anchor ?? ""}
          onChange={(e) =>
            onChange({
              finishing: { ...v.finishing, color_anchor: e.target.value },
            })
          }
          placeholder="e.g. warm sand, smoked olive (optional)"
          className="rounded-xl"
        />
      </Block>

      {hasPerson && (
        <Block label="Pose / energy">
          <Input
            maxLength={FASHION_TEXT_MAX}
            value={v.scene?.pose ?? ""}
            onChange={(e) =>
              onChange({ scene: { ...v.scene, pose: e.target.value } })
            }
            placeholder="e.g. leaning relaxed, hand in pocket (optional)"
            className="rounded-xl"
          />
        </Block>
      )}
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

/** Re-export for callers that import the validator from the component file. */
export const isFashionStepValid = isFashionStepValidImpl;
