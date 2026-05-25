import { Wand2, ImagePlus } from "lucide-react";
import type { BrandSceneSource } from "../../constants";
import { WizardCard } from "../components/WizardCard";

interface Props {
  value: BrandSceneSource;
  picked: boolean;
  onChange: (s: BrandSceneSource) => void;
}

export function Step0ChooseSource({ value, picked, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <WizardCard
        active={picked && value === "wizard"}
        onClick={() => onChange("wizard")}
        icon={<Wand2 className="w-5 h-5" />}
        title="Build from the wizard"
        body="Answer a short series of brand questions. We turn them into a tailored scene."
      />
      <WizardCard
        active={picked && value === "reference"}
        onClick={() => onChange("reference")}
        icon={<ImagePlus className="w-5 h-5" />}
        title="Build from a reference"
        body="Upload one inspiration image. We use it as a composition guide and swap in your product."
      />
    </div>
  );
}
