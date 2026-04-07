import { useState } from 'react';
import { useSceneRecipes, usePromptOutputs } from '@/hooks/useSceneRecipes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ImagePlus, Palette, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { toast } from 'sonner';
import { usePublishScene } from '@/hooks/useSceneRecipes';

export function ReadyScenesPanel() {
  const { recipes, isLoading } = useSceneRecipes();
  const readyRecipes = recipes.filter((r: any) => r.status === 'prompt_ready' || r.status === 'published');

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading ready scenes…</div>;
  }

  if (readyRecipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No ready scenes yet.</p>
        <p className="text-xs mt-1">Generate prompts from Draft Scenes to see them here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {readyRecipes.map((recipe: any) => (
        <ReadySceneCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

function ReadySceneCard({ recipe }: { recipe: any }) {
  const { data: promptOutput } = usePromptOutputs(recipe.id);
  const { publishToProductImages, publishToFreestyle } = usePublishScene();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const chips = [
    recipe.mood,
    recipe.lighting,
    recipe.scene_type,
    recipe.aesthetic_family,
  ].filter(Boolean);

  const masterPrompt = promptOutput?.master_scene_prompt || '';

  const handleCopy = async () => {
    if (!masterPrompt) return;
    await navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    toast.success('Prompt copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToProductImages = () => {
    publishToProductImages.mutate({ recipe, promptOutput });
  };

  const handleAddToFreestyle = () => {
    publishToFreestyle.mutate({ recipe, promptOutput });
  };

  return (
    <Card className="overflow-hidden">
      {recipe.preview_image_url && (
        <div className="aspect-square bg-muted">
          <img
            src={recipe.preview_image_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-sm leading-tight">{recipe.name}</h4>
            {recipe.short_description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{recipe.short_description}</p>
            )}
          </div>
          <Badge
            variant={recipe.status === 'published' ? 'default' : 'secondary'}
            className="text-[10px] shrink-0"
          >
            {recipe.status === 'published' ? 'Published' : 'Ready'}
          </Badge>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chips.map((c, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>
            ))}
          </div>
        )}

        {masterPrompt && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Hide prompt' : 'Show prompt'}
            </button>
            {expanded && (
              <p className="text-xs text-muted-foreground mt-1.5 bg-muted p-2 rounded max-h-48 overflow-y-auto whitespace-pre-wrap">
                {masterPrompt}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!masterPrompt}>
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddToProductImages}
            disabled={publishToProductImages.isPending}
          >
            <ImagePlus className="w-3.5 h-3.5 mr-1" /> Product Images
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddToFreestyle}
            disabled={publishToFreestyle.isPending}
          >
            <Palette className="w-3.5 h-3.5 mr-1" /> Freestyle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
