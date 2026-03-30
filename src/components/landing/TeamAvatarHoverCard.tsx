import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import type { TeamMember } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

interface TeamAvatarHoverCardProps {
  member: TeamMember;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

export function TeamAvatarHoverCard({ member, children, side = 'top', sideOffset = 8 }: TeamAvatarHoverCardProps) {
  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align="center"
        sideOffset={sideOffset}
        className="w-[220px] p-0 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
      >
        {/* Avatar */}
        <div className="w-full aspect-[4/5] bg-muted overflow-hidden">
          <img
            src={getOptimizedUrl(member.avatar, { quality: 75 })}
            alt={member.fullName}
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
