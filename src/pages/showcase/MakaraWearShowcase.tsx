import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { LayoutGrid, Timer, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Img = { url: string; scene: string; category: 'Editorial' | 'Essentials' };

const IMAGES: Img[] = [
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d71ecd3f-1af2-4657-a0e2-2da0c31c81a2/0-0.jpg', scene: "Minimal Horizon Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/6b1e5de8-1a42-4c18-bd0e-8d883eddf049/0-0.jpg', scene: "Minimal Horizon Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/23ce33e4-32f1-4500-8bd1-33ac9bd71175/0-0.jpg', scene: "Shoreline Wave Contact Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5d3c5add-4404-4f53-97a1-90fab385f696/0-0.jpg', scene: "Shoreline Wave Contact Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1936eded-d0dd-473f-b48f-c6e8b5579228/0-0.jpg', scene: "Yacht Sunset Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c1ae9049-2851-479b-b8e0-14ed59fb9c4c/0-0.jpg', scene: "Wide Frame Coastal Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/edc7efe4-391f-4da8-a06b-0abe5790e69f/0-0.jpg', scene: "Yacht Bow Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d8500751-ab1b-4aaf-81b8-9d83784e1207/0-0.jpg', scene: "Yacht Deck Editorial Pose", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c6f452fe-25c5-4c33-abbb-cfe4b7c60f6b/0-0.jpg', scene: "Aesthetic Color Poolside Story", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8b5f65b3-32d0-41ce-b983-cf44dcd7dc95/0-0.jpg', scene: "Yacht Sunset Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/95f49643-5586-44f8-aa98-47c4459aac42/0-0.jpg', scene: "Aesthetic Color Resort Editorial Hero", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/de8ac46f-540e-4c6c-a7c5-e2ebb1a9b965/0-0.jpg', scene: "Aesthetic Color Poolside Story", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d4b3267c-30d5-45ec-bee9-f537d9daca56/0-0.jpg', scene: "Aesthetic Color Sunset Resort Mood", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a11e65bd-3f24-470f-a1c8-4e9236ca4d14/0-0.jpg', scene: "Aesthetic Color Resort Editorial Hero", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/e74c66d8-edab-4c63-a2a6-596565dffc47/0-0.jpg', scene: "Aesthetic Color Sunset Resort Mood", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2de69ad1-53f3-426d-ab42-821fd91846b0/0-0.jpg', scene: "City Heat Rooftop Escape", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d3ffea2c-3af5-4bc7-8a62-98f1ef3b17d9/0-0.jpg', scene: "Beach Bag and Essentials Moment", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cf9b4b45-ad1c-4b97-8b74-d0cb97f0f18b/0-0.jpg', scene: "City Heat Rooftop Escape", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3bd61925-70a7-4500-829b-81d3926938d2/0-0.jpg', scene: "Beach Bag and Essentials Moment", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5f2b8d94-3378-48f0-8493-558bb777301e/0-0.jpg', scene: "Coastal Camera Moment", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5c5af193-0358-46ae-bbea-01478a26ab0b/0-0.jpg', scene: "Color-Washed Resort Wall", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8ce6687b-9369-438d-9fda-4bdf5078afbc/0-0.jpg', scene: "Coastal Stillness Swim Frame", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cca690b2-9570-42ad-a37c-12c4d6f81983/0-0.jpg', scene: "Coastal Camera Moment", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/00ae318d-0bdb-4242-a053-84f25ff3c44b/0-0.jpg', scene: "Color-Washed Resort Wall", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0838ca15-6d42-4ea9-8273-e65a2f009825/0-0.jpg', scene: "Jungle Drive Editorial Heat", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5d757d39-7364-4294-a376-69f177e08afd/0-0.jpg', scene: "Floating Pool Product Shot", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/ee770361-20e0-4178-bc0c-b1d4931d6a18/0-0.jpg', scene: "Ghost Mannequin Shot", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/725e079a-2ca9-4a00-9085-dd688f4faecb/0-0.jpg', scene: "Movement Shot", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5e1c25e8-be94-4123-8e55-bfb4289d9248/0-0.jpg', scene: "Jungle Drive Editorial Heat", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/49bef400-223b-48a0-87e7-6cbebe6f4240/0-0.jpg', scene: "On-Model Back", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d415fc29-93ee-4fc3-a94f-51df37d9dceb/0-0.jpg', scene: "On-Model Editorial", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/39d744ef-58ee-4eb2-b86b-84d0dca1a8e6/0-0.jpg', scene: "Movement Shot", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/438c7f3b-55fc-4856-97a0-e444dbc20894/0-0.jpg', scene: "On-Model Front", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/6e8545a4-0cf5-4913-92fd-ff1222700fec/0-0.jpg', scene: "On-Model Back", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/533ba404-a05e-4520-936b-ace28a6c2088/0-0.jpg', scene: "On-Model Lifestyle", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/4f1daf0b-93eb-4a9c-a1dc-2fe07f4764fd/0-0.jpg', scene: "On-Model Editorial", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/94f378de-d931-42f0-92b7-ca008c18b266/0-0.jpg', scene: "Palm Shadow Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/647a2759-0840-4d1d-b44d-84a7fa03e16b/0-0.jpg', scene: "On-Model Front", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/67db7768-8a2a-40b1-b44c-f02b63c43559/0-0.jpg', scene: "Poolside Friend-Shot Candid", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/89bfcfd5-6888-4d9c-956f-a1a98402e1f3/0-0.jpg', scene: "On-Model Lifestyle", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/12110fbf-dfc1-454b-bf1e-44c314a85297/0-0.jpg', scene: "Poolside Standing Hero", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a3de5f12-91c5-4fd8-99bb-7be32f5beb96/0-0.jpg', scene: "Palm Shadow Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c0ae3b23-38f4-455a-a624-574303ef8d72/0-0.jpg', scene: "Resort Staircase Pose", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/68b8827a-a28f-4496-bd3b-6eb5b6df2bb8/0-0.jpg', scene: "Poolside Friend-Shot Candid", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/602ac2fd-0817-4d47-a0a7-b163d8615fdd/0-0.jpg', scene: "Poolside Standing Hero", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/55054be4-62c7-4b87-b8e8-91679539f1f4/0-0.jpg', scene: "Seated Balcony Resort Portrait", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/4486c2d0-a806-467a-aebb-533afa5215f9/0-0.jpg', scene: "Resort Staircase Pose", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/dc3ae9a6-6254-4f3a-8367-301f6a35fecb/0-0.jpg', scene: "Shoreline Adjust Swim Moment", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/110d76e4-4959-4799-a727-6482505deaac/0-0.jpg', scene: "Seated Balcony Resort Portrait", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/784d8f33-a720-4c6a-a651-c890f16121c7/0-0.jpg', scene: "Shoreline Adjust Swim Moment", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8c313cc2-e1b2-4584-99b0-dd38900ca492/0-0.jpg', scene: "Sun Lounger Resort Pose", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/06070e09-6b76-482d-968b-a4b06900d52c/0-0.jpg', scene: "Sunbathing Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/73a20f8b-1822-4632-b95e-2f2cbe88c4b8/0-0.jpg', scene: "Sunlit Arch Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0fad648c-f470-4cfe-a246-94b2fb1ef1fb/0-0.jpg', scene: "Sun Lounger Resort Pose", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/dd1e6752-fce7-4b35-8837-50042ab0de7f/0-0.jpg', scene: "Sunstone Wall Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5c2982e6-f101-4f7c-b205-b4b124a2fdfa/0-0.jpg', scene: "Sun-Dried Swimwear", category: 'Essentials' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/47995fd4-f806-4f63-b02d-735365e25b07/0-0.jpg', scene: "Sunbathing Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/45c73269-455b-44cc-8fff-1f9246155fe2/0-0.jpg', scene: "Tropical Poolside Stillness Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/337504cf-abf8-4bda-9da1-a8e5e4a73295/0-0.jpg', scene: "Sunlit Arch Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/9594e728-2948-424b-947b-7f8d448c6fca/0-0.jpg', scene: "Walking Along Pool Edge", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a5616845-cf30-4321-8450-d31bc5d8c8e6/0-0.jpg', scene: "Sunstone Wall Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/935d4e83-ccbc-4e71-b57e-470df914a1ae/0-0.jpg', scene: "Wide Frame Coastal Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/160d4199-5e3a-4546-8653-96ee855e5b01/0-0.jpg', scene: "Yacht Bow Swim Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/e1dd1425-4268-4a9e-b1ca-76837117e246/0-0.jpg', scene: "Tropical Poolside Stillness Editorial", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/e308f3f0-9b76-44b4-8e7b-e817ecfd92c7/0-0.jpg', scene: "Yacht Deck Editorial Pose", category: 'Editorial' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/556a42ab-69ab-4555-a214-ca2679ef8d8c/0-0.jpg', scene: "Walking Along Pool Edge", category: 'Editorial' },
];

const STATS = [
  { icon: LayoutGrid, value: '66', label: 'Visuals' },
  { icon: Timer, value: '~3 min', label: 'Made in' },
];

export default function MakaraWearShowcase() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="A Sample Visual Library for MAKARA WEAR | VOVV.AI"
        description="A swimwear editorial drop built for MAKARA WEAR — generated by VOVV.AI from a single product photo."
        noindex
      />
      <LandingNav />

      <section className="pt-28 pb-14 lg:pt-40 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-5">
            Brand example · MAKARA WEAR
          </p>
          <h1 className="text-[#0f172a] text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight mb-5">
            This is what VOVV.AI makes from one product photo
          </h1>
          <p className="text-[#64748b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            A complete swim campaign — 66 visuals, ready for web, social, and lookbook
          </p>
        </div>
      </section>

      <section className="pb-12 lg:pb-20">
        <div className="max-w-xl mx-auto px-6">
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-6 px-3">
                <s.icon size={20} strokeWidth={1.75} className="text-[#0f172a]/70" />
                <span className="text-[#0f172a] text-2xl sm:text-3xl font-semibold tracking-tight">{s.value}</span>
                <span className="text-[#94a3b8] text-xs sm:text-sm text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox(i)}
                className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20"
              >
                <img
                  src={getOptimizedUrl(img.url, { quality: 50 })}
                  alt={`${img.scene} — ${img.category}`}
                  loading={i < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium leading-tight">{img.scene}</p>
                  <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">{img.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>


      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors z-10">
            <X size={24} />
          </button>
          <img
            src={getOptimizedUrl(IMAGES[lightbox].url, { quality: 80 })}
            alt={IMAGES[lightbox].scene}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white text-sm font-medium">{IMAGES[lightbox].scene}</p>
            <p className="text-white/50 text-xs mt-0.5">{IMAGES[lightbox].category}</p>
          </div>
        </div>
      )}

      <section className="py-16 lg:py-28 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">Want this for your brand?</h2>
          <p className="text-[#94a3b8] text-base sm:text-lg leading-relaxed mb-10">Send one product photo. We'll build the rest</p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link to="/auth" className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-white text-[#0f172a] text-base font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto">
              Try free now
              <ArrowRight size={16} />
            </Link>
            <Link to="/discover" className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-white/20 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto">
              Explore more examples
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
