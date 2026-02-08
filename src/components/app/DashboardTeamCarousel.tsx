import avatarSophia from '@/assets/team/avatar-sophia.jpg';
import avatarAmara from '@/assets/team/avatar-amara.jpg';
import avatarKenji from '@/assets/team/avatar-kenji.jpg';
import avatarYuki from '@/assets/team/avatar-yuki.jpg';
import avatarOmar from '@/assets/team/avatar-omar.jpg';
import avatarSienna from '@/assets/team/avatar-sienna.jpg';
import avatarLuna from '@/assets/team/avatar-luna.jpg';
import avatarMax from '@/assets/team/avatar-max.jpg';
import avatarZara from '@/assets/team/avatar-zara.jpg';
import avatarLeo from '@/assets/team/avatar-leo.jpg';

const SOPHIA_VIDEO_URL = 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/generated-videos/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/849393075369279549.mp4';

const TEAM = [
  { name: 'Sophia', role: 'Product Photographer', avatar: avatarSophia, videoUrl: SOPHIA_VIDEO_URL },
  { name: 'Amara', role: 'Lifestyle Photographer', avatar: avatarAmara },
  { name: 'Kenji', role: 'Campaign Art Director', avatar: avatarKenji },
  { name: 'Yuki', role: 'Ad Creative Specialist', avatar: avatarYuki },
  { name: 'Omar', role: 'CRO Visual Optimizer', avatar: avatarOmar },
  { name: 'Sienna', role: 'Brand Consistency Manager', avatar: avatarSienna },
  { name: 'Luna', role: 'Retouch Specialist', avatar: avatarLuna },
  { name: 'Max', role: 'Export & Format Engineer', avatar: avatarMax },
  { name: 'Zara', role: 'Fashion Stylist', avatar: avatarZara },
  { name: 'Leo', role: 'Scene & Set Designer', avatar: avatarLeo },
];

export function DashboardTeamCarousel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Your AI Studio Team</h2>
        <p className="text-sm text-muted-foreground mt-1">10 specialists working on every visual you create.</p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling strip — no scrollbar */}
        <div
          className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex-shrink-0 w-[100px] sm:w-[120px] snap-start flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-border group-hover:border-accent-foreground/40 transition-all duration-300 shadow-sm">
                {'videoUrl' in member && member.videoUrl ? (
                  <video
                    src={member.videoUrl}
                    poster={member.avatar}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
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
