import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 3D character avatars
import avatarSophia from '@/assets/team/avatar-sophia.jpg';
import avatarAmara from '@/assets/team/avatar-amara.jpg';
import avatarKenji from '@/assets/team/avatar-kenji.jpg';
import avatarYuki from '@/assets/team/avatar-yuki.jpg';
import avatarOmar from '@/assets/team/avatar-omar.jpg';
import avatarSienna from '@/assets/team/avatar-sienna.jpg';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  avatar: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Sophia',
    role: 'Product Photographer',
    avatar: avatarSophia,
    description:
      'Your go-to for clean, high-converting product imagery. Sophia crafts pixel-perfect e-commerce listings, hero shots, and catalog visuals with studio-grade lighting and composition.',
  },
  {
    name: 'Amara',
    role: 'Lifestyle Photographer',
    avatar: avatarAmara,
    description:
      'Amara places your products in real-world scenes — coffee shops, parks, living rooms — so customers see them in context. Perfect for social media, blogs, and brand storytelling.',
  },
  {
    name: 'Kenji',
    role: 'Campaign Art Director',
    avatar: avatarKenji,
    description:
      'Kenji designs seasonal campaigns, promo visuals, and lookbook layouts. He turns your brand guidelines into scroll-stopping creative that feels cohesive across every channel.',
  },
  {
    name: 'Yuki',
    role: 'Ad Creative Specialist',
    avatar: avatarYuki,
    description:
      'Yuki builds ad-ready visuals optimized for Meta, Google, TikTok, and Amazon. She knows which formats, ratios, and compositions drive clicks and conversions.',
  },
  {
    name: 'Omar',
    role: 'CRO Visual Optimizer',
    avatar: avatarOmar,
    description:
      "Omar focuses on what converts. He analyzes composition, color psychology, and visual hierarchy to produce images that don't just look great — they drive revenue.",
  },
  {
    name: 'Sienna',
    role: 'Brand Consistency Manager',
    avatar: avatarSienna,
    description:
      'Sienna ensures every visual matches your brand DNA. From color palettes to typography overlays, she locks your look so every image feels unmistakably yours.',
  },
];

export function StudioTeamSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>('[data-team-card]')?.offsetWidth ?? 400;
    el.scrollBy({ left: direction === 'left' ? -cardWidth - 24 : cardWidth + 24, behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 sm:py-28 bg-[hsl(212,14%,10%)] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 lg:mb-20">
          <Badge className="mb-4 bg-white/10 text-white/80 border-white/10 text-xs tracking-wide uppercase hover:bg-white/15">
            Your AI Studio Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            AI Professionals That Never Sleep
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            A full creative team of photographers, art directors, and brand specialists — 
            working together on every visual you create. Instantly.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={() => scroll('left')}
            className={`absolute left-0 top-1/3 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-opacity ${
              canScrollLeft ? 'opacity-100 hover:bg-white/20' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`absolute right-0 top-1/3 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-opacity ${
              canScrollRight ? 'opacity-100 hover:bg-white/20' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Cards strip */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-6 overflow-x-auto pb-4 px-2 -mx-2 snap-x snap-mandatory scrollbar-thin"
            style={{ scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
          >
            {TEAM.map((member) => (
              <div
                key={member.name}
                data-team-card
                className="flex-shrink-0 w-[300px] sm:w-[340px] lg:w-[380px] snap-start"
              >
                {/* Character image */}
                <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-white/5 mb-5">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                <p className="text-sm font-medium text-white/50 mt-1 mb-3">{member.role}</p>
                <p className="text-sm text-white/60 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Button
            size="lg"
            className="gap-2 bg-white text-[hsl(212,14%,10%)] hover:bg-white/90"
            asChild
          >
            <a href="/auth">
              Meet Your Team <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
