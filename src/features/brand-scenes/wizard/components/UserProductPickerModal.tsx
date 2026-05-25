import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export interface PickedProduct {
  url: string;
  label: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (product: PickedProduct) => void;
}

interface ProductRow {
  id: string;
  title: string | null;
  image_url: string | null;
}

export function UserProductPickerModal({ open, onOpenChange, onPick }: Props) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<ProductRow[]>({
    queryKey: ["brand-scene-user-products"],
    enabled: open,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_products")
        .select("id, title, image_url")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).filter((r) => !!r.image_url) as ProductRow[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((p) => (p.title ?? "").toLowerCase().includes(q));
  }, [data, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Use one of your products</DialogTitle>
          <DialogDescription>
            Pick a product to stand in for the preview. The saved scene still works with any of your products later.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your products"
            className="pl-9"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Package className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium">
                {data && data.length === 0 ? "No products yet" : "No matches"}
              </div>
              <p className="text-[12px] text-muted-foreground mt-1 max-w-xs">
                {data && data.length === 0
                  ? "Add a product to your library to use it as a preview stand-in."
                  : "Try a different search term."}
              </p>
              {data && data.length === 0 && (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/app/products">Add a product</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onPick({ url: p.image_url as string, label: p.title?.trim() || "Your product" });
                    onOpenChange(false);
                  }}
                  className="group text-left rounded-lg border border-border bg-card overflow-hidden hover:border-primary/60 hover:shadow-sm transition"
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={p.image_url as string}
                      alt={p.title ?? "Product"}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-2 py-1.5 text-[11px] truncate">
                    {p.title || "Untitled"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
