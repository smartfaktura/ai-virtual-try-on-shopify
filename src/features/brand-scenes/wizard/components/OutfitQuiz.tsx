import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Chip } from "./Chip";
import { Section } from "./Section";
import {
  OUTFIT_BOTTOMS,
  OUTFIT_CUSTOM_MAX,
  OUTFIT_FOOTWEAR,
  OUTFIT_TOPS,
  OUTFIT_VIBES,
  type OutfitAnswers,
  type OutfitSlotValue,
} from "../constants/outfit";

interface Props {
  value?: OutfitAnswers;
  onChange: (next: OutfitAnswers) => void;
  /** When true, the Vibe section is rendered with a required dot. */
  vibeRequired?: boolean;
  /** When true, hides Top/Bottom slots (e.g. swimwear sub-family). */
  hideGarments?: boolean;
}

export function OutfitQuiz({ value, onChange, vibeRequired, hideGarments }: Props) {
  const v = value ?? {};
  const setSlot = (key: keyof OutfitAnswers, slot: OutfitSlotValue | undefined) => {
    const next: OutfitAnswers = { ...v };
    if (slot && (slot.preset || slot.custom)) {
      // Each slot's preset type is narrow; this generic helper assigns through.
      (next as Record<string, OutfitSlotValue>)[key as string] = slot;
    } else {
      delete next[key];
    }
    onChange(next);
  };

  const vibeMissing = vibeRequired && !v.vibe?.preset && !v.vibe?.custom?.trim();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
      <div className="md:col-span-2">
        <Section label="Outfit vibe" required={vibeRequired} missing={vibeMissing}>
          <SlotChips
            options={OUTFIT_VIBES}
            value={v.vibe}
            onChange={(slot) => setSlot("vibe", slot)}
          />
        </Section>
      </div>

      {!hideGarments && (
        <>
          <Section label="Top">
            <SlotChips
              options={OUTFIT_TOPS}
              value={v.top}
              onChange={(slot) => setSlot("top", slot)}
            />
          </Section>

          <Section label="Bottom">
            <SlotChips
              options={OUTFIT_BOTTOMS}
              value={v.bottom}
              onChange={(slot) => setSlot("bottom", slot)}
            />
          </Section>
        </>
      )}

      <div className={hideGarments ? "md:col-span-2" : ""}>
        <Section label="Footwear">
          <SlotChips
            options={OUTFIT_FOOTWEAR}
            value={v.footwear}
            onChange={(slot) => setSlot("footwear", slot)}
          />
        </Section>
      </div>
    </div>
  );
}

function SlotChips<T extends { value: string; label: string }>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<T>;
  value?: OutfitSlotValue;
  onChange: (slot: OutfitSlotValue | undefined) => void;
}) {
  const customActive = !!value?.custom || (value?.preset === undefined && (value?.custom ?? "").length > 0);
  const [customOpen, setCustomOpen] = useState<boolean>(customActive);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-x-2 gap-y-2.5">
        {options.map((o) => (
          <Chip
            key={o.value}
            active={value?.preset === o.value && !value?.custom}
            onClick={() => {
              if (value?.preset === o.value && !value?.custom) {
                onChange(undefined);
              } else {
                setCustomOpen(false);
                onChange({ preset: o.value });
              }
            }}
          >
            {o.label}
          </Chip>
        ))}
        <Chip
          active={!!value?.custom || customOpen}
          onClick={() => {
            if (value?.custom) {
              onChange(undefined);
              setCustomOpen(false);
            } else {
              setCustomOpen(true);
            }
          }}
        >
          Custom…
        </Chip>
      </div>

      {(customOpen || value?.custom) && (
        <Input
          autoFocus
          value={value?.custom ?? ""}
          maxLength={OUTFIT_CUSTOM_MAX}
          onChange={(e) => {
            const next = e.target.value;
            if (!next) {
              onChange(undefined);
              return;
            }
            onChange({ custom: next });
          }}
          placeholder="Describe in your own words"
          className="rounded-xl h-9 text-sm max-w-md"
        />
      )}
    </div>
  );
}
