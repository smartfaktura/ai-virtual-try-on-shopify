import { TEAM_MEMBERS } from '@/data/teamData';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const STUDIO_TEAM = [
  TEAM_MEMBERS.find(m => m.name === 'Sophia')!,
  TEAM_MEMBERS.find(m => m.name === 'Zara')!,
  TEAM_MEMBERS.find(m => m.name === 'Kenji')!,
];

export function CatalogTeamStrip() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {STUDIO_TEAM.map(member => (
            <Tooltip key={member.name}>
              <TooltipTrigger asChild>
                <Avatar className="w-7 h-7 border-2 border-card cursor-default">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-[9px]">{member.name[0]}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="space-y-0.5">
                <p className="text-xs font-semibold">{member.fullName}</p>
                <p className="text-[10px] text-muted-foreground">{member.role}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-foreground leading-tight">Your Studio Team</span>
          <span className="text-[9px] text-muted-foreground leading-tight">Sophia · Zara · Kenji</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
