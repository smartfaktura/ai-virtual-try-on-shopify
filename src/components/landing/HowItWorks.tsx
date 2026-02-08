import { useState } from 'react';
import { Upload, Target, Images, ArrowRight, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Product images
import cropTopProduct from '@/assets/hero/hero-product-croptop.jpg';

// Outcome images
import outcomeImage from '@/assets/hero/hero-result-yoga-blonde.jpg';

// Visual set scenes (reuse existing hero outputs)
import sceneStudio from '@/assets/hero/hero-output-studio.jpg';
import sceneCoffee from '@/assets/hero/hero-output-coffee.jpg';
import sceneBeach from '@/assets/hero/hero-output-beach.jpg';
import scenePark from '@/assets/hero/hero-output-park.jpg';
import sceneRooftop from '@/assets/hero/hero-output-rooftop.jpg';
import sceneUrban from '@/assets/hero/hero-output-urban.jpg';

// Model + environment thumbs for step 2
import modelThumb from '@/assets/hero/hero-model-blonde.jpg';
import envThumb from '@/assets/hero/hero-scene-yoga.jpg';

function HoverPreview({ src, alt, label, isResult = false }: { src: string; alt: string; label: string; isResult?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center gap-1 relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer ${isResult ? 'border-2 border-primary/50 ring-2 ring-primary/20' : 'border-2 border-primary'}`}>
        <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
      </div>
      <span className={`text-[9px] ${isResult ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{label}</span>

      {/* Hover popup */}
      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none transition-all duration-200 ease-out"
        style={{
          opacity: hovered ? 1 : 0,
          transform: `translateX(-50%) scale(${hovered ? 1 : 0.92})`,
        }}
      >
        <div className="w-44 h-44 rounded-xl overflow-hidden border border-border bg-card shadow-xl">
          <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
      </div>
    </div>
  );
}

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-4">
            Three Steps to Automated Product Visuals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Set it once, get fresh visuals forever. No design skills needed.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-20 mb-14">
          {/* Step 1 — Upload Your Product */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">01</span>
                <h3 className="text-2xl font-bold text-foreground">Upload Your Product</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Drag & drop your product image or import from your product library. Works with any product type — clothing, cosmetics, food, home goods, and more.
              </p>
              {/* Platform logos */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground mr-1">Auto-import from:</span>
                {['Shopify', 'Wix', 'WooCommerce', 'BigCommerce', 'Squarespace'].map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-card border border-border text-[11px] font-medium text-muted-foreground"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Upload card visual */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {/* Upload area */}
                  <div className="p-4 border-b border-border">
                    <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 bg-muted/20">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Drag & drop or <span className="text-primary font-medium">browse</span>
                      </p>
                    </div>
                  </div>
                  {/* Uploaded product preview */}
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-border shrink-0">
                      <img src={cropTopProduct} alt="White Crop Top" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">White Crop Top</p>
                      <p className="text-[11px] text-muted-foreground">Clothing · Activewear</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-medium text-primary">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 — Choose What You're Creating */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">02</span>
                <h3 className="text-2xl font-bold text-foreground">Choose What You're Creating</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Pick your model, environment, and style — from studio shots to lifestyle scenes. Control every detail or let your AI team handle it.
              </p>
            </div>

            {/* Workflow selector visual */}
            <div className="flex justify-center lg:order-1">
              <div className="w-full max-w-sm">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  {/* Selection row */}
                  <div className="p-3 border-b border-border">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Your Selection</p>
                    <div className="flex items-center gap-2">
                      <HoverPreview src={cropTopProduct} alt="Product" label="Product" />
                      <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <HoverPreview src={modelThumb} alt="Model" label="Model" />
                      <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <HoverPreview src={envThumb} alt="Scene" label="Scene" />
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <HoverPreview src={outcomeImage} alt="Result" label="Result" isResult />
                    </div>
                  </div>
                  {/* Generate button */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {['Ad Refresh', 'Hero Set', 'Lifestyle'].map((wf) => (
                          <span
                            key={wf}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                              wf === 'Lifestyle'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {wf}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Generate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 — Get a Visual Set */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">03</span>
                <h3 className="text-2xl font-bold text-foreground">Get a Visual Set</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Receive 6–20 brand-ready images in seconds. Same product, endless scenes. Or schedule Creative Drops and get fresh visuals every month, automatically.
              </p>
            </div>

            {/* Visual set grid */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-border shrink-0">
                        <img src={cropTopProduct} alt="Product" className="w-full h-full object-cover object-top" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">White Crop Top</p>
                        <p className="text-[10px] text-muted-foreground">6 scenes generated</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-primary">Download All</span>
                  </div>
                  <div className="p-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {[sceneStudio, sceneCoffee, sceneBeach, scenePark, sceneRooftop, sceneUrban].map((scene, i) => (
                        <div key={i} className="rounded-md overflow-hidden border border-border aspect-[4/5]">
                          <img
                            src={scene}
                            alt={`Scene ${i + 1}`}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold gap-2 shadow-lg shadow-primary/25" onClick={() => navigate('/auth')}>
            Try It Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
