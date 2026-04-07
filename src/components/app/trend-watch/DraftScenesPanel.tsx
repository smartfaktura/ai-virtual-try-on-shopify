import { useSceneRecipes, usePromptOutputs } from '@/hooks/useSceneRecipes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trash2, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function DraftScenesPanel() {
  const { recipes, isLoading, updateRecipe, generatePrompts } = useSceneRecipes();
  const drafts = recipes.filter((r: any) => r.status === 'draft');

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading draft scenes…</div>;
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No draft scenes yet.</p>
        <p className="text-xs mt-1">Analyze posts from the Accounts Feed, or paste/upload an image to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {drafts.map((recipe: any) => (
        <DraftSceneCard
          key={recipe.id}
          recipe={recipe}
          onGeneratePrompt={() => generatePrompts.mutate(recipe.id)}
          isGenerating={generatePrompts.isPending}
          onDelete={() => updateRecipe.mutate({ id: recipe.id, status: 'archived' })}
        />
      ))}
    </div>
  );
}

function DraftSceneCard({
  recipe,
  onGeneratePrompt,
  isGenerating,
  onDelete,
}: {
  recipe: any;
  onGeneratePrompt: () => void;
  isGenerating: boolean;
  onDelete: () => void;
}) {
  const { data: promptOutput } = usePromptOutputs(recipe.id);
  const masterPrompt = promptOutput?.master_scene_prompt;

  const chips = [
    recipe.mood,
    recipe.lighting,
    recipe.scene_type,
    recipe.aesthetic_family,
  ].filter(Boolean);

  const handleCopyPrompt = () => {
    if (masterPrompt) {
      navigator.clipboard.writeText(masterPrompt);
      toast.success('Prompt copied');
    }
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
            {!masterPrompt && recipe.short_description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{recipe.short_description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">Draft</Badge>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chips.map((c, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>
            ))}
          </div>
        )}

        {/* Show full prompt if generated */}
        {masterPrompt && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Master Prompt</span>
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={handleCopyPrompt}>
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <div className="bg-muted rounded-md p-2.5 text-xs leading-relaxed max-h-40 overflow-y-auto">
              {masterPrompt}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={onGeneratePrompt} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
            {masterPrompt ? 'Regenerate Prompt' : 'Generate Prompt'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
