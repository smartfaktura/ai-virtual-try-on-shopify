import { ImagePlus } from "lucide-react";
import {
  BRAND_SCENE_REFERENCE_MAX_IMAGES,
  BRAND_SCENE_REFERENCE_MAX_BYTES,
} from "../../constants";

interface Props {
  paths: string[];
  onChange: (paths: string[]) => void;
}

/**
 * Phase 6.5 shell — UI only. Actual storage upload, MIME validation, and
 * AI mood extraction land in Phase 7a. This component renders the field
 * so the source-fork is testable end-to-end.
 */
export function ReferenceImagePicker({ paths }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <ImagePlus className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Upload {BRAND_SCENE_REFERENCE_MAX_IMAGES} reference images
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          JPG, PNG or WEBP · up to{" "}
          {Math.round(BRAND_SCENE_REFERENCE_MAX_BYTES / 1024 / 1024)}MB each
        </p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mt-4">
          Upload arrives in Phase 7a
        </p>
      </div>

      {paths.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {paths.length} reference{paths.length === 1 ? "" : "s"} attached
        </div>
      )}
    </div>
  );
}
