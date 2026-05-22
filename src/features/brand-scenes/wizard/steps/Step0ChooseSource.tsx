import { Wand2, ImagePlus, Lock } from "lucide-react";
import type { BrandSceneSource } from "../../constants";
import { WizardCard } from "../components/WizardCard";

interface Props {
  value: BrandSceneSource;
  onChange: (s: BrandSceneSource) => void;
  onPickReference: () => void;
  referenceUnlocked: boolean;
}

export function Step0ChooseSource({
  value,
  onChange,
  onPickReference,
  referenceUnlocked,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <WizardCard
        active={value === "wizard"}
        onClick={() => onChange("wizard")}
        icon={<Wand2 className="w-5 h-5" />}
        title="Build from the wizard"
        body="Answer a short series of brand questions. We turn them into a tailored scene."
      />
      <WizardCard
        active={value === "reference"}
        onClick={() => {
          if (referenceUnlocked) onChange("reference");
          else onPickReference();
        }}
        icon={
          referenceUnlocked ? (
            <ImagePlus className="w-5 h-5" />
          ) : (
            <Lock className="w-5 h-5" />
          )
        }
        title="Build from a reference"
        body="Upload one inspiration image. We use it as a composition guide and swap in your product."
        tag={!referenceUnlocked ? "Quick check required" : undefined}
      />
    </div>
  );
}
