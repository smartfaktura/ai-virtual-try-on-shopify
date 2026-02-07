import { useState } from 'react';
import { Users, Camera, Palette, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Models — curated for diversity
import modelYuki from '@/assets/models/model-female-slim-asian.jpg';
import modelAmara from '@/assets/models/model-female-athletic-black.jpg';
import modelIsabella from '@/assets/models/model-female-plussize-latina.jpg';
import modelCharlotte from '@/assets/models/model-female-average-european.jpg';
import modelMarcus from '@/assets/models/model-male-athletic-black.jpg';
import modelOmar from '@/assets/models/model-male-slim-middleeast.jpg';
import modelSienna from '@/assets/models/model-female-average-irish.jpg';
import modelKenji from '@/assets/models/model-male-athletic-japanese.jpg';

// Poses — one per style
import poseStudioFront from '@/assets/poses/pose-studio-front.jpg';
import poseLifestyleWalking from '@/assets/poses/pose-lifestyle-walking.jpg';
import poseLifestyleCoffee from '@/assets/poses/pose-lifestyle-coffee.jpg';
import poseEditorialDramatic from '@/assets/poses/pose-editorial-dramatic.jpg';
import poseStreetwearStairs from '@/assets/poses/pose-streetwear-stairs.jpg';
import poseStreetwearNeon from '@/assets/poses/pose-streetwear-neon.jpg';

// Products
import productLeggings from '@/assets/products/leggings-black-1.jpg';
import productHoodie from '@/assets/products/hoodie-gray-1.jpg';
import productSportsBra from '@/assets/products/sports-bra-black-1.jpg';

interface ModelOption {
  name: string;
  bodyType: string;
  image: string;
}

interface PoseOption {
  name: string;
  category: string;
  image: string;
}

interface ProductOption {
  name: string;
  image: string;
}

const MODELS: ModelOption[] = [
  { name: 'Yuki', bodyType: 'Slim', image: modelYuki },
  { name: 'Amara', bodyType: 'Athletic', image: modelAmara },
  { name: 'Isabella', bodyType: 'Plus-size', image: modelIsabella },
  { name: 'Charlotte', bodyType: 'Average', image: modelCharlotte },
  { name: 'Marcus', bodyType: 'Athletic', image: modelMarcus },
  { name: 'Omar', bodyType: 'Slim', image: modelOmar },
  { name: 'Sienna', bodyType: 'Average', image: modelSienna },
  { name: 'Kenji', bodyType: 'Athletic', image: modelKenji },
];

const POSES: PoseOption[] = [
  { name: 'Studio Front', category: 'Studio', image: poseStudioFront },
  { name: 'Urban Walking', category: 'Lifestyle', image: poseLifestyleWalking },
  { name: 'Coffee Shop', category: 'Lifestyle', image: poseLifestyleCoffee },
  { name: 'Dramatic', category: 'Editorial', image: poseEditorialDramatic },
  { name: 'Street Lean', category: 'Streetwear', image: poseStreetwearStairs },
  { name: 'Night Neon', category: 'Streetwear', image: poseStreetwearNeon },
];

const PRODUCTS: ProductOption[] = [
  { name: 'Airlift Legging', image: productLeggings },
  { name: 'Accolade Hoodie', image: productHoodie },
  { name: 'Intrigue Sports Bra', image: productSportsBra },
];

const STATS = [
  { icon: Users, label: '34 Models', value: '' },
  { icon: Camera, label: '24 Poses', value: '' },
  { icon: Palette, label: '4 Styles', value: '' },
  { icon: Heart, label: 'All Body Types', value: '' },
];

export function ModelShowcaseSection() {
  const [selectedModel, setSelectedModel] = useState(0);
  const [selectedPose, setSelectedPose] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(0);

  const model = MODELS[selectedModel];
  const pose = POSES[selectedPose];
  const product = PRODUCTS[selectedProduct];

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 text-xs tracking-wide uppercase">
            Virtual Try-On
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Professional Models. Every Look.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a product from your catalog. Your AI team photographs it on professional models
            across studio, lifestyle, editorial, and streetwear settings.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 max-w-2xl mx-auto">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3"
            >
              <stat.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Main two-column layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* LEFT — copy + product picker */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-28">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Currently shooting</p>
              <p className="text-xl font-semibold text-foreground">{product.name}</p>
            </div>

            {/* Product picker */}
            <div className="flex gap-3">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedProduct(i)}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all duration-200 w-24 h-24 flex-shrink-0 ${
                    i === selectedProduct
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-muted-foreground/40'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-foreground/70 text-background text-[10px] font-medium py-0.5 text-center leading-tight">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Pick any model below, choose a pose, and see how your product would look in a
              professional photoshoot — all generated by your AI photography team in seconds.
            </p>

            <Button size="lg" className="w-fit gap-2" asChild>
              <a href="/auth">
                Try Virtual Try-On Free <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* RIGHT — hero card + strips */}
          <div className="flex flex-col gap-6">
            {/* Hero composite card */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-lg aspect-[4/5] max-h-[520px]">
              {/* Pose as background */}
              <img
                src={pose.image}
                alt={pose.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              {/* Model as main focus */}
              <img
                src={model.image}
                alt={model.name}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              {/* Product inset */}
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-lg overflow-hidden border-2 border-background shadow-md">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Labels */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <Badge className="bg-background/80 text-foreground backdrop-blur-sm border-0 text-xs">
                  {model.name} · {model.bodyType}
                </Badge>
                <Badge variant="secondary" className="bg-background/80 text-foreground backdrop-blur-sm border-0 text-xs">
                  {pose.category} · {pose.name}
                </Badge>
              </div>
            </div>

            {/* Model strip */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Choose a Model
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                {MODELS.map((m, i) => (
                  <button
                    key={m.name}
                    onClick={() => setSelectedModel(i)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                      i === selectedModel ? 'scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-colors ${
                        i === selectedModel ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={m.image}
                        alt={m.name}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-foreground leading-none">
                      {m.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground leading-none">
                      {m.bodyType}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pose strip */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Choose a Pose
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
                {POSES.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPose(i)}
                    className={`flex-shrink-0 transition-all duration-200 ${
                      i === selectedPose ? 'scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === selectedPose ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <span className="block text-[10px] font-medium text-foreground mt-1 leading-none">
                      {p.name}
                    </span>
                    <span className="block text-[9px] text-muted-foreground leading-none mt-0.5">
                      {p.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
