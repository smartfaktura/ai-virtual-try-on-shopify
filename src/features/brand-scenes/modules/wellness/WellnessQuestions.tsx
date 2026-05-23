import { Input } from "@/components/ui/input";
import {
  WELLNESS_ARCHETYPES,
  WELLNESS_CAMERA_FEELS,
  WELLNESS_MAX_CAMERA_FEELS,
  WELLNESS_PRESENTATIONS,
  WELLNESS_PRODUCT_TYPES,
  WELLNESS_TEXT_MAX,
  type WellnessArchetype,
  type WellnessPresentation,
  type WellnessProductType,
} from "./questions";
import type { WellnessModuleAnswers } from "./schema";
import { Block, ModuleChip, SmallField } from "../_shared/QuestionsScaffold";

type Answers = Partial<WellnessModuleAnswers>;

interface Props {
  value: Answers;
  onChange: (patch: Answers) => void;
}

export function WellnessQuestions({ value, onChange }: Props) {
  const v: Answers = {
    archetype: value.archetype,
    product_type: value.product_type,
    presentation: value.presentation,
    scene: value.scene ?? {},
    finishing: value.finishing ?? {},
  };

  const toggleCamera = (c: string) => {
    const cur = v.finishing?.camera_feel ?? [];
    const next = cur.includes(c as never)
      ? cur.filter((x) => x !== c)
      : cur.length < WELLNESS_MAX_CAMERA_FEELS
        ? [...cur, c]
        : cur;
    onChange({ finishing: { ...v.finishing, camera_feel: next as never } });
  };

  return (
    <div className="space-y-8">
      <Block label="Archetype" required>
        <div className="grid grid-cols-2 gap-2">
          {WELLNESS_ARCHETYPES.map((a) => (
            <ModuleChip
              key={a.value}
              active={v.archetype === a.value}
              onClick={() =>
                onChange({ archetype: a.value as WellnessArchetype })
              }
            >
              {a.label}
            </ModuleChip>
          ))}
        </div>
      </Block>

      <Block label="Product type" required>
        <div className="flex flex-wrap gap-2">
          {WELLNESS_PRODUCT_TYPES.map((t) => (
            <ModuleChip
              key={t.value}
              active={v.product_type === t.value}
              onClick={() =>
                onChange({ product_type: t.value as WellnessProductType })
              }
            >
              {t.label}
            </ModuleChip>
          ))}
        </div>
      </Block>

      <Block label="Presentation" required>
        <div className="grid grid-cols-2 gap-2">
          {WELLNESS_PRESENTATIONS.map((p) => (
            <ModuleChip
              key={p.value}
              active={v.presentation === p.value}
              onClick={() => {
                const next: Answers = {
                  presentation: p.value as WellnessPresentation,
                };
                if (!p.hasPerson && v.scene?.expression) {
                  next.scene = { ...v.scene, expression: undefined };
                }
                onChange(next);
              }}
            >
              {p.label}
            </ModuleChip>
          ))}
        </div>
      </Block>

      <Block label="Scene">
        <div className="space-y-3">
          <SmallField label="Surface">
            <Input
              maxLength={WELLNESS_TEXT_MAX}
              value={v.scene?.surface ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, surface: e.target.value } })
              }
              placeholder="e.g. travertine, brushed concrete, linen"
            />
          </SmallField>
          <SmallField label="Location">
            <Input
              maxLength={WELLNESS_TEXT_MAX}
              value={v.scene?.location ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, location: e.target.value } })
              }
              placeholder="e.g. sunlit loft, gallery wall, beach at dawn"
            />
          </SmallField>
          <SmallField label="Mood">
            <Input
              maxLength={WELLNESS_TEXT_MAX}
              value={v.scene?.mood ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, mood: e.target.value } })
              }
              placeholder="e.g. quiet luxury, sun-drenched calm"
            />
          </SmallField>
        </div>
      </Block>

      <Block label="Finishing">
        <div className="space-y-3">
          <SmallField label="Color anchor">
            <Input
              maxLength={WELLNESS_TEXT_MAX}
              value={v.finishing?.color_anchor ?? ""}
              onChange={(e) =>
                onChange({
                  finishing: { ...v.finishing, color_anchor: e.target.value },
                })
              }
              placeholder="e.g. sage clay, soft linen"
            />
          </SmallField>
          <SmallField
            label="Camera feel"
            hint={`${(v.finishing?.camera_feel ?? []).length}/${WELLNESS_MAX_CAMERA_FEELS}`}
          >
            <div className="flex flex-wrap gap-2">
              {WELLNESS_CAMERA_FEELS.map((c) => (
                <ModuleChip
                  key={c}
                  active={(v.finishing?.camera_feel ?? []).includes(c as never)}
                  onClick={() => toggleCamera(c)}
                >
                  {c}
                </ModuleChip>
              ))}
            </div>
          </SmallField>
        </div>
      </Block>
    </div>
  );
}
