import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { LayoutGrid, Timer, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type Img = { url: string; scene: string; model: string };

const IMAGES: Img[] = [
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/db738bdb-6c57-4c5e-a245-f8efbb5c85fc/0-0.jpg', scene: 'Natural Light Backdrop', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/830712ec-f4a5-4dbc-8b29-4b4d27cc55cb/0-0.jpg', scene: 'Front View', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/f0f71335-aae5-414f-85c4-4966bce30a1f/0-0.jpg', scene: 'Warm Neutral Studio', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2d54402e-c92e-4486-85b0-188fc4173038/0-0.jpg', scene: 'Amber Glow Studio', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8d10076d-b85c-434c-85ab-a1a54d7a84c4/0-0.jpg', scene: 'Dynamic Bloom Studio', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/89523093-1569-48ba-8b16-5fbd1facc519/0-0.jpg', scene: 'Frozen Aura', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/40c9cd08-ca35-4919-b1b9-d87e5cf69eea/0-0.jpg', scene: 'Cozy Morning Skincare', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/7a350b52-f324-46c5-ba3b-1e1ad16f95a4/0-0.jpg', scene: 'In-Hand Lifestyle', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0d402fea-bcac-4b8a-bfb0-7c7d32db1686/0-0.jpg', scene: 'Brutalist Concrete', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3f659838-a05a-42c9-b15b-c96db061c04c/0-0.jpg', scene: 'In-Hand Lifestyle', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8d015f4c-bc22-433c-973a-dde0c3583a9c/0-0.jpg', scene: 'Sky Product Portrait', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/44976175-8123-4735-954e-edebe68d6674/0-0.jpg', scene: 'Sunny Shadows', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/07a16792-ab06-4462-bca6-7848969a9c76/0-0.jpg', scene: 'Red Gradient Embrace', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1d97b2fc-e773-43ab-ba90-60db76360273/0-0.jpg', scene: 'Aquatic Reflection', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/e9a7df3d-8b7d-4c93-9553-37ac588e067b/0-0.jpg', scene: 'Volcanic Sunset', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3e86a572-075d-4be8-9ae2-a12f27cc9bf6/0-0.jpg', scene: 'Coastal Cliff', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/ae74f74a-f8b5-42d8-9481-23ccb6e922af/0-0.jpg', scene: 'Frozen Surface Product', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d02ba5cf-0942-4be4-9c68-42a61f23e52d/0-0.jpg', scene: 'Natural Woodscape', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3b58c1c7-5860-497a-b312-62f79f32658a/0-0.jpg', scene: 'Dynamic Water Splash', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c1e15a7d-887d-47df-8fba-a6d60107808e/0-0.jpg', scene: 'Gradient Backdrop Elegance', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a7275e6e-66d4-49ed-aa3f-1ff25b343b92/0-0.jpg', scene: 'Reflective Floral Display', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1699f1e4-0c3c-4c50-9f69-68449ae9657a/0-0.jpg', scene: 'Clean Profile Wellness Hold', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/09bfb94b-a92f-47f6-9c03-0b2f0d8de3e1/0-0.jpg', scene: 'Earthy Glow Stage', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5817c279-1ff7-4a04-958c-ba58c7897f72/0-0.jpg', scene: 'Botanical Oasis', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/f00ff32b-b67d-4cc7-9063-a36774dad19f/0-0.jpg', scene: 'Earthy Minimal Shadows', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/9dc707c0-3e48-4e93-b2f2-906dbc224ac3/0-0.jpg', scene: 'Bathroom Wellness Routine', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/4ddaf1b8-18f8-4b1f-9607-da9fe3280fd0/0-0.jpg', scene: 'Sky Product Portrait', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/faed02b0-2526-4f1d-9f1d-72c69931310b/0-0.jpg', scene: 'Sunlit Ritual Hand Hold', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/da1d6907-c869-4367-8c43-368eba20e341/0-0.jpg', scene: 'Joyful Active Beauty Hold', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/53c167e6-19c9-4a4f-a049-1dc6165eb545/0-0.jpg', scene: 'Clean Profile Wellness Hold', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0fb85605-b634-424c-808b-3b0bd2866622/0-0.jpg', scene: 'Bathroom Wellness Routine', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/26074970-fe47-4ea9-9568-c3c7db62b026/0-0.jpg', scene: 'Shelf Wellness Portrait', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3ce4a345-fada-49a2-a1cf-87a632e947b6/0-0.jpg', scene: 'Macro Wellness Detail Still', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/b14332c9-4631-4aca-ac53-ba20439f8bd0/0-0.jpg', scene: 'Earthy Botanicals Plinth', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/2d49914e-02ba-4964-a952-d091edf9e5ef/0-0.jpg', scene: 'Wellness Tray Ritual', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/67c30a9a-d7f9-483c-a9aa-463352ee9eb8/0-0.jpg', scene: 'Sinkside Wellness Composition', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/825cae74-bfe1-4f0b-b0b1-b6bb913e40e3/0-0.jpg', scene: 'Handheld Daily Wellness Moment', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/78de8eee-a04f-4351-9772-ecc0349b58f8/0-0.jpg', scene: 'Travel or On-the-Go Wellness', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/249e6375-5e94-4d51-abb2-740266d38b41/0-0.jpg', scene: 'Morning Counter Ritual', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/ebc8d8e8-1f49-4d1e-98c8-c2a0566f16d4/0-0.jpg', scene: 'Glossed Wellness Close-Up', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d5fb583a-9963-45d8-8105-07239cc1476f/0-0.jpg', scene: 'Glossed Wellness Close-Up', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/b90df0ab-b788-4df7-9039-980df79a7100/0-0.jpg', scene: 'Powder and Scoop Still', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5f2ee1dd-eddf-4b14-9dcc-816226fa5f05/0-0.jpg', scene: 'Workday Wellness Break', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1c6197ef-7ce1-4da9-9d92-68d8ad21c00c/0-0.jpg', scene: 'Clean Product and Water Glass Still', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/0c06e918-5e41-42a3-af3a-c0fa9d9e6a56/0-0.jpg', scene: 'Kitchen Counter Daily Use', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a9e53bf7-cd49-45fa-a071-b82d6db5c901/0-0.jpg', scene: 'Hand and Water Ritual', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/739e7a79-42bf-4f9f-a6cd-da71f9cf9f3d/0-0.jpg', scene: 'Joyful Active Beauty Hold', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/ff026e28-b7b4-4091-bdcc-38a31766107c/0-0.jpg', scene: 'Hand and Water Ritual', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/6c21bd7b-c33c-45d0-a335-220a0de219d8/0-0.jpg', scene: 'Capsule Dish and Tray Composition', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/a6e5d029-6179-40cb-88cf-5134d24bca7a/0-0.jpg', scene: 'Dose Preparation Editorial', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/aacf0ead-6da7-4d46-bb43-5bf657a63f69/0-0.jpg', scene: 'Ingredient Pairing Surface Story', model: '' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/fc2d08ba-ea68-440c-947a-13409513f059/0-0.jpg', scene: 'Dose Preparation Editorial', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/6a25e1bf-a453-48bc-aebb-ef72a20699ec/0-0.jpg', scene: 'Handheld Daily Wellness Moment', model: 'Freya' },
];

type UgcImg = { url: string; model: string };

const UGC_IMAGES: UgcImg[] = [
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3e86fc6c-3474-4ed2-ae14-8e0f0fe0b3a3/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/b9065fbd-a84f-40b7-9a80-d2c6dc14b309/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/b47d5498-443c-4499-a7ec-8c923252f93d/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/937153f7-d50c-4d95-9c3c-0bb1e29c93a6/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/f520b610-910b-4301-ba49-062e13977dba/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/3e7a316e-c9f5-41f7-946a-d8d03262d385/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/6e5fee99-79f3-462e-9311-b5e6fd963bdf/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1c0ba983-5aa7-456f-a497-82088583f48c/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/ba27d0d1-b7c0-4ace-9276-5715f86ef3b4/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5d0a55ac-7e62-4a9a-a904-87761ffdbfb5/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/c901c251-fec2-4c1a-a600-3fc8337e1c4e/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/cfbe0196-5d2f-4e67-80a2-0d36a8296711/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/1fc1277b-3ae3-4ad7-8643-1e5ef641e6bd/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/5d342281-38c7-4f46-a944-a618079565fb/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/dd041021-06d1-4fa1-a5e2-2ebfd1a9b329/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/8a953431-8927-48c4-88ff-05d4a711b941/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/379a466a-0e33-48c6-b710-419ef6db1890/0-0.jpg', model: 'Zara' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/bcf9d7d1-cad2-45dc-8fa0-f75b0a606cd6/0-0.jpg', model: 'Freya' },
  { url: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/workflow-previews/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/d7aaf64b-447e-4341-afbc-005fe076df5a/0-0.jpg', model: 'Zara' },
];

const STATS = [
  { icon: LayoutGrid, value: '79', label: 'Visuals' },
  { icon: Timer, value: '~3 min', label: 'Made in' },
];



type LightboxState = { list: 'main' | 'ugc'; index: number } | null;

export default function BiomaShowcase() {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const active = lightbox
    ? (lightbox.list === 'main' ? IMAGES[lightbox.index] : { ...UGC_IMAGES[lightbox.index], scene: 'Selfie UGC' })
    : null;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="A Sample Visual Library for BIOMA | VOVV.AI"
        description="A wellness editorial drop built for BIOMA Anti-Stress Probiotic — generated by VOVV.AI from a single product photo."
        noindex
      />
      <LandingNav />

      <section className="pt-28 pb-14 lg:pt-40 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-5">
            Brand example · BIOMA
          </p>
          <h1 className="text-[#0f172a] text-3xl sm:text-4xl lg:text-[3.25rem] lg:leading-[1.1] font-semibold tracking-tight mb-5">
            This is what VOVV.AI makes from one product photo
          </h1>
          <p className="text-[#64748b] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            A complete wellness campaign — 53 editorial visuals plus 26 selfie-style UGC, ready for web, social, and retail
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
          <div className="mb-8 lg:mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-2">Editorial campaign</p>
            <h2 className="text-[#0f172a] text-xl sm:text-2xl font-semibold tracking-tight">Studio and lifestyle visuals</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox({ list: 'main', index: i })}
                className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20"
              >
                <img
                  src={getOptimizedUrl(img.url, { quality: 50 })}
                  alt={img.model ? `${img.scene} — ${img.model}` : img.scene}
                  loading={i < 8 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium leading-tight">{img.scene}</p>
                  {img.model && <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">{img.model}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 lg:mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#94a3b8] mb-2">Selfie UGC set</p>
            <h2 className="text-[#0f172a] text-xl sm:text-2xl font-semibold tracking-tight">Creator-style selfies for social</h2>
            <p className="text-[#64748b] text-sm sm:text-base mt-2 max-w-xl">Raw, phone-shot energy — built for Reels, TikTok, and paid social</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {UGC_IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightbox({ list: 'ugc', index: i })}
                className="group relative aspect-[4/5] block w-full rounded-xl overflow-hidden will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f172a]/20"
              >
                <img
                  src={getOptimizedUrl(img.url, { quality: 50 })}
                  alt={`Selfie UGC — ${img.model}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-xs sm:text-sm font-medium leading-tight">Selfie UGC</p>
                  {img.model && <p className="text-white/60 text-[10px] sm:text-xs mt-0.5">{img.model}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors z-10">
            <X size={24} />
          </button>
          <img
            src={getOptimizedUrl(active.url, { quality: 80 })}
            alt={active.scene}
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white text-sm font-medium">{active.scene}</p>
            {active.model && <p className="text-white/50 text-xs mt-0.5">{active.model}</p>}
          </div>
        </div>
      )}

      <section className="py-16 lg:py-28 bg-[#0f172a]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-5">BIOMA, this is what VOVV.AI can do for you</h2>
          <p className="text-[#94a3b8] text-base sm:text-lg leading-relaxed mb-10">Every visual on this page was generated from a single product photo — no studio, no models, no shoot day</p>
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
