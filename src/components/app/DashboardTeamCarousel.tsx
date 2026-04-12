import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

export function DashboardTeamCarousel() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Your AI Studio Team</h2>
        <p className="text-base text-muted-foreground mt-1.5">10 specialists working on every visual you create</p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="flex-shrink-0 w-[90px] sm:w-[110px] snap-start flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-border group-hover:border-accent-foreground/40 transition-all duration-300 shadow-sm">
                <img
                  src={getOptimizedUrl(member.avatar, { quality: 60 })}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              </div>
              <p className="text-sm font-semibold text-foreground mt-2.5 leading-tight">{member.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
