import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Sparkles, Heart, Star, Loader2 } from 'lucide-react';
import { usePostNotes } from '@/hooks/usePostNotes';
import { useReferenceAnalysis } from '@/hooks/useReferenceAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PostDetailDrawerProps {
  post: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateScene: (analysis: any, post: any) => void;
}

export function PostDetailDrawer({ post, open, onOpenChange, onCreateScene }: PostDetailDrawerProps) {
  const queryClient = useQueryClient();
  const { notes, saveNotes } = usePostNotes(post?.id);
  const { analysis, analyzePost } = useReferenceAnalysis(post?.id);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});

  const NOTE_FIELDS = [
    'palette', 'lighting', 'background', 'crop', 'props', 'mood', 'styling_tone', 'premium_cue', 'internal_note',
  ];

  const getNoteValue = (field: string) => noteValues[field] ?? notes?.[field] ?? '';

  const handleSaveNotes = () => {
    const updates: Record<string, string> = {};
    NOTE_FIELDS.forEach(f => { updates[f] = getNoteValue(f); });
    saveNotes.mutate(updates);
    setNoteValues({});
  };

  const toggleFlag = async (field: 'is_favorite' | 'is_worth_aesthetic') => {
    const { error } = await supabase
      .from('watch_posts' as any)
      .update({ [field]: !post[field] })
      .eq('id', post.id);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ['watch-posts-all'] });
    toast.success('Updated');
  };

  if (!post) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Post Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Image */}
          {(post.media_url || post.thumbnail_url) && (
            <img
              src={post.media_url || post.thumbnail_url}
              alt=""
              className="w-full rounded-lg object-cover max-h-80"
            />
          )}

          {/* Meta */}
          <div className="space-y-1 text-sm">
            {post.caption && <p className="text-muted-foreground line-clamp-4">{post.caption}</p>}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.posted_at && <span>{format(new Date(post.posted_at), 'MMM d, yyyy')}</span>}
              {post.media_type && <Badge variant="outline" className="text-[10px]">{post.media_type}</Badge>}
              {(post.like_count > 0) && <span>❤️ {post.like_count}</span>}
              {(post.comment_count > 0) && <span>💬 {post.comment_count}</span>}
            </div>
            {post.permalink && (
              <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                <ExternalLink className="w-3 h-3" /> View on Instagram
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => analyzePost.mutate(post.id)}
              disabled={analyzePost.isPending}
            >
              {analyzePost.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1" />}
              Analyze Post
            </Button>
            <Button size="sm" variant={post.is_favorite ? 'default' : 'outline'} onClick={() => toggleFlag('is_favorite')}>
              <Heart className={`w-3.5 h-3.5 mr-1 ${post.is_favorite ? 'fill-current' : ''}`} /> Favorite
            </Button>
            <Button size="sm" variant={post.is_worth_aesthetic ? 'default' : 'outline'} onClick={() => toggleFlag('is_worth_aesthetic')}>
              <Star className={`w-3.5 h-3.5 mr-1 ${post.is_worth_aesthetic ? 'fill-current' : ''}`} /> Worth Aesthetic
            </Button>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Internal Notes</h4>
            {NOTE_FIELDS.map(field => (
              <div key={field}>
                <Label className="text-xs capitalize">{field.replace(/_/g, ' ')}</Label>
                <Input
                  value={getNoteValue(field)}
                  onChange={e => setNoteValues(prev => ({ ...prev, [field]: e.target.value }))}
                  className="h-8 text-xs"
                />
              </div>
            ))}
            <Button size="sm" onClick={handleSaveNotes} disabled={saveNotes.isPending}>
              {saveNotes.isPending ? 'Saving…' : 'Save Notes'}
            </Button>
          </div>

          {/* Analysis */}
          {analysis && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Visual Analysis</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['category', 'subcategory', 'scene_type', 'lighting_type', 'light_direction',
                    'shadow_softness', 'background_type', 'environment_type', 'crop_type',
                    'camera_angle', 'framing_style', 'composition_logic', 'styling_tone',
                    'mood', 'realism_level', 'image_mode',
                    'recommended_scene_name', 'recommended_aesthetic_family',
                  ].map(field => (
                    <div key={field}>
                      <span className="text-muted-foreground capitalize">{field.replace(/_/g, ' ')}</span>
                      <p className="font-medium">{analysis[field] || '—'}</p>
                    </div>
                  ))}
                </div>
                {analysis.short_summary && (
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded">{analysis.short_summary}</p>
                )}
                {analysis.palette?.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Palette</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {analysis.palette.map((c: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  size="sm"
                  onClick={() => onCreateScene(analysis, post)}
                >
                  Create Scene Recipe
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
