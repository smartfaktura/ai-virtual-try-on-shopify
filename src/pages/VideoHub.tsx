import { Film, Layers, Users } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { VideoWorkflowCard } from '@/components/app/video/VideoWorkflowCard';
import { useGenerateVideo } from '@/hooks/useGenerateVideo';
import { format } from 'date-fns';
import { Play, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

function RecentVideoCard({ video }: { video: { id: string; status: string; source_image_url: string; video_url: string | null; created_at: string; prompt: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden group">
      <div className="relative aspect-square bg-muted/30">
        {video.status === 'complete' && video.video_url && isPlaying ? (
          <video src={video.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <button onClick={() => video.video_url && setIsPlaying(true)} className="relative w-full h-full">
            <img src={video.source_image_url} alt="" className="w-full h-full object-cover" />
            {video.status === 'complete' && video.video_url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-10 w-10 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                </div>
              </div>
            )}
          </button>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
          {video.status === 'complete' ? 'Done' : video.status === 'processing' ? 'Processing' : video.status}
        </Badge>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground truncate">{video.prompt || 'No prompt'}</p>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {format(new Date(video.created_at), 'MMM d, h:mm a')}
        </div>
      </div>
    </div>
  );
}

export default function VideoHub() {
  const { history, isLoadingHistory } = useGenerateVideo();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Create Videos"
        description="Turn product shots, campaign visuals, and reference frames into polished short videos."
      />

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VideoWorkflowCard
          icon={Film}
          title="Animate Image"
          description="Turn one still image into a polished short video."
          bestFor={['Product hero', 'Campaign motion', 'Social ads']}
          to="/app/video/animate"
        />
        <VideoWorkflowCard
          icon={Layers}
          title="Create Ad Sequence"
          description="Build a cinematic mini ad from several visuals."
          bestFor={['Product launches', 'Multi-frame ads', 'Brand teasers']}
          to="/app/video/ad-sequence"
          disabled
          comingSoon
        />
        <VideoWorkflowCard
          icon={Users}
          title="Consistent Model Video"
          description="Create videos with stronger subject consistency."
          bestFor={['Spokesmodels', 'Fashion clips', 'Creator content']}
          to="/app/video/consistent-model"
          disabled
          comingSoon
        />
      </div>

      {/* Recent Videos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Videos</h2>
        {isLoadingHistory ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {history.slice(0, 8).map((v) => (
              <RecentVideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <Film className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No videos yet. Create your first one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
