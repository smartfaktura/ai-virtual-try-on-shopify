import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { saveOrShareImage } from '@/lib/mobileImageSave';
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/brandedToast';
import { PostGenerationUpgradeCard } from '@/components/app/PostGenerationUpgradeCard';
import { UpgradeValueDrawer } from '@/components/app/UpgradeValueDrawer';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useConversionState } from '@/hooks/useConversionState';
import { resolveConversionCategory } from '@/lib/conversionCopy';
import { useQuery } from '@tanstack/react-query';
import { paceDelay } from '@/lib/enqueueGeneration';
import { Download, ChevronLeft, ChevronRight, Sparkles, Image, Box, Camera, Smartphone, Eye, Gem, Check, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Upload, X, ClipboardPaste } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

// ── Product entry ──────────────────────────────────────────────────
interface ProductEntry {
  id: string;
  title: string;
  specification: string;
  referenceImageFile?: File;
  referenceImagePreview?: string;
}

function makeProduct(): ProductEntry {
  return { id: crypto.randomUUID(), title: '', specification: '' };
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_REF_SIZE = 10 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ── Scene templates ────────────────────────────────────────────────
interface SceneTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  promptTemplate: string;
}

const QUALITY_SUFFIX = `8K product photography, shot on Phase One IQ4 150MP, tethered to Capture One, color-graded for premium e-commerce. Rich true-to-life colors with slight warmth. For clothing/apparel: ensure fabric drapes naturally with realistic folds that enhance appeal, materials look touchable and high-quality.`;

const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'white_front',
    label: 'White Front',
    icon: <Box className="h-5 w-5" />,
    description: 'Straight-on front view on pure white studio background',
    promptTemplate: `Create a photorealistic premium editorial e-commerce product image on a pure white seamless studio background.

Use ONLY the product specification provided below. Reconstruct the exact item faithfully. Do not redesign, simplify, embellish, or invent missing features.

Show the product in a straight-on FRONT view, centered in frame.

Lighting & atmosphere:
- Premium editorial e-commerce lighting with soft gradient shadows
- Studio key light from upper-left with subtle rim light separating the product from the background
- Controlled specular highlights on reflective materials
- The image should feel like an ASOS or Net-a-Porter product listing

Image rules:
- Pure white background with subtle tonal gradient for depth
- Crisp focus, sharp edges, realistic proportions
- Accurate material behavior — leather looks supple, metal catches light, fabric shows weave
- Subtle grounded shadow below the product for realism
- No props, no environment, no people, no hands, no packaging

Accuracy rules:
- Preserve exact silhouette, finish, materials, structure, and hex color relationships
- Do not invent extra seams, pockets, hardware, labels, logos, prints, or decorations not described
- If a detail belongs to the back or inside only, do not place it on the front

${QUALITY_SUFFIX}

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'white_side',
    label: 'White Side',
    icon: <Image className="h-5 w-5" />,
    description: 'Side profile view revealing depth and contour',
    promptTemplate: `Create a photorealistic premium editorial e-commerce product image on a pure white seamless studio background.

Use ONLY the product specification provided below. Reconstruct the exact item faithfully.

Show the product in a clean SIDE PROFILE view revealing depth, contour, and silhouette.

Lighting & atmosphere:
- Directional key light from the side revealing contour and dimensionality
- Subtle gradient on the white background for depth — not flat
- Rim light on the far edge separating the product from the background
- Premium fashion e-commerce quality matching Farfetch or SSENSE product pages

Image rules:
- Full object visible, centered in frame
- Controlled reflections on shiny materials
- Subtle natural shadow below
- No props, no environment, no model, no hands, no floor styling

Accuracy rules:
- Render only details visible from the side
- Preserve exact form, proportions, materials, finish, and hex color relationships
- Do not turn into a 3/4 editorial angle — true side profile

