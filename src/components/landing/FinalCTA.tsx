import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { TEAM_MEMBERS } from '@/data/teamData';
import { TeamAvatarHoverCard } from '@/components/landing/TeamAvatarHoverCard';
import { getOptimizedUrl } from '@/lib/imageOptimization';

export function FinalCTA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <section className="py-16 lg:py-32 bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#475569] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#64748b] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-4">
          Get started
        </p>
        <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">
          Stop planning photoshoots.
          <br />
          Start receiving visuals.
        </h2>
        <p className="text-[#9ca3af] text-base sm:text-lg leading-relaxed mb-10">
          Upload your products, choose your Visual Types, and let your studio team deliver fresh visuals every month.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate(user ? '/app' : '/auth')}
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#1a1a2e] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto"
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <Link
            to="/discover"
            className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
          >
            See real examples
          </Link>
        </div>

        {/* Team Avatars */}
        <div className="flex flex-col items-center gap-3 mt-12">
          <div className="flex items-center justify-center">
            {TEAM_MEMBERS.map((member, i) => (
              <TeamAvatarHoverCard key={member.name} member={member} side="bottom">
                <ShimmerImage
                  src={getOptimizedUrl(member.avatar, { quality: 60 })}
                  alt={member.name}
                  className="w-10 h-10 rounded-full border-2 border-[#1a1a2e] object-cover transition-transform duration-200 hover:scale-110 hover:z-10 relative cursor-pointer"
                  wrapperClassName="w-10 h-10 rounded-full"
                  wrapperStyle={{ marginLeft: i === 0 ? 0 : '-0.6rem' }}
                  aspectRatio="1/1"
                  loading="lazy"
                />
              </TeamAvatarHoverCard>
            ))}
          </div>
          <p className="text-[#9ca3af] text-sm">Your studio team is ready</p>
        </div>
      </div>
    </section>
  );
}
