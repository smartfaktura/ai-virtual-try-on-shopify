import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TREND_CATEGORIES } from './constants';

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (account: { display_name: string; username: string; category: string; source_mode: string; profile_image_url?: string }) => void;
  onUpdate?: (account: { id: string; display_name: string; username: string; category: string; source_mode: string; profile_image_url?: string }) => void;
  editingAccount?: any;
  isLoading?: boolean;
}

export function AddAccountModal({ open, onOpenChange, onAdd, onUpdate, editingAccount, isLoading }: AddAccountModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [category, setCategory] = useState<string>(TREND_CATEGORIES[0]);
  const [sourceMode, setSourceMode] = useState('manual');
  const [profileUrl, setProfileUrl] = useState('');

  const isEditing = !!editingAccount;

  useEffect(() => {
    if (editingAccount) {
      setDisplayName(editingAccount.display_name || '');
      setUsername(editingAccount.username || '');
      setCategory(editingAccount.category || TREND_CATEGORIES[0]);
      setSourceMode(editingAccount.source_mode || 'manual');
      setProfileUrl(editingAccount.profile_image_url || '');
    } else {
      setDisplayName('');
      setUsername('');
      setCategory(TREND_CATEGORIES[0]);
      setSourceMode('manual');
      setProfileUrl('');
    }
  }, [editingAccount, open]);

  const handleSubmit = () => {
    if (!displayName.trim() || !username.trim()) return;
    const payload = {
      display_name: displayName.trim(),
      username: username.trim().replace('@', ''),
      category,
      source_mode: sourceMode,
      ...(profileUrl ? { profile_image_url: profileUrl } : {}),
    };
    if (isEditing && onUpdate) {
      onUpdate({ id: editingAccount.id, ...payload });
    } else {
      onAdd(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Account' : 'Add Instagram Account'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Display Name</Label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Brand Name" />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="username (without @)" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TREND_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Source Mode</Label>
            <Select value={sourceMode} onValueChange={setSourceMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="official_api">API (RapidAPI)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Profile Image URL (optional)</Label>
            <Input value={profileUrl} onChange={e => setProfileUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button onClick={handleSubmit} disabled={!displayName.trim() || !username.trim() || isLoading} className="w-full">
            {isLoading ? (isEditing ? 'Saving…' : 'Adding…') : (isEditing ? 'Save Changes' : 'Add Account')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
