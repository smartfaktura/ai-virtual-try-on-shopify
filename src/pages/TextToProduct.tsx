import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/app/PageHeader';
import { useGenerationQueue } from '@/hooks/useGenerationQueue';
import { useCredits } from '@/contexts/CreditContext';
import { toast } from '@/lib/brandedToast';
import { Download, ChevronLeft, ChevronRight, Sparkles, Image, Box, Camera, Smartphone, Eye, Gem, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// ── Scene templates ────────────────────────────────────────────────
interface SceneTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  promptTemplate: string;
}

const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'white_front',
    label: 'White Front',
    icon: <Box className="h-5 w-5" />,
    description: 'Straight-on front view on pure white studio background',
    promptTemplate: `Create a photorealistic premium ecommerce product image on a pure white seamless studio background.

Use ONLY the product specification provided below. Reconstruct the exact item faithfully. Do not redesign it, simplify it, embellish it, or invent missing features. The result must look like a real commercially photographed product sold by a premium brand, not a concept render and not a generic AI interpretation.

Show the product in a straight-on FRONT view.
Center the product in frame.
Use soft diffused studio lighting, realistic proportions, sharp edges, accurate materials, and a subtle grounded shadow below the object.
Keep the background clean pure white with no props, no environment, no styling objects, no people, no hands, no floor texture, no pedestal, no packaging unless explicitly mentioned.
Render only the visible details that belong to the front view.
If branding or text is not meant to be visible on the front, do not add any.
Preserve exact silhouette, exact finish, exact materials, exact structure, and exact color relationships.
Use ultra-realistic product photography quality with crisp focus and true-to-life material behavior.

Important:
- Do not invent extra seams, pockets, hardware, labels, buttons, decorations, logos, prints, textures, folds, or components not described.
- If a detail belongs to the back or inside only, do not place it on the front.
- Respect the provided hex colors as closely as possible.
- Maintain realistic scale and product construction.

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'white_side',
    label: 'White Side',
    icon: <Image className="h-5 w-5" />,
    description: 'Side profile view revealing depth and contour',
    promptTemplate: `Create a photorealistic premium ecommerce product image on a pure white seamless studio background.

Use ONLY the product specification provided below. Reconstruct the exact item faithfully. Do not redesign it, simplify it, embellish it, or invent missing features.

Show the product in a clean SIDE PROFILE view.
The goal is to clearly reveal the side silhouette, depth, side construction, thickness, contour, and profile lines of the object.
Center the product in frame with the full object visible.
Use soft diffused high-end studio lighting with controlled reflections and a subtle natural shadow below.
Keep the background pure white, with no props, no environment, no model, no hands, no floor styling.

Render only the details visible from the side.
Do not introduce front-only or back-only branding unless it would naturally be visible from this angle.
Preserve the exact form, exact proportions, exact materials, exact finish, and exact hex-based color relationships.

Important:
- Do not invent extra design features.
- Do not turn the shot into a 3/4 editorial angle.
- Do not exaggerate perspective.
- Do not add decorative studio effects.

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'back_view',
    label: 'Back View',
    icon: <Camera className="h-5 w-5" />,
    description: 'Straight-on back view showing rear details',
    promptTemplate: `Create a photorealistic premium ecommerce product image on a pure white seamless studio background.

Show the product in a straight-on BACK view only.

Use ONLY the product specification below. Reconstruct the exact item faithfully. Do not redesign it, simplify it, embellish it, or invent missing features.

The result must look like a real commercially photographed product sold by a premium brand, not a concept render and not a generic AI interpretation.

Image rules:
- centered composition
- full product visible unless the product is naturally macro-sized
- pure white background (#FFFFFF)
- soft diffused commercial studio lighting
- subtle realistic grounded shadow below the product
- crisp focus, sharp edges, realistic proportions
- accurate material behavior, true finish, true color relationships
- no props, no people, no hands, no packaging, no environment, no pedestal, no decorative styling

Back-view rules:
- render only details that belong to the BACK view
- clearly show back silhouette, back construction, seams, closures, panels, labels, ports, hardware, heel counter, back pockets, strap routing, or rear structure only if explicitly described
- if branding is not meant to be visible on the back, do not add any
- if the back is plain, keep it plain
- do not leak front-only details into the back view
- do not invent side details unless naturally visible from a straight back angle

Accuracy rules:
- preserve exact silhouette, proportions, materials, finish, visible construction, hex color relationships
- preserve exact back-facing text only if explicitly described

Negative constraints:
- no extra seams, stitching, logos, labels, pockets, zippers, hardware, texture, print unless described
- no stylization, no CGI look, no illustration look, no editorial mood

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'inside_view',
    label: 'Inside View',
    icon: <Eye className="h-5 w-5" />,
    description: 'Interior/lining view showing inner construction',
    promptTemplate: `Create a photorealistic premium ecommerce product image on a pure white seamless studio background.

