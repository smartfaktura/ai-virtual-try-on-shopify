import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveBrandSceneAsPublicScene } from "../../api/brandSceneApi";
import { injectReferenceTokens } from "../../prompt/injectReferenceTokens";
import type { BrandSceneAnswers } from "../../types";
import { CATEGORY_FAMILY_MAP, getSubFamilyLabel } from "@/lib/sceneTaxonomy";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: BrandSceneAnswers;
  defaultName: string;
  previewImageUrl: string | null;
  compiledPrompt: string;
  hasPeople: boolean;
  onSaved?: () => void;
}

type Bucket = { category_collection: string; sub_category: string | null };

export function SaveToPublicScenesDialog({
  open,
  onOpenChange,
  answers,
  defaultName,
  previewImageUrl,
  compiledPrompt,
  hasPeople,
  onSaved,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [categoryCollection, setCategoryCollection] = useState<string>("");
  const [subCategoryMode, setSubCategoryMode] = useState<"existing" | "new">("existing");
  const [subCategoryExisting, setSubCategoryExisting] = useState<string>("");
  const [subCategoryNew, setSubCategoryNew] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setName(defaultName);
    setSubmitting(false);
    setSubCategoryMode("existing");
    setSubCategoryNew("");
    setSubCategoryExisting("");
  }, [open, defaultName]);

  const { data: buckets = [], isLoading: bucketsLoading } = useQuery({
    queryKey: ["public-scene-buckets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_image_scenes")
        .select("category_collection, sub_category")
        .not("category_collection", "is", null);
      if (error) throw error;
      return (data ?? []) as Bucket[];
    },
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const b of buckets) {
      if (b.category_collection) set.add(b.category_collection);
    }
    return Array.from(set).sort();
  }, [buckets]);

  useEffect(() => {
    if (!open || categoryCollection) return;
    const wizardSlug = (answers as any).sub_family as string | undefined;
    if (wizardSlug && categories.includes(wizardSlug)) {
      setCategoryCollection(wizardSlug);
    }
  }, [open, categories, categoryCollection, answers]);

  const subCategories = useMemo(() => {
    if (!categoryCollection) return [];
    const set = new Set<string>();
    for (const b of buckets) {
      if (b.category_collection === categoryCollection && b.sub_category) {
        set.add(b.sub_category);
      }
    }
    return Array.from(set).sort();
  }, [buckets, categoryCollection]);

  useEffect(() => {
    if (subCategoryMode === "existing" && subCategoryExisting && !subCategories.includes(subCategoryExisting)) {
      setSubCategoryExisting("");
    }
    if (categoryCollection && subCategoryMode === "existing" && subCategories.length === 0) {
      setSubCategoryMode("new");
    }
  }, [categoryCollection, subCategories, subCategoryExisting, subCategoryMode]);

  const finalSubCategory =
    subCategoryMode === "new" ? subCategoryNew.trim() : subCategoryExisting.trim();
  const trimmedName = name.trim();
  const canSubmit =
    !!previewImageUrl &&
    trimmedName.length >= 2 &&
    !!categoryCollection &&
    finalSubCategory.length >= 2 &&
    !submitting;

  const categoryLabel = (slug: string) => {
    const family = CATEGORY_FAMILY_MAP[slug];
    const sub = getSubFamilyLabel(slug);
    return family && family !== sub ? `${family} → ${sub}` : sub;
  };

  const handleSubmit = async () => {
    if (!canSubmit || !previewImageUrl) return;
    setSubmitting(true);
    try {
      const persistedPrompt = injectReferenceTokens(compiledPrompt, { hasPeople });
      const { scene } = await saveBrandSceneAsPublicScene({
        answers,
        name: trimmedName,
        previewImageUrl,
        categoryCollection,
        subCategory: finalSubCategory,
        compiledPrompt: persistedPrompt,
      });
      toast.success(
        `Published to ${categoryLabel(scene.category_collection)} → ${scene.sub_category}`,
      );
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save to public scenes");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !submitting && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Save to Public Scenes</DialogTitle>
          <DialogDescription>
            Admin only — places this scene in the live Visual Studio library under the
            category and sub-category you pick.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="public-scene-name" className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Scene title
            </Label>
            <Input
              id="public-scene-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 80))}
              placeholder="e.g. Coastal cliff"
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Category
            </Label>
            <Select value={categoryCollection} onValueChange={setCategoryCollection}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={bucketsLoading ? "Loading…" : "Pick a category"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {categories.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    {categoryLabel(slug)}
                    <span className="text-muted-foreground/60 ml-2 text-[10px]">{slug}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {categoryCollection && (
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Sub-category
              </Label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSubCategoryMode("existing")}
                  className={`px-2.5 py-1 rounded-full border transition-colors ${
                    subCategoryMode === "existing"
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  disabled={subCategories.length === 0}
                >
                  Existing ({subCategories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubCategoryMode("new")}
                  className={`px-2.5 py-1 rounded-full border transition-colors ${
                    subCategoryMode === "new"
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create new
                </button>
              </div>
              {subCategoryMode === "existing" ? (
                <Select value={subCategoryExisting} onValueChange={setSubCategoryExisting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a sub-category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {subCategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={subCategoryNew}
                  onChange={(e) => setSubCategoryNew(e.target.value.slice(0, 80))}
                  placeholder="e.g. Coastal Editorial"
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Saving" : "Publish to library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