${QUALITY_SUFFIX}

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'back_view',
    label: 'Back View',
    icon: <Camera className="h-5 w-5" />,
    description: 'Straight-on back view showing rear details',
    promptTemplate: `Create a photorealistic premium editorial e-commerce product image on a pure white seamless studio background.

Show the product in a straight-on BACK view only.

Use ONLY the product specification below. Reconstruct the exact item faithfully.

Lighting & atmosphere:
- Premium editorial studio lighting with soft gradient shadows
- Key light from upper-right with subtle fill to reveal back construction
- Rim light along edges for separation from background
- The quality should match luxury brand e-commerce standards

Image rules:
- Centered composition, full product visible
- Pure white background with subtle tonal depth
- Crisp focus, realistic proportions, accurate material behavior
- Subtle grounded shadow below
- No props, no people, no hands, no packaging, no environment

Back-view rules:
- Render only details that belong to the BACK view
- Show back silhouette, construction, seams, closures, panels, labels, ports, hardware, rear structure only if described
- If the back is plain, keep it plain
- Do not leak front-only details into the back view

${QUALITY_SUFFIX}

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'inside_view',
    label: 'Inside View',
    icon: <Eye className="h-5 w-5" />,
    description: 'Interior/lining view showing inner construction',
    promptTemplate: `Create a photorealistic premium product image showing the INSIDE / INTERIOR view on a pure white seamless studio background.

Use ONLY the product specification below. Reconstruct the exact item faithfully.

The image must show the product opened realistically so the interior construction is clearly visible. The image should feel like a luxury brand's detail page — warm, inviting, premium.

Lighting & atmosphere:
- Warm controlled studio lighting that makes interior materials look luxurious
- Soft highlights on hardware and metal closures
- Rich color rendering of lining and interior materials
- The quality of a Bottega Veneta or Celine product detail page

Image rules:
- Pure white seamless background
- Centered composition with realistic opening angle
- Crisp focus revealing interior quality and craftsmanship
- Subtle grounded shadow
- No props, no people, no hands, no packaging

Interior-view rules:
- Show only interior naturally visible when product is opened
- Reveal lining, compartments, pockets, dividers, card slots, interior branding only if described
- Keep opening angle realistic and physically believable
- If the inside is simple, keep it simple — do not invent compartments