Show the product in an INSIDE / INTERIOR view only.

Use ONLY the product specification below. Reconstruct the exact item faithfully. Do not redesign it, simplify it, embellish it, or invent missing features.

The image must show the product opened in a realistic way so the interior construction is clearly visible.
Do not create a cutaway diagram. Do not create an exploded view. Do not make transparent walls.
Do not reveal hidden construction that would not naturally be visible in a normal opened-product photo.

Image rules:
- pure white seamless background (#FFFFFF)
- soft diffused commercial studio lighting
- centered composition
- crisp focus, sharp edges, realistic proportions
- subtle grounded shadow
- premium ecommerce product photography
- no props, no people, no hands, no packaging, no environment, no decorative styling

Interior-view rules:
- show only the interior that would naturally be visible when the product is opened
- clearly reveal lining, interior compartments, zip pocket, slip pocket, divider, laptop sleeve, card slots, coin section, interior zip path, inner seams, edge finishing, gusset structure, or internal branding only if explicitly described
- keep the opening angle realistic and physically believable
- preserve realistic thickness, material layering, stitching, fold lines, and construction
- if the product has a simple empty interior, keep it simple
- if the product has no visible inside structure, do not invent any
- if there is inside text, render only the exact text or type of text described
- if the inside contains foil stamp, woven label, printed branding, size text, or care text, keep it minimal and only where specified

Accuracy rules:
- preserve exact silhouette, proportions, materials, finish, interior layout, hex color relationships, hardware placement, closure type

Negative constraints:
- no extra compartments, card slots, zippers, pockets, dividers, labels, branding
- no fake stuffing, no fake product contents
- no cash, cards, laptop, cosmetics, phone, keys, or accessories inside unless explicitly described
- no stylization, no CGI look, no illustration look, no editorial mood

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'iphone_resale',
    label: 'iPhone / Resale',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Casual on-body iPhone photo for resale listings',
    promptTemplate: `Create a realistic casual iPhone photo of this apparel item being worn by a real person for a resale listing such as Vinted, Depop, or Facebook Marketplace.

Use ONLY the product specification below. Reconstruct the exact garment faithfully. Do not redesign it, stylize it, over-fashion it, or invent missing details.

The clothing must be shown ON BODY at realistic human scale.
The person is only there to show fit, drape, and proportion — the garment is the main subject.

Photo style:
- casual at-home iPhone photo
- natural daylight from a window
- clean normal home setting
- not messy, but not studio-perfect
- believable regular-person resale listing photo
- simple natural pose
- not editorial, not influencer-style, not luxury campaign, not a professional photoshoot

Person rules:
- no visible face
- crop from neck down, chin down, or shoulders down
- no eye contact, no facial features, no glam styling focus
- body should look natural and believable
- no exaggerated model pose
- no extreme waist cinching or unrealistic body shape
- hands can appear naturally if needed, but should not distract from the garment

Garment rules:
- preserve exact silhouette, length, fit, neckline, straps, sleeves, seams, slit, waistband, pockets, drape, and construction exactly as described
- preserve exact material behavior and exact color relationships
- garment must look like a real wearable item at full human scale
- no extra logos, print, embellishment, seams, hardware, lace, layers, or styling details unless explicitly described

Scene rules:
- realistic home environment such as bedroom, hallway, mirror area, or plain wall near window
- no strong clutter
- no fake luxury set design
- no studio background, no professional fashion set, no dramatic props

Framing:
- full garment visible when possible
- if full garment cannot fit naturally, keep enough of the body visible to clearly understand fit and length
- prioritize clear resale-listing readability

The result should feel like a genuine clean secondhand listing photo taken by a regular person at home with an iPhone.

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'detail_macro',
    label: 'Detail / Macro',
    icon: <Gem className="h-5 w-5" />,
    description: 'Close-up texture and embellishment detail shot',
    promptTemplate: `Create a photorealistic extreme close-up macro product photograph on a pure white seamless studio background.

Use ONLY the product specification below. Focus on the most distinctive detail, texture, or embellishment described.

Show the product in an extreme MACRO / DETAIL view.
The goal is to reveal material quality, texture grain, stitching precision, embellishment detail, hardware finish, or fabric weave at close range.

Image rules:
- pure white seamless background (#FFFFFF)
- macro lens perspective (100mm f/2.8 equivalent)
- shallow depth of field with the key detail in sharp focus
- soft diffused studio lighting with controlled highlights
- no props, no people, no hands, no environment
- centered composition focused on the most premium/distinctive detail

Detail rules:
- choose the single most visually interesting detail from the specification: pearl embellishment, zipper hardware, stitching, material grain, label, buckle, clasp, weave pattern, etc.
- show realistic material behavior at macro scale: thread count visible in fabric, metal grain in hardware, pearl luster, leather grain
- preserve exact hex colors at the detail level
- do not invent details not described in the specification

Accuracy rules:
- preserve exact materials, finish, color relationships
- show true-to-life material behavior under controlled lighting

Negative constraints:
- no full product view — this is a detail crop only
- no extra embellishments or hardware not described
- no stylization, no CGI look, no illustration

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
];

// ── Steps ──────────────────────────────────────────────────────────
type Step = 'describe' | 'scenes' | 'review' | 'generating' | 'results';

const STEPS: Step[] = ['describe', 'scenes', 'review', 'generating', 'results'];
const STEP_LABELS: Record<Step, string> = {
  describe: 'Describe',
  scenes: 'Select Scenes',
  review: 'Review',
  generating: 'Generating',
  results: 'Results',
};

const CREDITS_PER_IMAGE = 6;

export default function TextToProduct() {
  const [step, setStep] = useState<Step>('describe');
  const [title, setTitle] = useState('');
  const [specification, setSpecification] = useState('');
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const { refreshBalance } = useCredits();

  const {
    enqueue,
    activeJob,
    isEnqueuing,
    isProcessing,
    reset: resetQueue,
  } = useGenerationQueue({
    jobTypes: ['text-product' as any],
    onCreditRefresh: refreshBalance,
    onGenerationFailed: (_id, msg) => {
      toast.error(msg || 'Generation failed');
    },
  });

  const creditCost = selectedScenes.length * CREDITS_PER_IMAGE;

  const progress = useMemo(() => {
    if (!activeJob?.result) return null;
    const r = activeJob.result as Record<string, unknown>;
    return {
      generated: (r.generatedCount as number) || 0,
      total: (r.requestedCount as number) || selectedScenes.length,
      currentLabel: (r.currentLabel as string) || '',
      images: (r.images as string[]) || [],
    };
  }, [activeJob?.result, selectedScenes.length]);

  const resultImages = useMemo(() => {
    if (activeJob?.status !== 'completed' || !activeJob.result) return [];
    const r = activeJob.result as Record<string, unknown>;
    return (r.images as string[]) || [];
  }, [activeJob]);

  const toggleScene = (id: string) => {
    setSelectedScenes(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const canProceedFromDescribe = title.trim().length > 0 && specification.trim().length > 20;
  const canProceedFromScenes = selectedScenes.length > 0;

  const handleGenerate = useCallback(async () => {
    const scenesToGenerate = SCENE_TEMPLATES.filter(t => selectedScenes.includes(t.id));
    const scenes = scenesToGenerate.map(s => ({
      label: s.label,
      prompt: s.promptTemplate.replace('{{PRODUCT_SPECIFICATION}}', specification),
      aspect_ratio: aspectRatio,
    }));

    const result = await enqueue(
      {
        jobType: 'text-product' as any,
        payload: {
          title,
          specification,
          scenes,
          aspectRatio,
        },
        imageCount: scenes.length,
        quality: 'high',
      },
      {
        imageCount: scenes.length,
        quality: 'high',
        hasModel: false,
        hasScene: false,
        hasProduct: false,
      }
    );

    if (result) {
      setStep('generating');
    }
  }, [selectedScenes, specification, aspectRatio, title, enqueue]);

  // Auto-transition from generating → results
  if (step === 'generating' && activeJob?.status === 'completed') {
    setStep('results');
  }

  const stepIndex = STEPS.indexOf(step);

  const handleDownload = async (url: string, idx: number) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${idx + 1}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Text to Product"
        subtitle="Generate photorealistic product images from a detailed text description"
      >
        <div /></PageHeader>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <span className={`font-medium ${step === s ? 'text-primary' : i < stepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
              {i < stepIndex && <Check className="inline h-4 w-4 mr-1" />}
              {STEP_LABELS[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Describe */}
      {step === 'describe' && (
        <div className="space-y-4 max-w-3xl">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Product Title</label>
            <Input
              placeholder="e.g. Powder Pink Satin Pearl Mini"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Product Specification</label>
            <Textarea
              placeholder="Describe the product in full detail: silhouette, construction, materials, colors (hex codes), branding placement, fabric finish, negative constraints..."
              value={specification}
              onChange={e => setSpecification(e.target.value)}
              className="min-h-[300px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include hex colors, construction details, materials, and negative constraints for best results.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep('scenes')} disabled={!canProceedFromDescribe}>
              Next: Select Scenes <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Scenes */}
      {step === 'scenes' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Select which views to generate. Each scene costs {CREDITS_PER_IMAGE} credits.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SCENE_TEMPLATES.map(scene => {
              const selected = selectedScenes.includes(scene.id);
              return (
                <Card
                  key={scene.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${selected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                  onClick={() => toggleScene(scene.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox checked={selected} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {scene.icon}
                        <span className="font-medium text-sm">{scene.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{scene.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Aspect ratio */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Aspect Ratio</label>
            <div className="flex gap-2">
              {['1:1', '4:5', '3:4', '16:9', '9:16'].map(r => (
                <Button
                  key={r}
                  variant={aspectRatio === r ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAspectRatio(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('describe')}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep('review')} disabled={!canProceedFromScenes}>
              Next: Review <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className="space-y-4 max-w-3xl">
          <Card className="p-4 space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">Product</span>
              <p className="font-medium">{title}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-xs text-muted-foreground line-clamp-4 font-mono">{specification}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Scenes ({selectedScenes.length})</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {SCENE_TEMPLATES.filter(t => selectedScenes.includes(t.id)).map(s => (
                  <Badge key={s.id} variant="secondary">{s.label}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>Aspect Ratio: <strong>{aspectRatio}</strong></span>
              <span>Credits: <strong>{creditCost}</strong></span>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('scenes')}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleGenerate} disabled={isEnqueuing}>
              {isEnqueuing ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Enqueuing...</>
              ) : (
                <><Sparkles className="mr-1 h-4 w-4" /> Generate ({creditCost} credits)</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Generating */}
      {step === 'generating' && (
        <div className="space-y-4 max-w-xl mx-auto text-center py-12">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <h3 className="text-lg font-semibold">Generating your product images...</h3>
          {progress && (
            <div className="space-y-2">
              <Progress value={(progress.generated / progress.total) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progress.generated} / {progress.total} completed
                {progress.currentLabel ? ` — ${progress.currentLabel}` : ''}
              </p>
            </div>
          )}
          {activeJob?.status === 'failed' && (
            <div className="text-destructive">
              <p>{activeJob.error_message || 'Generation failed'}</p>
              <Button variant="outline" className="mt-3" onClick={() => { resetQueue(); setStep('review'); }}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 5: Results */}
      {step === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {resultImages.length} image{resultImages.length !== 1 ? 's' : ''} generated
            </h3>
            <Button variant="outline" onClick={() => { resetQueue(); setStep('describe'); }}>
              New Generation
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {resultImages.map((url, idx) => (
              <Card key={idx} className="overflow-hidden group relative">
                <img src={url} alt={`Generated ${idx + 1}`} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" variant="secondary" onClick={() => handleDownload(url, idx)}>
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
