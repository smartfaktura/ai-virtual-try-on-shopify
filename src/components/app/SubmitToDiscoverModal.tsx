import { useState } from 'react';
import { X, Send, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSubmitToDiscover } from '@/hooks/useDiscoverSubmissions';

const CATEGORIES = [
  'cinematic', 'commercial', 'photography', 'styling', 'ads', 'lifestyle',
] as const;

interface SubmitToDiscoverModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  aspectRatio?: string;
  quality?: string;
  sourceGenerationId?: string;
}

export function SubmitToDiscoverModal({
  open,
  onClose,
  imageUrl,
  prompt,
  aspectRatio = '1:1',
  quality = 'standard',
  sourceGenerationId,
}: SubmitToDiscoverModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('lifestyle');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const submitMutation = useSubmitToDiscover();

  if (!open) return null;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    submitMutation.mutate(
      {
        image_url: imageUrl,
        source_generation_id: sourceGenerationId,
        title: title.trim(),
        prompt,
        category,
        tags,
        aspect_ratio: aspectRatio,
        quality,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background rounded-2xl border border-border/50 shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-lg font-semibold text-foreground">Share to Discover</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="px-6 pb-4">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full max-h-48 object-cover rounded-xl border border-border/30"
          />
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 60))}
              placeholder="Give it a catchy title..."
              className="rounded-xl h-11"
            />
            <p className="text-[10px] text-muted-foreground/50 text-right">{title.length}/60</p>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 capitalize',
                    category === cat
                      ? 'bg-foreground text-background'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/70',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags (optional)</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                className="rounded-xl h-10 flex-1"
                disabled={tags.length >= 5}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                className="rounded-xl h-10 px-3"
              >
                <Tag className="w-3.5 h-3.5" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground/50">{tags.length}/5 tags</p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || submitMutation.isPending}
            className="w-full h-12 rounded-xl text-sm font-medium"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </Button>
          <p className="text-[10px] text-muted-foreground/50 text-center">
            Your submission will be reviewed by our team before appearing in Discover
          </p>
        </div>
      </div>
    </div>
  );
}