${QUALITY_SUFFIX}

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'iphone_resale',
    label: 'iPhone / Resale',
    icon: <Smartphone className="h-5 w-5" />,
    description: 'Aesthetic on-body iPhone photo for resale listings',
    promptTemplate: `Create a beautiful high-quality iPhone photo of this item being worn/held by a person for a stylish resale listing like Depop or Vinted.

Use ONLY the product specification below. Reconstruct the exact garment faithfully. Do not redesign or invent missing details.

The clothing must be shown ON BODY at realistic human scale. The garment is the main subject.

Photo style:
- High-quality iPhone photo that looks like a popular Depop/Vinted listing with 500+ likes
- Aspirational but believable — the kind of photo that makes people want to buy
- Beautiful warm color palette, aesthetically pleasing composition
- Warm golden-hour natural light flooding in from a window
- Flattering warm color grading with beautiful soft tones
- NOT a professional studio shoot, but NOT messy either — effortlessly stylish

Person:
- Attractive fit young woman with toned legs and flattering body proportions
- Stylish effortless pose — natural and confident
- No visible face — crop from neck/chin/shoulders down
- Body looks healthy, fit, and natural
- Hands can appear naturally but should not distract from the garment

Scene:
- Bright clean aesthetic space — white walls, warm wood or light floors
- Natural light flooding in, minimal Scandinavian-inspired interior
- Clean and aspirational — the aesthetic you see on popular resale accounts
- No strong clutter, no mess, no dark rooms

Framing:
- For clothing: show full outfit with legs visible, flattering angle
- Clean mirror selfie aesthetic or tripod-shot feel
- Full garment visible when possible
- Prioritize showing fit, drape, and how the item looks on a real person

Garment rules:
- Preserve exact silhouette, length, fit, neckline, straps, sleeves, seams, construction
- Preserve exact material behavior and color relationships
- No extra logos, embellishments, or details not described

${QUALITY_SUFFIX}

PRODUCT SPECIFICATION:
{{PRODUCT_SPECIFICATION}}`,
  },
  {
    id: 'detail_macro',
    label: 'Detail / Macro',
    icon: <Gem className="h-5 w-5" />,
    description: 'Luxury close-up texture and detail shot',
    promptTemplate: `Create a photorealistic luxury extreme close-up macro product photograph on a pure white seamless studio background.

Use ONLY the product specification below. Focus on the most distinctive detail, texture, or embellishment described.

Show the product in an extreme MACRO / DETAIL view — luxury brand campaign detail shot quality.

Lighting & atmosphere:
- Beautiful soft studio lighting with controlled specular highlights
- Warm highlight reflections on hardware, clasps, and metal elements
- Gorgeous bokeh on out-of-focus areas
- Jewel-like precision in rendering — every thread, grain, and facet visible
- The quality of a Cartier or Hermès detail campaign image

Image rules:
- Pure white seamless background
- Macro lens perspective (100mm f/2.8 equivalent)
- Shallow depth of field with the key detail in tack-sharp focus
- Rich texture rendering — thread count visible in fabric, metal grain in hardware, pearl luster, leather grain
- No props, no people, no hands, no environment

Detail rules:
- Choose the single most visually stunning detail: embellishment, hardware, stitching, material grain, weave pattern, clasp, buckle
- Show realistic material behavior at macro scale
- Preserve exact hex colors at the detail level
- Do not invent details not described

${QUALITY_SUFFIX}

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
const MAX_PRODUCTS = 10;

export default function TextToProduct() {
  const [step, setStep] = useState<Step>('describe');
  const [products, setProducts] = useState<ProductEntry[]>([makeProduct()]);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(() => new Set([products[0].id]));
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [jobProductMap, setJobProductMap] = useState<Map<string, string>>(new Map());
  const [completedJobs, setCompletedJobs] = useState<Map<string, { images: { url: string; label: string }[]; productTitle: string }>>(new Map());
  const [enqueuedCount, setEnqueuedCount] = useState(0);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [noCreditsModalOpen, setNoCreditsModalOpen] = useState(false);
  const { refreshBalance, plan, balance, openBuyModal } = useCredits();
  const { user } = useAuth();
  const isFreeUser = plan === 'free';
  const conversionState = useConversionState();
  const { data: ttpProfileCats } = useQuery({
    queryKey: ['profile-categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('product_categories').eq('user_id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id && isFreeUser,
    staleTime: Infinity,
  });
  const conversionCategory = resolveConversionCategory(ttpProfileCats?.product_categories);

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

  const totalImages = products.length * selectedScenes.length;
  const creditCost = totalImages * CREDITS_PER_IMAGE;

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

  const resultImages = useMemo((): { url: string; label: string }[] => {
    if (activeJob?.status !== 'completed' || !activeJob.result) return [];
    const r = activeJob.result as Record<string, unknown>;
    const raw = (r.images as unknown[]) || [];
    return raw.map((img, idx) => {
      if (typeof img === 'string') {
        const sceneId = selectedScenes[idx];
        const sceneLabel = SCENE_TEMPLATES.find(s => s.id === sceneId)?.label || `Scene ${idx + 1}`;
        return { url: img, label: sceneLabel };
      }
      const obj = img as Record<string, unknown>;
      return { url: (obj.url as string) || '', label: (obj.label as string) || `Scene ${idx + 1}` };
    });
  }, [activeJob, selectedScenes]);

  // Collect all results across jobs for multi-product
  const allResults = useMemo(() => {
    const results: { productTitle: string; images: { url: string; label: string }[] }[] = [];
    completedJobs.forEach(v => results.push(v));
    // Also include current active job results if completed
    if (activeJob?.status === 'completed' && resultImages.length > 0) {
      const productTitle = jobProductMap.get(activeJob.id) || products[0]?.title || 'Product';
      if (!completedJobs.has(activeJob.id)) {
        results.push({ productTitle, images: resultImages });
      }
    }
    return results;
  }, [completedJobs, activeJob, resultImages, jobProductMap, products]);

  const toggleScene = (id: string) => {
    setSelectedScenes(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateProduct = (id: string, field: 'title' | 'specification', value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const analyzeReferenceImage = useCallback(async (productId: string, file: File, currentTitle: string) => {
    setAnalyzingIds(prev => new Set(prev).add(productId));
    try {
      const base64 = await fileToBase64(file);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-product-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ imageUrl: base64, title: currentTitle || undefined }),
      });
      if (!resp.ok) throw new Error('Analysis failed');
      const data = await resp.json();
      setProducts(prev => prev.map(p => {
        if (p.id !== productId) return p;
        return {
          ...p,
          title: p.title.trim() ? p.title : (data.title || p.title),
          specification: (!p.specification.trim() || p.specification.trim().length < 20)
            ? (data.specification || data.description || p.specification)
            : p.specification,
        };
      }));
      toast.success('AI analyzed your reference image');
    } catch {
      // Silent fail — user can fill manually
    } finally {
      setAnalyzingIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    }
  }, []);

  const handleReferenceImage = useCallback((productId: string, file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please use JPG, PNG, or WEBP images.');
      return;
    }
    if (file.size > MAX_REF_SIZE) {
      toast.error('Reference image must be under 10MB.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, referenceImageFile: file, referenceImagePreview: previewUrl } : p));
    // Get current title for context-aware analysis
    const currentTitle = products.find(p => p.id === productId)?.title || '';
    analyzeReferenceImage(productId, file, currentTitle);
  }, [products, analyzeReferenceImage]);

  const removeReferenceImage = useCallback((productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId && p.referenceImagePreview) {
        URL.revokeObjectURL(p.referenceImagePreview);
        return { ...p, referenceImageFile: undefined, referenceImagePreview: undefined };
      }
      return p;
    }));
  }, []);

  const addProduct = () => {
    if (products.length >= MAX_PRODUCTS) return;
    const np = makeProduct();
    setProducts(prev => [...prev, np]);
    setExpandedProducts(prev => new Set(prev).add(np.id));
  };

  const removeProduct = (id: string) => {
    if (products.length <= 1) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    setExpandedProducts(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const canProceedFromDescribe = products.every(p => p.title.trim().length > 0 && p.specification.trim().length > 20);
  const canProceedFromScenes = selectedScenes.length > 0;

  const handleGenerate = useCallback(async () => {
    if (creditCost > balance) { setNoCreditsModalOpen(true); return; }
    const scenesToGenerate = SCENE_TEMPLATES.filter(t => selectedScenes.includes(t.id));
    const newJobProductMap = new Map<string, string>();
    setCompletedJobs(new Map());
    setEnqueuedCount(0);

    let enqueueIndex = 0;
    for (const product of products) {
      const scenes = scenesToGenerate.map(s => ({
        label: s.label,
        prompt: s.promptTemplate.replace('{{PRODUCT_SPECIFICATION}}', product.specification),
        aspect_ratio: aspectRatio,
      }));

      // Convert reference image to base64 if present
      let referenceImageUrl: string | null = null;
      if (product.referenceImageFile) {
        try {
          referenceImageUrl = await fileToBase64(product.referenceImageFile);
        } catch {
          console.warn('[TextToProduct] Failed to convert reference image to base64');
        }
      }

      await paceDelay(enqueueIndex);

      const result = await enqueue(
        {
          jobType: 'text-product' as any,
          payload: {
            title: product.title,
            specification: product.specification,
            scenes,
            aspectRatio,
            ...(referenceImageUrl ? { referenceImageUrl } : {}),
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
        newJobProductMap.set(result.jobId, product.title);
        setEnqueuedCount(prev => prev + 1);
      }
      enqueueIndex++;
    }

    setJobProductMap(newJobProductMap);
    if (newJobProductMap.size > 0) {
      setStep('generating');
    }
  }, [selectedScenes, products, aspectRatio, enqueue]);

  // Auto-transition from generating → results (single product via activeJob)
  if (step === 'generating' && activeJob?.status === 'completed' && products.length === 1) {
    setStep('results');
  }

  // Polling effect for multi-product: track all jobs and auto-transition when all complete
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (step !== 'generating' || jobProductMap.size <= 1) return;

    const jobIds = Array.from(jobProductMap.keys());
    if (jobIds.length === 0) return;

    const poll = async () => {
      const { data } = await supabase
        .from('generation_queue')
        .select('id, status, result, error_message')
        .in('id', jobIds);

      if (!data) return;

      let allDone = true;
      const nextCompleted = new Map(completedJobs);

      for (const job of data) {
        if (job.status === 'completed' && job.result && !nextCompleted.has(job.id)) {
          const r = job.result as Record<string, unknown>;
          const raw = (r.images as unknown[]) || [];
          const images: { url: string; label: string }[] = raw.map((img, idx) => {
            if (typeof img === 'string') {
              const sceneId = selectedScenes[idx];
              const sceneLabel = SCENE_TEMPLATES.find(s => s.id === sceneId)?.label || `Scene ${idx + 1}`;
              return { url: img, label: sceneLabel };
            }
            const obj = img as Record<string, unknown>;
            return { url: (obj.url as string) || '', label: (obj.label as string) || `Scene ${idx + 1}` };
          });
          const productTitle = jobProductMap.get(job.id) || 'Product';
          if (images.length > 0) {
            nextCompleted.set(job.id, { images, productTitle });
          }
        }
        if (job.status !== 'completed' && job.status !== 'failed') {
          allDone = false;
        }
      }

      if (nextCompleted.size !== completedJobs.size) {
        setCompletedJobs(nextCompleted);
      }

      if (allDone && nextCompleted.size > 0) {
        setStep('results');
      }
    };

    poll(); // immediate first check
    pollingRef.current = setInterval(poll, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, jobProductMap, completedJobs]);

  const stepIndex = STEPS.indexOf(step);

  const handleDownload = async (url: string, productTitle: string, sceneLabel: string) => {
    try {
      const safeTitle = productTitle.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');
      const safeScene = sceneLabel.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${safeTitle}_${safeScene}.png`;
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
        subtitle="Generate photorealistic product images from detailed text descriptions"
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
          {products.map((product, idx) => (
            <Collapsible
              key={product.id}
              open={expandedProducts.has(product.id)}
              onOpenChange={() => toggleExpanded(product.id)}
            >
              <Card
                className="overflow-hidden"
                onPaste={(e) => {
                  if (product.referenceImagePreview) return;
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (const item of Array.from(items)) {
                    if (item.type.startsWith('image/')) {
                      e.preventDefault();
                      const f = item.getAsFile();
                      if (f) handleReferenceImage(product.id, f);
                      return;
                    }
                  }
                }}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                      <span className="font-medium text-sm">
                        {product.title.trim() || `Product ${idx + 1}`}
                      </span>
                      {product.title.trim() && product.specification.trim().length > 20 && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {products.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={e => { e.stopPropagation(); removeProduct(product.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      )}
                      {expandedProducts.has(product.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3 border-t">
                    <div className="pt-3">
                      <label className="text-sm font-medium mb-1.5 block">Product Title</label>
                      <Input
                        placeholder="e.g. Powder Pink Satin Pearl Mini"
                        value={product.title}
                        onChange={e => updateProduct(product.id, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Full Product Specification</label>
                      <Textarea
                        placeholder="Describe the product in full detail: silhouette, construction, materials, colors (hex codes), branding placement, fabric finish, negative constraints..."
                        value={product.specification}
                        onChange={e => updateProduct(product.id, 'specification', e.target.value)}
                        className="min-h-[240px] font-mono text-xs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Include hex colors, construction details, materials, and negative constraints for best results.
                      </p>
                    </div>

                    {/* Reference Image Upload */}
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Reference Image <span className="text-muted-foreground font-normal">(optional)</span></label>
                      {product.referenceImagePreview ? (
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-card flex-shrink-0">
                            <img src={product.referenceImagePreview} alt="Reference" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() => removeReferenceImage(product.id)}
                              className="absolute top-1 right-1 p-0.5 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {analyzingIds.has(product.id) && (
                              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {analyzingIds.has(product.id) ? (
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-primary" />
                                Analyzing image…
                              </span>
                            ) : (
                              'AI will use this as style inspiration — no branding will be copied.'
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="relative border border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
                          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleReferenceImage(product.id, f); }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleReferenceImage(product.id, f); }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Paste, drag, or click to add a reference image</span>
                            <ClipboardPaste className="h-3 w-3 opacity-50" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}

          {products.length < MAX_PRODUCTS && (
            <Button variant="outline" className="w-full" onClick={addProduct}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Another Product
            </Button>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </span>
            <Button onClick={() => setStep('scenes')} disabled={!canProceedFromDescribe}>
              Next: Select Scenes <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Scenes */}
      {step === 'scenes' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select which views to generate for {products.length > 1 ? `each of ${products.length} products` : 'your product'}.
            Each scene costs {CREDITS_PER_IMAGE} credits per product.
          </p>
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
          {/* Products summary */}
          {products.map((product, idx) => (
            <Card key={product.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                <span className="font-medium">{product.title}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 font-mono">{product.specification}</p>
            </Card>
          ))}

          {/* Scenes + config */}
          <Card className="p-4 space-y-3">
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
              <span>
                Total: <strong>{totalImages} image{totalImages !== 1 ? 's' : ''}</strong>
                {products.length > 1 && (
                  <span className="text-muted-foreground"> ({products.length} products × {selectedScenes.length} scenes)</span>
                )}
              </span>
              <span>Credits: <strong>{creditCost}</strong></span>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('scenes')}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleGenerate} disabled={isEnqueuing}>
              {isEnqueuing ? (
                <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Enqueuing{products.length > 1 ? ` (${enqueuedCount}/${products.length})` : ''}...</>
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
          <h3 className="text-lg font-semibold">
            Generating {totalImages} image{totalImages !== 1 ? 's' : ''} for {products.length} product{products.length !== 1 ? 's' : ''}...
          </h3>

          {/* Multi-product aggregate progress */}
          {products.length > 1 && jobProductMap.size > 0 && (
            <div className="space-y-2">
              <Progress value={(completedJobs.size / jobProductMap.size) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {completedJobs.size} / {jobProductMap.size} product{jobProductMap.size !== 1 ? 's' : ''} completed
              </p>
              {/* Per-product chips */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {products.map(p => {
                  const jobId = Array.from(jobProductMap.entries()).find(([, title]) => title === p.title)?.[0];
                  const isDone = jobId ? completedJobs.has(jobId) : false;
                  return (
                    <Badge key={p.id} variant={isDone ? 'default' : 'outline'} className="text-xs gap-1">
                      {isDone ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                      {p.title || `Product`}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Single-product progress from activeJob */}
          {products.length === 1 && progress && (
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

          {/* View Results fallback for multi-product */}
          {completedJobs.size > 0 && completedJobs.size < jobProductMap.size && (
            <Button variant="ghost" size="sm" className="mt-4 text-muted-foreground" onClick={() => setStep('results')}>
              View {completedJobs.size} completed result{completedJobs.size !== 1 ? 's' : ''} so far
            </Button>
          )}

          <p className="text-xs text-muted-foreground/70 mt-4">
            Safe to leave — results will appear in your library.
          </p>
        </div>
      )}

      {/* Step 5: Results */}
      {step === 'results' && (
        <>
          {isFreeUser && conversionState.canShowLayer1 && (
            <PostGenerationUpgradeCard
              category={conversionCategory}
              onSeeMore={() => {
                conversionState.dismissLayer1();
                conversionState.openUpgradeDrawer('layer1_cta');
              }}
              onDismiss={conversionState.dismissLayer1}
            />
          )}
          <ResultsStep
            allResults={allResults}
            resultImages={resultImages}
            products={products}
            handleDownload={handleDownload}
            resetQueue={resetQueue}
            setProducts={setProducts}
            setExpandedProducts={setExpandedProducts}
            setSelectedScenes={setSelectedScenes}
            setCompletedJobs={setCompletedJobs}
            setStep={setStep}
            makeProduct={makeProduct}
          />
        </>
      )}
      <UpgradeValueDrawer
        open={conversionState.layer2Open}
        onClose={conversionState.dismissLayer2}
        category={conversionCategory}
      />
      <NoCreditsModal
        open={noCreditsModalOpen}
        onClose={() => setNoCreditsModalOpen(false)}
        category={conversionCategory}
        generationCount={allResults.reduce((sum, r) => sum + r.images.length, 0)}
      />
    </div>
  );
}

// ── Results sub-component with lightbox ─────────────────────────────
function ResultsStep({
  allResults,
  resultImages,
  products,
  handleDownload,
  resetQueue,
  setProducts,
  setExpandedProducts,
  setSelectedScenes,
  setCompletedJobs,
  setStep,
  makeProduct,
}: {
  allResults: { productTitle: string; images: { url: string; label: string }[] }[];
  resultImages: { url: string; label: string }[];
  products: ProductEntry[];
  handleDownload: (url: string, productTitle: string, sceneLabel: string) => void;
  resetQueue: () => void;
  setProducts: React.Dispatch<React.SetStateAction<ProductEntry[]>>;
  setExpandedProducts: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedScenes: React.Dispatch<React.SetStateAction<string[]>>;
  setCompletedJobs: React.Dispatch<React.SetStateAction<Map<string, { images: { url: string; label: string }[]; productTitle: string }>>>;
  setStep: React.Dispatch<React.SetStateAction<Step>>;
  makeProduct: () => ProductEntry;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; label: string }[]>([]);
  const [lightboxProductTitle, setLightboxProductTitle] = useState('');

  const openLightbox = (images: { url: string; label: string }[], idx: number, productTitle: string) => {
    setLightboxImages(images);
    setLightboxProductTitle(productTitle);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const totalCount = allResults.length > 0
    ? allResults.reduce((s, g) => s + g.images.length, 0)
    : resultImages.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {totalCount} image{totalCount !== 1 ? 's' : ''} generated
        </h3>
        <Button variant="outline" onClick={() => { resetQueue(); setProducts([makeProduct()]); setExpandedProducts(new Set()); setSelectedScenes([]); setCompletedJobs(new Map()); setStep('describe'); }}>
          New Generation
        </Button>
      </div>

      {allResults.length > 1 ? (
        allResults.map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Badge variant="outline">{gIdx + 1}</Badge>
              {group.productTitle}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {group.images.map((img, idx) => (
                <Card key={idx} className="overflow-hidden group relative cursor-zoom-in" onClick={() => openLightbox(group.images, idx, group.productTitle)}>
                  <div className="bg-muted/30">
                    <img src={img.url} alt={`${group.productTitle} – ${img.label}`} className="w-full h-auto object-contain" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
                    <span className="text-xs text-white font-medium">{img.label}</span>
                  </div>
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); handleDownload(img.url, group.productTitle, img.label); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </span>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {resultImages.map((img, idx) => (
            <Card key={idx} className="overflow-hidden group relative cursor-zoom-in" onClick={() => openLightbox(resultImages, idx, products[0]?.title || 'Product')}>
              <div className="bg-muted/30">
                <img src={img.url} alt={`${products[0]?.title || 'Product'} – ${img.label}`} className="w-full h-auto object-contain" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pointer-events-none">
                <span className="text-xs text-white font-medium">{img.label}</span>
              </div>
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); handleDownload(img.url, products[0]?.title || 'product', img.label); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </span>
            </Card>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages.map(i => i.url)}
          currentIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
          onDownload={(idx) => handleDownload(lightboxImages[idx].url, lightboxProductTitle, lightboxImages[idx].label)}
          productName={lightboxProductTitle}
        />
      )}
    </div>
  );
}
