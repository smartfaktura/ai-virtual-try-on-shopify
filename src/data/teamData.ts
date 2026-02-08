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

export interface TeamMember {
  name: string;
  fullName: string;
  role: string;
  description: string;
  avatar: string;
  videoUrl: string;
  statusMessage: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Sophia',
    fullName: 'Sophia Chen',
    role: 'Creative Director',
    description: 'Oversees the visual direction of every shoot, ensuring brand consistency and stunning compositions.',
    avatar: avatarSophia,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/sophia-living.mp4',
    statusMessage: 'Setting up the lighting...',
  },
  {
    name: 'Amara',
    fullName: 'Amara Osei',
    role: 'Photographer',
    description: 'Captures the perfect angles and lighting setups that bring products to life in every scene.',
    avatar: avatarAmara,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/amara-living.mp4',
    statusMessage: 'Adjusting the exposure...',
  },
  {
    name: 'Luna',
    fullName: 'Luna Park',
    role: 'Retouch Specialist',
    description: 'Perfects every detail with precision retouching, color grading, and seamless compositing.',
    avatar: avatarLuna,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/luna-living.mp4',
    statusMessage: 'Retouching the highlights...',
  },
  {
    name: 'Kenji',
    fullName: 'Kenji Tanaka',
    role: 'Art Director',
    description: 'Crafts the creative vision and mood boards that guide each campaign from concept to completion.',
    avatar: avatarKenji,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/kenji-living.mp4',
    statusMessage: 'Reviewing the composition...',
  },
  {
    name: 'Yuki',
    fullName: 'Yuki Nakamura',
    role: 'Scene Designer',
    description: 'Designs immersive environments and backdrops that tell your brand story through every scene.',
    avatar: avatarYuki,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/yuki-living.mp4',
    statusMessage: 'Building the scene...',
  },
  {
    name: 'Omar',
    fullName: 'Omar Farouk',
    role: 'Stylist',
    description: 'Curates outfits, props, and styling details that make each shot feel authentic and on-brand.',
    avatar: avatarOmar,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/omar-living.mp4',
    statusMessage: 'Styling the set...',
  },
  {
    name: 'Sienna',
    fullName: 'Sienna Russo',
    role: 'Color Grader',
    description: 'Applies cinematic color grading that gives your visuals a premium, cohesive look across channels.',
    avatar: avatarSienna,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/sienna-living.mp4',
    statusMessage: 'Grading the colors...',
  },
  {
    name: 'Max',
    fullName: 'Max Lindqvist',
    role: 'Lighting Tech',
    description: 'Engineers the perfect lighting setup for every mood — from soft golden hour to crisp studio light.',
    avatar: avatarMax,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/max-living.mp4',
    statusMessage: 'Calibrating the lights...',
  },
  {
    name: 'Zara',
    fullName: 'Zara Ahmed',
    role: 'Brand Strategist',
    description: 'Aligns every visual output with your brand identity, audience, and marketing objectives.',
    avatar: avatarZara,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/zara-living.mp4',
    statusMessage: 'Aligning with brand guidelines...',
  },
  {
    name: 'Leo',
    fullName: 'Leo Martínez',
    role: 'Motion Designer',
    description: 'Creates smooth animations and dynamic video content that keeps your audience engaged.',
    avatar: avatarLeo,
    videoUrl: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/team-videos/leo-living.mp4',
    statusMessage: 'Animating the sequence...',
  },
];
