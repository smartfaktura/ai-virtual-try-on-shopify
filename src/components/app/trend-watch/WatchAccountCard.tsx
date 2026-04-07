import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, MoreHorizontal, Plus, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SYNC_STATUS_MAP, SOURCE_MODE_MAP } from './constants';
import { PostThumbnailRow } from './PostThumbnailRow';
import { AddPostManualModal } from './AddPostManualModal';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface WatchAccountCardProps {
  account: any;
  posts: any[];
  onSync: (id: string, username: string) => void;
  onEdit: (account: any) => void;
  onDeactivate: (id: string) => void;
  onPostClick: (post: any) => void;
  isSyncing?: boolean;
}

export function WatchAccountCard({ account, posts, onSync, onEdit, onDeactivate, onPostClick, isSyncing }: WatchAccountCardProps) {
  const [addPostOpen, setAddPostOpen] = useState(false);
  const queryClient = useQueryClient();
  const syncInfo = SYNC_STATUS_MAP[account.sync_status] || SYNC_STATUS_MAP.manual;
  const sourceInfo = SOURCE_MODE_MAP[account.source_mode] || SOURCE_MODE_MAP.manual;

  const handleAddPost = async (post: any) => {
    const { error } = await supabase.from('watch_posts' as any).insert(post);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ['watch-posts-all'] });
    toast.success('Post added');
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {account.profile_image_url ? (
            <img src={account.profile_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">
              {account.display_name?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{account.display_name}</span>
            <span className="text-xs text-muted-foreground">@{account.username}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sourceInfo.className}`}>{sourceInfo.label}</Badge>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${syncInfo.className}`}>{syncInfo.label}</Badge>
            {account.last_synced_at && (
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(account.last_synced_at), 'MMM d, HH:mm')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onSync(account.id, account.username)}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setAddPostOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(account)}>Edit Account</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeactivate(account.id)}>
                {account.is_active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`https://instagram.com/${account.username}`, '_blank')}>
                <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open Instagram
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Posts Row */}
      {posts.length > 0 ? (
        <PostThumbnailRow posts={posts} onPostClick={onPostClick} />
      ) : (
        <div className="flex items-center justify-center h-20 rounded-lg border border-dashed text-xs text-muted-foreground">
          No posts yet — sync or add manually
        </div>
      )}

      <AddPostManualModal
        open={addPostOpen}
        onOpenChange={setAddPostOpen}
        accountId={account.id}
        onAdd={handleAddPost}
      />
    </div>
  );
}
