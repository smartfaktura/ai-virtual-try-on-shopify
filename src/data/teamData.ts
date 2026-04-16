import { getLandingAssetUrl } from '@/lib/landingAssets';

export interface TeamMember {
  name: string;
  fullName: string;
  role: string;
  description: string;
  avatar: string;
  videoUrl: string;
  statusMessage: string;
  statusMessages: string[];
  expertiseTag: string;
}

/** Pick a random status message from the member's rotating variants */
export function getRandomStatusMessage(member: TeamMember): string {
  const msgs = member.statusMessages;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

const VIDEO_BASE = getLandingAssetUrl('team-videos');

const avatarSophia = getLandingAssetUrl('team/avatar-sophia.jpg');
const avatarAmara = getLandingAssetUrl('team/avatar-amara.jpg');
const avatarLuna = getLandingAssetUrl('team/avatar-luna.jpg');
const avatarKenji = getLandingAssetUrl('team/avatar-kenji.jpg');
const avatarYuki = getLandingAssetUrl('team/avatar-yuki.jpg');
const avatarOmar = getLandingAssetUrl('team/avatar-omar.jpg');
const avatarSienna = getLandingAssetUrl('team/avatar-sienna.jpg');
const avatarMax = getLandingAssetUrl('team/avatar-max.jpg');
const avatarZara = getLandingAssetUrl('team/avatar-zara.jpg');
const avatarLeo = getLandingAssetUrl('team/avatar-leo.jpg');

function member(data: Omit<TeamMember, 'statusMessage'> & { statusMessages: string[] }): TeamMember {
  return { ...data, statusMessage: data.statusMessages[0] };
}

export const TEAM_MEMBERS: TeamMember[] = [
  member({
    name: 'Sophia',
    fullName: 'Sophia Chen',
    role: 'E-commerce Photographer',
    description: 'Crafts pixel-perfect e-commerce listings, hero shots, and catalog visuals with studio-grade lighting and composition.',
    avatar: avatarSophia,
    videoUrl: `${VIDEO_BASE}/849395850555686932.mp4`,
    statusMessages: [
      'Setting up the studio lighting...',
      'Framing the hero shot...',
      'Adjusting the key light...',
      'Composing the product angle...',
    ],
    expertiseTag: 'Lighting',
  }),
  member({
    name: 'Amara',
    fullName: 'Amara Osei',
    role: 'Lifestyle Scene Photographer',
    description: 'Places your products in real-world scenes so customers see them in context. Perfect for social media and storytelling.',
    avatar: avatarAmara,
    videoUrl: `${VIDEO_BASE}/849398236443574344.mp4`,
    statusMessages: [
      'Styling the lifestyle scene...',
      'Placing the product in context...',
      'Setting the natural mood...',
      'Composing the story shot...',
    ],
    expertiseTag: 'Composition',
  }),
  member({
    name: 'Luna',
    fullName: 'Luna Park',
    role: 'Retouch & Image Refinement Specialist',
    description: 'Handles color correction, background cleanup, and pixel-level refinement. Every image leaves polished and flawless.',
    avatar: avatarLuna,
    videoUrl: `${VIDEO_BASE}/849398707518439436.mp4`,
    statusMessages: [
      'Retouching the highlights...',
      'Cleaning up the background...',
      'Refining the color balance...',
      'Polishing the final pixels...',
    ],
    expertiseTag: 'Retouching',
  }),
  member({
    name: 'Kenji',
    fullName: 'Kenji Tanaka',
    role: 'Campaign Art Director',
    description: 'Designs seasonal campaigns, promo visuals, and lookbook layouts that feel cohesive across every channel.',
    avatar: avatarKenji,
    videoUrl: `${VIDEO_BASE}/849400657458757636.mp4`,
    statusMessages: [
      'Reviewing the art direction...',
      'Directing the visual layout...',
      'Refining the campaign look...',
      'Orchestrating the scene...',
    ],
    expertiseTag: 'Art Direction',
  }),
  member({
    name: 'Yuki',
    fullName: 'Yuki Nakamura',
    role: 'Performance Ad Creative Director',
    description: 'Builds ad-ready visuals optimized for Meta, Google, TikTok, and Amazon. Knows which formats drive clicks.',
    avatar: avatarYuki,
    videoUrl: `${VIDEO_BASE}/849398252540657664.mp4`,
    statusMessages: [
      'Optimizing for ad performance...',
      'Crafting the ad creative...',
      'Formatting for the platform...',
      'Building the conversion layout...',
    ],
    expertiseTag: 'Ad Creatives',
  }),
  member({
    name: 'Omar',
    fullName: 'Omar Farouk',
    role: 'Visual CRO Strategist',
    description: 'Analyzes composition, color psychology, and visual hierarchy to produce images that drive revenue.',
    avatar: avatarOmar,
    videoUrl: `${VIDEO_BASE}/849398684226822188.mp4`,
    statusMessages: [
      'Analyzing the visual hierarchy...',
      'Optimizing for conversions...',
      'Testing the color psychology...',
      'Tuning the visual impact...',
    ],
    expertiseTag: 'Conversion Design',
  }),
  member({
    name: 'Sienna',
    fullName: 'Sienna Russo',
    role: 'Brand Identity Guardian',
    description: 'Ensures every visual matches your brand DNA. Locks your look so every image feels unmistakably yours.',
    avatar: avatarSienna,
    videoUrl: `${VIDEO_BASE}/849398695958937689.mp4`,
    statusMessages: [
      'Checking brand consistency...',
      'Grading the color palette...',
      'Locking the brand look...',
      'Matching the brand DNA...',
    ],
    expertiseTag: 'Brand Styling',
  }),
  member({
    name: 'Max',
    fullName: 'Max Lindqvist',
    role: 'Platform Optimization Engineer',
    description: 'Auto-sizes and formats every visual for Shopify, Amazon, Meta, and Google. One click, every platform covered.',
    avatar: avatarMax,
    videoUrl: `${VIDEO_BASE}/849399340514426899.mp4`,
    statusMessages: [
      'Formatting for every platform...',
      'Optimizing the export settings...',
      'Resizing for marketplace specs...',
      'Preparing the multi-platform output...',
    ],
    expertiseTag: 'Platform Export',
  }),
  member({
    name: 'Zara',
    fullName: 'Zara Ahmed',
    role: 'Fashion & Apparel Stylist',
    description: 'Curates outfits, coordinates colors, and styles virtual try-on shoots so every garment looks its absolute best.',
    avatar: avatarZara,
    videoUrl: `${VIDEO_BASE}/849399354389184514.mp4`,
    statusMessages: [
      'Curating the outfit details...',
      'Styling the garment presentation...',
      'Coordinating the color palette...',
      'Perfecting the fashion frame...',
    ],
    expertiseTag: 'Fashion Styling',
  }),
  member({
    name: 'Leo',
    fullName: 'Leo Martínez',
    role: 'Scene & Set Designer',
    description: 'Builds backgrounds, props, and environments. From rustic tabletops to sleek studios, he sets the perfect scene.',
    avatar: avatarLeo,
    videoUrl: `${VIDEO_BASE}/849399365948022876.mp4`,
    statusMessages: [
      'Building the set design...',
      'Constructing the background...',
      'Arranging the props...',
      'Designing the environment...',
    ],
    expertiseTag: 'Scene Generation',
  }),
];
