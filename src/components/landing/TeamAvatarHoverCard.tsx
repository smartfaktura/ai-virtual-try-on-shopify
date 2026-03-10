import { useRef, useCallback } from 'react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import type { TeamMember } from '@/data/teamData';

interface TeamAvatarHoverCardProps {
  member: TeamMember;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

export function TeamAvatarHoverCard({ member, children, side = 'top', sideOffset = 8 }: TeamAvatarHoverCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const shouldPlayRef = useRef(false);

  const handleOpenChange = useCallback((open: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    if (open) {
      shouldPlayRef.current = true;
      video.currentTime = 0;
      video.load();
      video.play().catch(() => {});
    } else {
      shouldPlayRef.current = false;
      video.pause();
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    if (shouldPlayRef.current && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <HoverCard openDelay={200} closeDelay={150} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align="center"
        sideOffset={sideOffset}
        className="w-[220px] p-0 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
      >
        {/* Video */}
        <div className="w-full aspect-[4/5] bg-muted overflow-hidden">
          <video
            ref={videoRef}
            src={member.videoUrl}
            poster={member.avatar}
            muted
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{member.fullName}</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
              {member.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {member.description}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
