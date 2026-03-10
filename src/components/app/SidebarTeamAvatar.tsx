import { useState, useEffect } from 'react';
import { TEAM_MEMBERS } from '@/data/teamData';
import { TeamAvatarHoverCard } from '@/components/landing/TeamAvatarHoverCard';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarTeamAvatarProps {
  collapsed?: boolean;
}

export function SidebarTeamAvatar({ collapsed = false }: SidebarTeamAvatarProps) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TEAM_MEMBERS.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % TEAM_MEMBERS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const member = TEAM_MEMBERS[index];

  if (collapsed) {
    return (
      <div className={cn('px-2 py-2 flex justify-center')}>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <TeamAvatarHoverCard member={member} side="right">
                <button className="focus:outline-none">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/10 transition-all duration-500"
                  />
                </button>
              </TeamAvatarHoverCard>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {member.name} — {member.statusMessage}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <TeamAvatarHoverCard member={member} side="right">
        <button className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition-colors focus:outline-none">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-6 h-6 rounded-full object-cover border border-white/10 flex-shrink-0 transition-all duration-500"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[11px] font-medium text-sidebar-foreground/70 truncate">
              {member.name}
            </p>
            <p className="text-[10px] text-sidebar-foreground/35 truncate leading-tight">
              {member.statusMessage}
            </p>
          </div>
        </button>
      </TeamAvatarHoverCard>
    </div>
  );
}
