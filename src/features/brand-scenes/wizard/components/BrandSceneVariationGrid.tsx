import { Check } from "lucide-react";
import type { GeneratedVariation } from "../../api/brandSceneApi";

interface Props {
  variations: GeneratedVariation[];
  selectedUrl: string | null;
  onSelect: (url: string) => void;
}

export function BrandSceneVariationGrid({ variations, selectedUrl, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {variations.map((v) => {
        const isSelected = v.url === selectedUrl;
        return (
          <button
            key={v.index}
            type="button"
            onClick={() => onSelect(v.url)}
            className={`group relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all ${
              isSelected
                ? "border-foreground shadow-lg"
                : "border-border hover:border-foreground/40"
            }`}
          >
            <img
              src={v.url}
              alt={`Variation ${v.index + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className={`absolute inset-0 transition-opacity ${
                isSelected ? "bg-foreground/10 opacity-100" : "bg-foreground/0 opacity-0 group-hover:opacity-100 group-hover:bg-foreground/5"
              }`}
            />
            {isSelected && (
              <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center shadow-md">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-[10px] font-semibold uppercase tracking-widest text-white drop-shadow">
              Option {v.index + 1}
            </div>
          </button>
        );
      })}
    </div>
  );
}
