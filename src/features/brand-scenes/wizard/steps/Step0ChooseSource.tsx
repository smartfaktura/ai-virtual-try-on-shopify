import { Wand2, ImagePlus, Lock } from "lucide-react";
import type { BrandSceneSource } from "../../constants";

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
      <Card
        active={value === "wizard"}
        onClick={() => onChange("wizard")}
        icon={<Wand2 className="w-5 h-5" />}
        title="Build from the wizard"
        body="Answer a short series of brand questions. We turn them into a tailored scene."
      />
      <Card
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
        body="Upload 1-3 inspiration images. We extract mood, color, and composition only."
        badge={!referenceUnlocked ? "Responsibility check required" : undefined}
      />
    </div>
  );
}

function Card({
  active,
  onClick,
  icon,
  title,
  body,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-5 text-left transition-all",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40",
      ].join(" ")}
    >
      <div
        className={[
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          active ? "bg-background/10" : "bg-foreground/5",
        ].join(" ")}
      >
        {icon}
      </div>
      <div className="text-base font-semibold tracking-tight">{title}</div>
      <p
        className={[
          "text-sm mt-1.5 leading-relaxed",
          active ? "text-background/70" : "text-muted-foreground",
        ].join(" ")}
      >
        {body}
      </p>
      {badge && (
        <div
          className={[
            "mt-3 inline-flex text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full",
            active ? "bg-background/10" : "bg-foreground/5 text-muted-foreground",
          ].join(" ")}
        >
          {badge}
        </div>
      )}
    </button>
  );
}
