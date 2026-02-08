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
import avatarLuna from '@/assets/team/avatar-luna.jpg';
import avatarMax from '@/assets/team/avatar-max.jpg';
import avatarZara from '@/assets/team/avatar-zara.jpg';
import avatarLeo from '@/assets/team/avatar-leo.jpg';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  avatar: string;
  videoUrl?: string;
}

const VIDEO_BASE = 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/generated-videos/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';

const TEAM: TeamMember[] = [
  {
    name: 'Sophia',
    role: 'Product Photographer',
    avatar: avatarSophia,
    videoUrl: `${VIDEO_BASE}/849395850555686932.mp4`,
    description:
      'Crafts pixel-perfect e-commerce listings, hero shots, and catalog visuals with studio-grade lighting and composition.',
  },
  {
    name: 'Amara',
    role: 'Lifestyle Photographer',
    avatar: avatarAmara,
    description:
      'Places your products in real-world scenes so customers see them in context. Perfect for social media and storytelling.',
  },
  {
    name: 'Kenji',
    role: 'Campaign Art Director',
    avatar: avatarKenji,
    description:
      'Designs seasonal campaigns, promo visuals, and lookbook layouts that feel cohesive across every channel.',
  },
  {
    name: 'Yuki',
    role: 'Ad Creative Specialist',
    avatar: avatarYuki,
    description:
      'Builds ad-ready visuals optimized for Meta, Google, TikTok, and Amazon. Knows which formats drive clicks.',
  },
  {
    name: 'Omar',
    role: 'CRO Visual Optimizer',
    avatar: avatarOmar,
    description:
      'Analyzes composition, color psychology, and visual hierarchy to produce images that drive revenue.',
  },
  {
    name: 'Sienna',
    role: 'Brand Consistency Manager',
    avatar: avatarSienna,
    description:
      'Ensures every visual matches your brand DNA. Locks your look so every image feels unmistakably yours.',
  },
  {
    name: 'Luna',
    role: 'Retouch Specialist',
    avatar: avatarLuna,
    description:
      'Handles color correction, background cleanup, and pixel-level refinement. Every image leaves polished and flawless.',
  },
  {
    name: 'Max',
    role: 'Export & Format Engineer',
    avatar: avatarMax,
    description:
      'Auto-sizes and formats every visual for Shopify, Amazon, Meta, and Google. One click, every platform covered.',
  },
  {
    name: 'Zara',
    role: 'Fashion Stylist',
    avatar: avatarZara,
    description:
      'Curates outfits, coordinates colors, and styles virtual try-on shoots so every garment looks its absolute best.',
  },
  {
    name: 'Leo',
    role: 'Scene & Set Designer',
    avatar: avatarLeo,
    description:
      'Builds backgrounds, props, and environments. From rustic tabletops to sleek studios, he sets the perfect scene.',
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
    const cardWidth = el.querySelector<HTMLElement>('[data-team-card]')?.offsetWidth ?? 280;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth - 20 : cardWidth + 20,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 lg:mb-20">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            Your AI Studio Team
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            10 AI Professionals. Zero Overhead.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A full creative team of photographers, art directors, stylists, and brand specialists
            — working together on every visual you create. Instantly.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={() => scroll('left')}
            className={`absolute -left-2 sm:-left-5 top-[35%] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'opacity-100 hover:bg-accent hover:shadow-lg'
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`absolute -right-2 sm:-right-5 top-[35%] -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center transition-all ${
              canScrollRight
                ? 'opacity-100 hover:bg-accent hover:shadow-lg'
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Cards strip */}
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin"
            style={{ scrollbarColor: 'hsl(var(--border)) transparent' }}
          >
            {TEAM.map((member) => (
              <div
                key={member.name}
                data-team-card
                className="flex-shrink-0 w-[240px] sm:w-[270px] lg:w-[300px] snap-start group"
              >
                {/* Character image card */}
                <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-card border border-border shadow-sm group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                  {member.videoUrl ? (
                    <video
                      src={member.videoUrl}
                      poster={member.avatar}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="none"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 px-1">
                  <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm font-medium text-primary mt-0.5">{member.role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Button size="lg" className="gap-2" asChild>
            <a href="/auth">
              Meet Your Team <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
