import { format } from 'date-fns';

interface PostThumbnailRowProps {
  posts: any[];
  onPostClick: (post: any) => void;
}

export function PostThumbnailRow({ posts, onPostClick }: PostThumbnailRowProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {posts.map((post: any) => (
        <button
          key={post.id}
          onClick={() => onPostClick(post)}
          className="relative group aspect-square rounded-lg overflow-hidden bg-muted border hover:ring-2 hover:ring-primary/50 transition-all"
        >
          {post.media_url || post.thumbnail_url ? (
            <img
              src={post.thumbnail_url || post.media_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
              No img
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
            <span className="text-[9px] text-white/90 text-center line-clamp-2">
              {post.caption?.slice(0, 40) || 'No caption'}
            </span>
            {post.posted_at && (
              <span className="text-[8px] text-white/60 mt-0.5">
                {format(new Date(post.posted_at), 'MMM d')}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
