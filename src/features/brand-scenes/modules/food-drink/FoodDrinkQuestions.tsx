import { Input } from "@/components/ui/input";
import {
  FOOD_ARCHETYPES,
  FOOD_CAMERA_FEELS,
  FOOD_MAX_CAMERA_FEELS,
  FOOD_PRESENTATIONS,
  FOOD_PRODUCT_TYPES,
  FOOD_SURFACE_CHIPS,
  FOOD_TEXT_MAX,
  type FoodDrinkArchetype,
  type FoodDrinkPresentation,
  type FoodDrinkProductType,
} from "./questions";
import type { FoodDrinkModuleAnswers } from "./schema";
import { Block, ModuleChip, SmallField } from "../_shared/QuestionsScaffold";

type Answers = Partial<FoodDrinkModuleAnswers>;

interface Props {
  value: Answers;
  onChange: (patch: Answers) => void;
}

export function FoodDrinkQuestions({ value, onChange }: Props) {
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
      : cur.length < FOOD_MAX_CAMERA_FEELS
        ? [...cur, c]
        : cur;
    onChange({ finishing: { ...v.finishing, camera_feel: next as never } });
  };

  return (
    <div className="space-y-8">
      <Block label="Archetype" required>
        <div className="grid grid-cols-2 gap-2">
          {FOOD_ARCHETYPES.map((a) => (
            <ModuleChip
              key={a.value}
              active={v.archetype === a.value}
              onClick={() =>
                onChange({ archetype: a.value as FoodDrinkArchetype })
              }
            >
              {a.label}
            </ModuleChip>
          ))}
        </div>
      </Block>

      <Block label="Product type" required>
        <div className="flex flex-wrap gap-2">
          {FOOD_PRODUCT_TYPES.map((t) => (
            <ModuleChip
              key={t.value}
              active={v.product_type === t.value}
              onClick={() =>
                onChange({ product_type: t.value as FoodDrinkProductType })
              }
            >
              {t.label}
            </ModuleChip>
          ))}
        </div>
      </Block>

      <Block label="Presentation" required>
        <div className="grid grid-cols-2 gap-2">
          {FOOD_PRESENTATIONS.map((p) => (
            <ModuleChip
              key={p.value}
              active={v.presentation === p.value}
              onClick={() => {
                const next: Answers = {
                  presentation: p.value as FoodDrinkPresentation,
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
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {FOOD_SURFACE_CHIPS.map((s) => (
                  <ModuleChip
                    key={s.value}
                    active={
                      (v.scene?.surface ?? "").trim().toLowerCase() ===
                      s.label.toLowerCase()
                    }
                    onClick={() =>
                      onChange({
                        scene: {
                          ...v.scene,
                          surface:
                            (v.scene?.surface ?? "").trim().toLowerCase() ===
                            s.label.toLowerCase()
                              ? ""
                              : s.label,
                        },
                      })
                    }
                  >
                    {s.label}
                  </ModuleChip>
                ))}
              </div>
              <Input
                maxLength={FOOD_TEXT_MAX}
                value={v.scene?.surface ?? ""}
                onChange={(e) =>
                  onChange({ scene: { ...v.scene, surface: e.target.value } })
                }
                placeholder="Or type your own — e.g. travertine, brushed steel, banana leaf"
              />
            </div>
          </SmallField>
          <SmallField label="Location">
            <Input
              maxLength={FOOD_TEXT_MAX}
              value={v.scene?.location ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, location: e.target.value } })
              }
              placeholder="e.g. sunlit kitchen, café counter, picnic blanket"
            />
          </SmallField>
          <SmallField label="Mood">
            <Input
              maxLength={FOOD_TEXT_MAX}
              value={v.scene?.mood ?? ""}
              onChange={(e) =>
                onChange({ scene: { ...v.scene, mood: e.target.value } })
              }
              placeholder="e.g. fresh-from-the-oven, slow-Sunday brunch"
            />
          </SmallField>
        </div>
      </Block>

      <Block label="Finishing">
        <div className="space-y-3">
          <SmallField label="Color anchor">
            <Input
              maxLength={FOOD_TEXT_MAX}
              value={v.finishing?.color_anchor ?? ""}
              onChange={(e) =>
                onChange({
                  finishing: { ...v.finishing, color_anchor: e.target.value },
                })
              }
              placeholder="e.g. golden crust, fresh greens"
            />
          </SmallField>
          <SmallField
            label="Camera feel"
            hint={`${(v.finishing?.camera_feel ?? []).length}/${FOOD_MAX_CAMERA_FEELS}`}
          >
            <div className="flex flex-wrap gap-2">
              {FOOD_CAMERA_FEELS.map((c) => (
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
