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

const VIDEO_BASE = 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/generated-videos/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Sophia',
    fullName: 'Sophia Chen',
    role: 'Product Photographer',
    description: 'Crafts pixel-perfect e-commerce listings, hero shots, and catalog visuals with studio-grade lighting and composition.',
    avatar: avatarSophia,
    videoUrl: `${VIDEO_BASE}/849395850555686932.mp4`,
    statusMessage: 'Setting up the lighting...',
  },
  {
    name: 'Amara',
    fullName: 'Amara Osei',
    role: 'Lifestyle Photographer',
    description: 'Places your products in real-world scenes so customers see them in context. Perfect for social media and storytelling.',
    avatar: avatarAmara,
    videoUrl: `${VIDEO_BASE}/849398236443574344.mp4`,
    statusMessage: 'Adjusting the exposure...',
  },
  {
    name: 'Luna',
    fullName: 'Luna Park',
    role: 'Retouch Specialist',
    description: 'Handles color correction, background cleanup, and pixel-level refinement. Every image leaves polished and flawless.',
    avatar: avatarLuna,
    videoUrl: `${VIDEO_BASE}/849398707518439436.mp4`,
    statusMessage: 'Retouching the highlights...',
  },
  {
    name: 'Kenji',
    fullName: 'Kenji Tanaka',
    role: 'Campaign Art Director',
    description: 'Designs seasonal campaigns, promo visuals, and lookbook layouts that feel cohesive across every channel.',
    avatar: avatarKenji,
    videoUrl: `${VIDEO_BASE}/849400657458757636.mp4`,
    statusMessage: 'Reviewing the composition...',
  },
  {
    name: 'Yuki',
    fullName: 'Yuki Nakamura',
    role: 'Ad Creative Specialist',
    description: 'Builds ad-ready visuals optimized for Meta, Google, TikTok, and Amazon. Knows which formats drive clicks.',
    avatar: avatarYuki,
    videoUrl: `${VIDEO_BASE}/849398252540657664.mp4`,
    statusMessage: 'Building the scene...',
  },
  {
    name: 'Omar',
    fullName: 'Omar Farouk',
    role: 'CRO Visual Optimizer',
    description: 'Analyzes composition, color psychology, and visual hierarchy to produce images that drive revenue.',
    avatar: avatarOmar,
    videoUrl: `${VIDEO_BASE}/849398684226822188.mp4`,
    statusMessage: 'Styling the set...',
  },
  {
    name: 'Sienna',
    fullName: 'Sienna Russo',
    role: 'Brand Consistency Manager',
    description: 'Ensures every visual matches your brand DNA. Locks your look so every image feels unmistakably yours.',
    avatar: avatarSienna,
    videoUrl: `${VIDEO_BASE}/849398695958937689.mp4`,
    statusMessage: 'Grading the colors...',
  },
  {
    name: 'Max',
    fullName: 'Max Lindqvist',
    role: 'Export & Format Engineer',
    description: 'Auto-sizes and formats every visual for Shopify, Amazon, Meta, and Google. One click, every platform covered.',
    avatar: avatarMax,
    videoUrl: `${VIDEO_BASE}/849399340514426899.mp4`,
    statusMessage: 'Calibrating the lights...',
  },
  {
    name: 'Zara',
    fullName: 'Zara Ahmed',
    role: 'Fashion Stylist',
    description: 'Curates outfits, coordinates colors, and styles virtual try-on shoots so every garment looks its absolute best.',
    avatar: avatarZara,
    videoUrl: `${VIDEO_BASE}/849399354389184514.mp4`,
    statusMessage: 'Aligning with brand guidelines...',
  },
  {
    name: 'Leo',
    fullName: 'Leo Martínez',
    role: 'Scene & Set Designer',
    description: 'Builds backgrounds, props, and environments. From rustic tabletops to sleek studios, he sets the perfect scene.',
    avatar: avatarLeo,
    videoUrl: `${VIDEO_BASE}/849399365948022876.mp4`,
    statusMessage: 'Animating the sequence...',
  },
];
