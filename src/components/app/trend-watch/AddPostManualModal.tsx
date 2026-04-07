import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddPostManualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  onAdd: (post: any) => void;
  isLoading?: boolean;
}

export function AddPostManualModal({ open, onOpenChange, accountId, onAdd, isLoading }: AddPostManualModalProps) {
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [permalink, setPermalink] = useState('');
  const [postedAt, setPostedAt] = useState('');

  const handleSubmit = () => {
    if (!mediaUrl.trim()) return;
    onAdd({
      watch_account_id: accountId,
      media_url: mediaUrl.trim(),
      thumbnail_url: mediaUrl.trim(),
      caption: caption.trim(),
      permalink: permalink.trim() || null,
      posted_at: postedAt || new Date().toISOString(),
      media_type: 'image',
    });
    setMediaUrl('');
    setCaption('');
    setPermalink('');
    setPostedAt('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Post Manually</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Image URL *</Label>
            <Input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Caption</Label>
            <Textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Post caption..." rows={3} />
          </div>
          <div>
            <Label>Permalink</Label>
            <Input value={permalink} onChange={e => setPermalink(e.target.value)} placeholder="https://instagram.com/p/..." />
          </div>
          <div>
            <Label>Posted Date</Label>
            <Input type="datetime-local" value={postedAt} onChange={e => setPostedAt(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={!mediaUrl.trim() || isLoading} className="w-full">
            {isLoading ? 'Adding…' : 'Add Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
