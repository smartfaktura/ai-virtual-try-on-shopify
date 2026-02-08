import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

import avatarAmara from '@/assets/team/avatar-amara.jpg';
import avatarKenji from '@/assets/team/avatar-kenji.jpg';
import avatarLeo from '@/assets/team/avatar-leo.jpg';
import avatarLuna from '@/assets/team/avatar-luna.jpg';
import avatarMax from '@/assets/team/avatar-max.jpg';
import avatarOmar from '@/assets/team/avatar-omar.jpg';
import avatarSienna from '@/assets/team/avatar-sienna.jpg';
import avatarSophia from '@/assets/team/avatar-sophia.jpg';
import avatarYuki from '@/assets/team/avatar-yuki.jpg';
import avatarZara from '@/assets/team/avatar-zara.jpg';

const TEAM_AVATARS = [
  { name: 'Sophia', src: avatarSophia },
  { name: 'Kenji', src: avatarKenji },
  { name: 'Zara', src: avatarZara },
  { name: 'Leo', src: avatarLeo },
  { name: 'Amara', src: avatarAmara },
  { name: 'Luna', src: avatarLuna },
  { name: 'Max', src: avatarMax },
  { name: 'Omar', src: avatarOmar },
  { name: 'Sienna', src: avatarSienna },
  { name: 'Yuki', src: avatarYuki },
];

export function FinalCTA() {
  const navigate = useNavigate();
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-primary/10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/8 rounded-full blur-3xl opacity-40" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Start for free today
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
          Stop Planning Photoshoots.
          <br />
          Start Receiving Visuals.
        </h2>

        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Upload your products, choose your workflows, and let your studio team deliver fresh visuals every month.
        </p>

        <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25" onClick={() => navigate('/auth')}>
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            Free to try
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            No prompts
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            Cancel anytime
          </div>
        </div>

        {/* Team Avatars */}
        <div className="flex flex-col items-center gap-3 mt-10">
          <div className="flex items-center justify-center">
            {TEAM_AVATARS.map((member, i) => (
              <img
                key={member.name}
                src={member.src}
                alt={member.name}
                className="w-10 h-10 rounded-full border-2 border-background object-cover transition-transform duration-200 hover:scale-110 hover:z-10 relative"
                style={{ marginLeft: i === 0 ? 0 : '-0.6rem' }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Your studio team is ready</p>
        </div>
      </div>
    </section>
  );
}
