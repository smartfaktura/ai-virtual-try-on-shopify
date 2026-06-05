import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, Upload, X, Sparkles, ArrowLeft, Image as ImageLucide,
  Loader2, Package, ClipboardPaste, CheckCircle, XCircle, Clock,
  Pencil, Download, Coins, ArrowRight, Layers, Images, ChevronLeft,
} from 'lucide-react';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useQuery } from '@tanstack/react-query';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useMaterialSwap, type MaterialSwapJobInfo } from '@/hooks/useMaterialSwap';
import { toSignedUrls } from '@/lib/signedUrl';
import { downloadDropAsZip, downloadSingleImage } from '@/lib/dropDownload';
import { TEAM_MEMBERS, getStableStatusMessage } from '@/data/teamData';
import type { Tables } from '@/integrations/supabase/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { ImageLightbox } from '@/components/app/ImageLightbox';
import { ShimmerImage } from '@/components/ui/shimmer-image';
import { CatalogStepper, type StepDef } from '@/components/app/catalog/CatalogStepper';
import { PageHeader } from '@/components/app/PageHeader';
import { cn } from '@/lib/utils';

type UserProduct = Tables<'user_products'>;
type ProductSource = 'library' | 'products' | 'upload' | null;

const RATIO_OPTIONS = ['1:1', '3:4', '4:5', '9:16'] as const;
type RatioOption = typeof RATIO_OPTIONS[number];
const PER_IMAGE_COST = 6;
const MAX_MATERIALS = 30;

const STEP_DEFS: StepDef[] = [
  { number: 1, label: 'Product', icon: ImageLucide },
  { number: 2, label: 'Materials', icon: Layers },
  { number: 3, label: 'Review', icon: Sparkles },
];

interface LibraryPickerItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  createdAt: string;
  searchHaystack: string;
}

interface MaterialItem {
  id: string;
  imageUrl: string;
  label: string;
}

function matchesTokens(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every(t => haystack.includes(t));
}

function fileBasenameLabel(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 60).trim() || 'Material';
}

export default function MaterialSwap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { balance: credits, setBalanceFromServer, refreshBalance: refreshCredits } = useCredits();
  const { upload, isUploading } = useFileUpload();
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  // ── Product (anchor) state ────────────────────────────────────────────
  const initialProductImage = searchParams.get('productImage');
  const initialProductTitle = searchParams.get('productTitle') || '';
  const [productSource, setProductSource] = useState<ProductSource>(initialProductImage ? 'upload' : null);
  const [productUrl, setProductUrl] = useState<string | null>(initialProductImage);
  const [productTitle, setProductTitle] = useState<string>(initialProductTitle || (initialProductImage ? 'Uploaded product' : ''));

  // Pickers
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryVisibleCount, setLibraryVisibleCount] = useState(10);
  const [productSearch, setProductSearch] = useState('');
  const [productVisibleCount, setProductVisibleCount] = useState(10);

  // ── Materials state ───────────────────────────────────────────────────
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [userNote, setUserNote] = useState('');

  // ── Ratios ────────────────────────────────────────────────────────────
  const [selectedRatios, setSelectedRatios] = useState<Set<RatioOption>>(new Set(['4:5']));

  // ── Wizard step ───────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // ── Generation view state ─────────────────────────────────────────────
  const [isGeneratingView, setIsGeneratingView] = useState(false);
  const [generatingJobs, setGeneratingJobs] = useState<MaterialSwapJobInfo[]>([]);
  const [jobStatuses, setJobStatuses] = useState<Record<string, { status: string; error?: string }>>({});
  const [jobResults, setJobResults] = useState<Record<string, string>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [genElapsed, setGenElapsed] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const genStartRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollVersionRef = useRef(0);

  // Hide floating support chat on this route
  useEffect(() => {
    document.body.setAttribute('data-hide-studio-chat', 'true');
    return () => document.body.removeAttribute('data-hide-studio-chat');
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────
  const { data: products = [] } = useQuery({
    queryKey: ['user-products'],
    queryFn: async () => {
      const { data } = await supabase.from('user_products').select('*').order('created_at', { ascending: false });
      return (data || []) as UserProduct[];
    },
    enabled: !!user,
  });

  const { data: libraryItems = [], isLoading: libraryLoading } = useQuery({
    queryKey: ['material-swap-library-items'],
    queryFn: async () => {
      const [fsResult, jobsResult] = await Promise.all([
        supabase.from('freestyle_generations').select('id, image_url, prompt, user_prompt, workflow_label, aspect_ratio, created_at')
          .order('created_at', { ascending: false }).limit(200),
        supabase.from('generation_jobs')
          .select('id, results, created_at, status, ratio, scene_name, model_name, workflow_slug, prompt_final, product_name, workflows(name), user_products(title)')
          .eq('status', 'completed').order('created_at', { ascending: false }).limit(200),
      ]);

      const items: LibraryPickerItem[] = [];
      for (const f of fsResult.data || []) {
        const rawTitle = f.prompt?.slice(0, 40)?.trim();
        const title = rawTitle || 'Freestyle';
        const subtitle = (f as any).aspect_ratio || f.workflow_label || 'Freestyle';
        const haystack = [title, f.prompt, f.user_prompt, f.workflow_label]
          .filter(Boolean).join(' ').toLowerCase();
        items.push({ id: `fs-${f.id}`, imageUrl: f.image_url, title, subtitle, createdAt: f.created_at, searchHaystack: haystack });
      }
      for (const job of jobsResult.data || []) {
        const results = job.results as unknown;
        if (!Array.isArray(results)) continue;
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const url = typeof r === 'string' ? r : r?.url || r?.image_url;
          if (!url || url.startsWith('data:')) continue;
          const workflowName = (job.workflows as { name?: string } | null)?.name || '';
          const productTitleStr = (job.user_products as { title?: string } | null)?.title || '';
          const jobAny = job as any;
          const title =
            productTitleStr ||
            jobAny.product_name ||
            workflowName ||
            jobAny.scene_name ||
            'Generated image';
          const subtitle = jobAny.ratio || workflowName || jobAny.scene_name || 'Generated';
          const haystack = [
            title, productTitleStr, workflowName,
            jobAny.product_name, jobAny.scene_name, jobAny.model_name,
            jobAny.workflow_slug, jobAny.prompt_final,
          ].filter(Boolean).join(' ').toLowerCase();
          items.push({
            id: `job-${job.id}-${i}`,
            imageUrl: url,
            title,
            subtitle,
            createdAt: job.created_at,
            searchHaystack: haystack,
          });
        }
      }
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const urls = await toSignedUrls(items.map(i => i.imageUrl));
      return items.map((item, idx) => ({ ...item, imageUrl: urls[idx] }));
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  const filteredLibrary = libraryItems.filter(i => matchesTokens(i.searchHaystack, librarySearch));
  const filteredProducts = products.filter(p => {
    const haystack = [
      p.title, p.description, p.product_type, p.color, p.materials,
      p.sku, p.dimensions, p.weight, (p.tags || []).join(' '),
    ].filter(Boolean).join(' ').toLowerCase();
    return matchesTokens(haystack, productSearch);
  });

  // ── Hook ──────────────────────────────────────────────────────────────
  const { generate, isGenerating, progress } = useMaterialSwap();

  // ── Polling ───────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    pollVersionRef.current++;
    if (pollRef.current) { clearTimeout(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (!isGeneratingView) return;
    const i = setInterval(() => setGenElapsed(Math.floor((Date.now() - genStartRef.current) / 1000)), 1000);
    return () => clearInterval(i);
  }, [isGeneratingView]);

  useEffect(() => {
    if (!isGeneratingView) return;
    const i = setInterval(() => setTeamIndex(p => (p + 1) % TEAM_MEMBERS.length), 4000);
    return () => clearInterval(i);
  }, [isGeneratingView]);

  const startPolling = useCallback((jobs: MaterialSwapJobInfo[]) => {
    const version = ++pollVersionRef.current;
    const jobIds = jobs.map(j => j.jobId);

    const poll = async () => {
      if (pollVersionRef.current !== version) return;
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token || SUPABASE_KEY;
      const idsFilter = jobIds.map(id => `"${id}"`).join(',');
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,error_message,result`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
        );
        if (!res.ok || pollVersionRef.current !== version) return;
        const rows = await res.json();
        const statuses: Record<string, { status: string; error?: string }> = {};
        const results: Record<string, string> = {};
        for (const row of rows) {
          statuses[row.id] = { status: row.status, error: row.error_message || undefined };
          const imgs = row?.result?.images;
          if (Array.isArray(imgs) && imgs[0]) results[row.id] = imgs[0];
        }
        for (const id of jobIds) if (!statuses[id]) statuses[id] = { status: 'queued' };
        setJobStatuses(statuses);
        if (Object.keys(results).length > 0) setJobResults(prev => ({ ...prev, ...results }));

        const allDone = jobIds.every(id => ['completed', 'failed', 'cancelled'].includes(statuses[id]?.status));
        if (allDone) {
          const completed = jobIds.filter(id => statuses[id]?.status === 'completed').length;
          const failed = jobIds.filter(id => statuses[id]?.status === 'failed').length;
          stopPolling();
          refreshCredits();
          if (completed > 0) toast.success(`${completed} material${completed > 1 ? 's' : ''} ready! ${failed > 0 ? `(${failed} failed)` : ''}`);
          else toast.error('All generations failed. Credits have been refunded.');
          return;
        }
      } catch { /* keep polling */ }
      if (pollVersionRef.current === version) pollRef.current = setTimeout(poll, 3000);
    };
    poll();
  }, [refreshCredits, stopPolling]);

  // ── Derived ───────────────────────────────────────────────────────────
  const totalImages = materials.length * selectedRatios.size;
  const totalCost = totalImages * PER_IMAGE_COST;
  const canGenerate = !!productUrl && materials.length > 0 && selectedRatios.size > 0 && !isGenerating;

  // ── Handlers: product picker ─────────────────────────────────────────
  const pickLibrary = (item: LibraryPickerItem) => {
    setProductUrl(item.imageUrl);
    setProductTitle(item.title || 'Library image');
  };
  const pickProduct = (p: UserProduct) => {
    if (!p.image_url) return;
    setProductUrl(p.image_url);
    setProductTitle(p.title || 'Product');
  };
  const handleProductUploadFile = useCallback(async (file: File) => {
    const url = await upload(file);
    if (url) { setProductUrl(url); setProductTitle(fileBasenameLabel(file.name)); }
  }, [upload]);

  // Clipboard paste support for product upload
  useEffect(() => {
    if (productSource !== 'upload' || productUrl) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleProductUploadFile(file);
          return;
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [productSource, productUrl, handleProductUploadFile]);

  // ── Handlers: materials ───────────────────────────────────────────────
  const handleMaterialFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (list.length === 0) return;
    const remaining = MAX_MATERIALS - materials.length;
    if (remaining <= 0) {
      toast.error(`Max ${MAX_MATERIALS} materials per batch`);
      return;
    }
    const toUpload = list.slice(0, remaining);
    for (const file of toUpload) {
      const url = await upload(file);
      if (url) {
        setMaterials(prev => prev.concat({
          id: crypto.randomUUID(),
          imageUrl: url,
          label: fileBasenameLabel(file.name),
        }));
      }
    }
  }, [upload, materials.length]);

  // Clipboard paste support for materials (when on step 2)
  useEffect(() => {
    if (currentStep !== 2) return;
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleMaterialFiles(files);
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [currentStep, handleMaterialFiles]);

  const removeMaterial = (id: string) =>
    setMaterials(prev => prev.filter(m => m.id !== id));
  const updateMaterialLabel = (id: string, label: string) =>
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, label } : m));

  const toggleRatio = (r: RatioOption) => {
    const next = new Set(selectedRatios);
    if (next.has(r)) {
      if (next.size > 1) next.delete(r);
    } else next.add(r);
    setSelectedRatios(next);
  };

  const handleGenerate = async () => {
    if (!canGenerate || !productUrl) return;
    if (totalCost > credits) { setNoCreditsOpen(true); return; }

    const result = await generate({
      productImageUrl: productUrl,
      productTitle: productTitle || 'product',
      materials: materials.map(m => ({ id: m.id, imageUrl: m.imageUrl, label: (m.label || 'Material').trim() })),
      ratios: Array.from(selectedRatios),
    });

    if (result && result.jobs.length > 0) {
      if (result.newBalance !== null) setBalanceFromServer(result.newBalance);
      setGeneratingJobs(result.jobs);
      setJobStatuses(Object.fromEntries(result.jobs.map(j => [j.jobId, { status: 'queued' }])));
      setJobResults({});
      genStartRef.current = Date.now();
      setGenElapsed(0);
      setTeamIndex(0);
      setIsGeneratingView(true);
      startPolling(result.jobs);
    }
  };

  // ── Generating view helpers ───────────────────────────────────────────
  const genCompletedCount = Object.values(jobStatuses).filter(s => s.status === 'completed').length;
  const genFailedCount = Object.values(jobStatuses).filter(s => s.status === 'failed').length;
  const genTotalCount = generatingJobs.length;
  const genAllDone = genTotalCount > 0 && Object.values(jobStatuses).every(s => ['completed', 'failed', 'cancelled'].includes(s.status));
  const genProgressPercent = genTotalCount > 0 ? (genCompletedCount / genTotalCount) * 100 : 0;
  const estimatedTotal = genTotalCount * 30;
  const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };
  const currentMember = TEAM_MEMBERS[teamIndex % TEAM_MEMBERS.length];

  // ── Generating view ───────────────────────────────────────────────────
  if (isGeneratingView) {
    const resultEntries = generatingJobs.map(job => ({ job, url: jobResults[job.jobId] })).filter(e => !!e.url) as Array<{ job: MaterialSwapJobInfo; url: string }>;
    const resultUrls = resultEntries.map(e => e.url);
    const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9À-ÿ_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
    const buildFileName = (materialLabel: string | undefined, idx: number) => {
      const p = productTitle ? sanitize(productTitle) : '';
      const m = materialLabel ? sanitize(materialLabel) : '';
      if (p && m) return `${p}_${m}`;
      if (!p && m) return `material-swap_${m}`;
      if (p && !m) return `${p}_material_${idx + 1}`;
      return `material-swap_${idx + 1}`;
    };


    return (
      <div className="min-h-screen">
        <SEOHead title={genAllDone && genCompletedCount > 0 ? 'Your re-skinned product' : 'Swapping materials…'} description="Your material swaps are being created." />
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
          <div className="text-center space-y-5">
            {productUrl && (
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-border bg-muted shadow-sm">
                <img src={getOptimizedUrl(productUrl, { quality: 70 })} alt={productTitle} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-2">
              {genAllDone && genCompletedCount > 0 && productTitle && (
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{productTitle}</p>
              )}
              <h1 className="text-2xl font-bold text-foreground">
                {genAllDone && genCompletedCount > 0 ? 'Your re-skinned product' : 'Swapping materials…'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {genAllDone && genCompletedCount > 0
                  ? `${genCompletedCount} new material${genCompletedCount !== 1 ? 's' : ''} ready — same shape, lighting and scene`
                  : `Generating ${genTotalCount} variant${genTotalCount !== 1 ? 's' : ''} of the same product`}
              </p>
            </div>
          </div>


          {!genAllDone && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {genCompletedCount} of {genTotalCount} complete
                    {genFailedCount > 0 && <span className="text-destructive ml-1">({genFailedCount} failed)</span>}
                  </span>
                  <span className="font-mono text-muted-foreground">{formatTime(genElapsed)}</span>
                </div>
                <Progress value={Math.max(genProgressPercent, 5)} className="h-2 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-linear" />
                <p className="text-xs text-muted-foreground">Est. {formatTime(Math.round(estimatedTotal * 0.8))} – {formatTime(Math.round(estimatedTotal * 1.2))} total</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Materials</p>
                <div className="flex flex-wrap gap-2">
                  {generatingJobs.map(job => {
                    const s = jobStatuses[job.jobId];
                    const status = s?.status || 'queued';
                    return (
                      <div key={job.jobId} className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border text-sm transition-all ${
                        status === 'completed' ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400'
                        : status === 'failed' ? 'border-destructive/30 bg-destructive/5 text-destructive'
                        : status === 'processing' ? 'border-primary/30 bg-primary/5 text-primary'
                        : 'border-border bg-muted/30 text-muted-foreground'}`}>
                        <div className={`w-8 h-8 rounded-lg overflow-hidden bg-muted/60 shrink-0 ${status === 'processing' ? 'ring-2 ring-primary/40 ring-offset-1 ring-offset-background animate-pulse' : ''}`}>
                          {job.materialImageUrl ? (
                            <img src={getOptimizedUrl(job.materialImageUrl, { quality: 60 })} alt={job.materialLabel} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Layers className="w-3.5 h-3.5 opacity-60" /></div>
                          )}
                        </div>
                        <span className="font-medium truncate max-w-[160px]">{job.materialLabel}</span>
                        {job.ratio !== '1:1' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 opacity-70">{job.ratio}</span>}
                        {status === 'completed' ? <CheckCircle className="w-4 h-4 ml-auto" /> : status === 'failed' ? <XCircle className="w-4 h-4 ml-auto" /> : status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin ml-auto" /> : <Clock className="w-4 h-4 ml-auto opacity-60" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarImage src={getOptimizedUrl(currentMember.avatar, { quality: 60 })} alt={currentMember.name} />
                  <AvatarFallback className="text-xs">{currentMember.name[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground italic">
                  {currentMember.name} is {getStableStatusMessage(currentMember, teamIndex).toLowerCase()}
                </p>
              </div>
            </div>
          )}

          {!genAllDone && (
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => { stopPolling(); setIsGeneratingView(false); toast.info('Generation continues in the background. Check your library for results.'); }} className="text-muted-foreground">
                Continue in background
              </Button>
            </div>
          )}

          {genAllDone && genCompletedCount > 0 && (
            <div className="space-y-6">
              {resultUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {resultEntries.map((entry, idx) => (
                    <div key={entry.job.jobId} className="group relative rounded-2xl overflow-hidden border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
                      <button type="button" onClick={() => setLightboxIndex(idx)} className="block w-full text-left">
                        <div className="aspect-square overflow-hidden bg-muted">
                          <img src={getOptimizedUrl(entry.url, { quality: 75 })} alt={entry.job.materialLabel}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border">
                          <span className="text-xs font-medium text-foreground truncate flex-1">{entry.job.materialLabel}</span>
                          {entry.job.ratio !== '1:1' && <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">{entry.job.ratio}</span>}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await downloadSingleImage(entry.url, buildFileName(entry.job.materialLabel, idx));
                          } catch {
                            toast.error('Download failed');
                          }
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur border border-border flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background shadow-sm"
                        aria-label="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

              )}

              {genFailedCount > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                  {genFailedCount} swap{genFailedCount !== 1 ? 's' : ''} failed and credits were refunded
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="pill" onClick={() => {
                  // Keep the product, clear materials, jump back to material step
                  setMaterials([]);
                  setCurrentStep(2);
                  setIsGeneratingView(false); setGeneratingJobs([]); setJobStatuses({}); setJobResults({});
                }}>
                  Generate more
                </Button>
                {resultEntries.length >= 2 && (
                  <Button
                    variant="outline"
                    size="pill"
                    onClick={async () => {
                      const t = toast.loading(`Packaging ${resultEntries.length} images…`);
                      try {
                        await downloadDropAsZip(
                          resultEntries.map((e) => ({
                            url: e.url,
                            workflow_name: 'Material Swap',
                            product_title: productTitle || 'Product',
                            scene_name: e.job.materialLabel,
                          })),
                          `material-swap-${new Date().toISOString().slice(0, 10)}`,
                        );
                        toast.dismiss(t);
                        toast.success(`Downloaded ${resultEntries.length} images`);
                      } catch {
                        toast.dismiss(t);
                        toast.error('Download failed');
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />Download all ({resultEntries.length})
                  </Button>
                )}
                <Button variant="outline" size="pill" onClick={() => { setIsGeneratingView(false); navigate('/app/library'); }}>
                  View in Library
                </Button>
              </div>
            </div>
          )}

          {genAllDone && genCompletedCount === 0 && (
            <div className="text-center space-y-3">
              <p className="text-sm text-destructive">All generations failed. Credits have been refunded.</p>
              <Button variant="outline" onClick={() => setIsGeneratingView(false)}>Try Again</Button>
            </div>
          )}
        </div>

        {lightboxIndex !== null && resultUrls.length > 0 && (
          <ImageLightbox
            images={resultUrls}
            currentIndex={lightboxIndex}
            open={lightboxIndex !== null}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
            onDownload={async (idx) => {
              const url = resultUrls[idx]; if (!url) return;
              try {
                await downloadSingleImage(url, buildFileName(resultEntries[idx]?.job.materialLabel, idx));
              } catch {
                toast.error('Download failed');
              }
            }}

            onEdit={(idx) => {
              const url = resultUrls[idx]; if (!url) return;
              setLightboxIndex(null);
              navigate(`/app/freestyle?editImage=${encodeURIComponent(url)}&imageRole=edit`);
            }}
            onGenerateAngles={(idx) => {
              const url = resultUrls[idx]; if (!url) return;
              setLightboxIndex(null);
              navigate(`/app/perspectives?source=${encodeURIComponent(url)}`);
            }}
            productName={generatingJobs[lightboxIndex]?.materialLabel}
          />
        )}
      </div>
    );
  }

  // ── Step guards ───────────────────────────────────────────────────────
  const canAdvanceFrom1 = !!productUrl;
  const canAdvanceFrom2 = materials.length > 0;
  const goToStep = (s: 1 | 2 | 3) => {
    if (s === 2 && !canAdvanceFrom1) return;
    if (s === 3 && (!canAdvanceFrom1 || !canAdvanceFrom2)) return;
    setCurrentStep(s);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const creditsShort = Math.max(0, totalCost - credits);
  const canAfford = credits >= totalCost;

  const canNavigateTo = (n: number) =>
    n === 1 ||
    (n === 2 && canAdvanceFrom1) ||
    (n === 3 && canAdvanceFrom1 && canAdvanceFrom2);

  // ── Setup view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-36 overflow-x-clip max-w-full min-w-0">
      <SEOHead title="Material Swap" description="Keep the same product and scene, swap in any upholstery, fabric, or colour." />

      <Button variant="ghost" size="sm" onClick={() => navigate('/app/workflows')} className="gap-1.5 -ml-2 self-start">
        <ArrowLeft className="w-4 h-4" />Visual Studio
      </Button>

      <PageHeader
        title="Material Swap"
        subtitle="Same product, different material or colour"
      >
        <span />
      </PageHeader>

      <CatalogStepper
        steps={STEP_DEFS}
        currentStep={currentStep}
        canNavigateTo={canNavigateTo}
        onStepClick={(s) => goToStep(s as 1 | 2 | 3)}
      />

      {/* ═══════════ STEP 1: PRODUCT ═══════════ */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add your product image</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose where to bring it from — we'll keep its shape, lighting and scene exactly as-is</p>
          </div>

          {/* Selected product preview */}
          {productUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
              <img src={getOptimizedUrl(productUrl, { quality: 70 })} alt={productTitle} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{productTitle || 'Product'}</p>
                <p className="text-xs text-muted-foreground truncate">Geometry, lighting and scene will stay identical</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setProductUrl(null); setProductTitle(''); setProductSource(null); }}>
                <X className="w-4 h-4 mr-1" />Change
              </Button>
            </div>
          )}

          {/* Method chooser cards — only when nothing selected AND no source picked */}
          {!productUrl && !productSource && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { key: 'library' as const, label: 'Library', helper: 'Reuse a visual you already generated', Icon: Images },
                { key: 'products' as const, label: 'Products', helper: 'Pick from your saved products', Icon: Package },
                { key: 'upload' as const, label: 'Upload', helper: 'Drop a new photo or paste a URL', Icon: Upload },
              ]).map(({ key, label, helper, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setProductSource(key)}
                  className="group flex flex-col items-start text-left gap-3 p-5 min-h-[140px] rounded-2xl border border-border bg-card hover:border-foreground/30 hover:bg-accent/30 active:scale-[0.99] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{helper}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Active picker — after source chosen, still no product picked */}
          {!productUrl && productSource && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setProductSource(null)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />Change source
              </button>


              {/* LIBRARY */}
              {productSource === 'library' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="relative py-1 px-1">
                    <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name, prompt, scene, model…" value={librarySearch}
                      onChange={e => { setLibrarySearch(e.target.value); setLibraryVisibleCount(10); }}
                      className="pl-11 pr-4 h-11 rounded-full text-sm" />
                  </div>
                  {libraryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
                      {filteredLibrary.slice(0, libraryVisibleCount).map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => pickLibrary(item)}
                          className="relative rounded-xl border-2 border-transparent hover:border-foreground/20 overflow-hidden transition-all text-left cursor-pointer"
                        >
                          <div className="aspect-square bg-muted overflow-hidden">
                            <ShimmerImage
                              src={getOptimizedUrl(item.imageUrl, { quality: 70 })}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="h-[52px] flex flex-col justify-center px-2.5">
                            <p className="text-xs font-medium truncate leading-tight">{item.title || '\u00A0'}</p>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-tight">{item.subtitle || '\u00A0'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {!libraryLoading && filteredLibrary.length > libraryVisibleCount && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" onClick={() => setLibraryVisibleCount(c => c + 10)}>
                        Load more ({filteredLibrary.length - libraryVisibleCount} remaining)
                      </Button>
                    </div>
                  )}
                  {!libraryLoading && filteredLibrary.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      No generated images found yet
                    </p>
                  )}
                </div>
              )}

              {/* PRODUCTS */}
              {productSource === 'products' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="relative py-1 px-1">
                    <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by name, type, color, SKU, tag…" value={productSearch}
                      onChange={e => { setProductSearch(e.target.value); setProductVisibleCount(10); }}
                      className="pl-11 pr-4 h-11 rounded-full text-sm" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
                    {filteredProducts.slice(0, productVisibleCount).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => pickProduct(p)}
                        disabled={!p.image_url}
                        className="relative rounded-xl border-2 border-transparent hover:border-foreground/20 overflow-hidden transition-all text-left cursor-pointer disabled:opacity-40"
                      >
                        <div className="aspect-square bg-muted overflow-hidden">
                          {p.image_url ? (
                            <ShimmerImage
                              src={getOptimizedUrl(p.image_url, { quality: 70 })}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                          )}
                        </div>
                        <div className="h-[52px] flex flex-col justify-center px-2.5">
                          <p className="text-xs font-medium truncate leading-tight">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-tight">{p.product_type || '\u00A0'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {filteredProducts.length > productVisibleCount && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" onClick={() => setProductVisibleCount(c => c + 10)}>
                        Load more ({filteredProducts.length - productVisibleCount} remaining)
                      </Button>
                    </div>
                  )}
                  {filteredProducts.length === 0 && products.length > 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">No products match your search</p>
                  )}
                  {products.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">No products in your library yet</h3>
                      <Button size="sm" onClick={() => navigate('/app/products/new')}>Add your first product</Button>
                    </div>
                  )}
                </div>
              )}

              {/* UPLOAD */}
              {productSource === 'upload' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <label
                    onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.type.startsWith('image/')) handleProductUploadFile(file); }}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                    {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Upload the product photo</p>
                          <p className="text-xs text-muted-foreground">Drag & drop, paste, or click to browse</p>
                          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60 mt-1.5">
                            <ClipboardPaste className="w-3 h-3" />⌘V / Ctrl+V to paste from clipboard
                          </p>
                        </div>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" disabled={isUploading}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleProductUploadFile(file); }} />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ STEP 2: MATERIALS ═══════════ */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add fabric / colour references</h2>
              <p className="text-xs text-muted-foreground mt-1">
                One swatch per variant. The product's shape, scene and lighting stay locked
              </p>
            </div>
            <Badge variant={materials.length > 0 ? 'default' : 'secondary'}>
              {materials.length} / {MAX_MATERIALS}
            </Badge>
          </div>

          <label
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleMaterialFiles(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
            {isUploading ? <Loader2 className="w-7 h-7 animate-spin text-primary" /> : (
              <>
                <Upload className="w-7 h-7 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Add material swatches</p>
                  <p className="text-xs text-muted-foreground">Drop, paste, or click to add multiple at once</p>
                </div>
              </>
            )}
            <input type="file" accept="image/*" multiple className="hidden" disabled={isUploading || materials.length >= MAX_MATERIALS}
              onChange={(e) => { if (e.target.files) handleMaterialFiles(e.target.files); e.currentTarget.value = ''; }} />
          </label>

          {materials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {materials.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2 pr-3 rounded-xl border border-border bg-card">
                  <img src={getOptimizedUrl(m.imageUrl, { quality: 60 })} alt={m.label} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <Input
                    value={m.label}
                    onChange={e => updateMaterialLabel(m.id, e.target.value)}
                    placeholder="Material name"
                    className="h-8 text-sm flex-1 min-w-0"
                  />
                  <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => removeMaterial(m.id)} aria-label="Remove">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Extra direction (optional)
            </label>
            <Textarea
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              placeholder="e.g. match the weave texture exactly, ignore the swatch's background colour"
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aspect ratios
            </label>
            <div className="flex flex-wrap gap-2">
              {RATIO_OPTIONS.map(r => {
                const active = selectedRatios.has(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRatio(r)}
                    className={cn(
                      'px-3 h-8 rounded-full text-xs font-medium border transition-colors',
                      active
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ STEP 3: REVIEW ═══════════ */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <h2 className="text-lg font-semibold text-foreground">Review and generate</h2>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4 md:gap-5 items-start">
            {/* Left: summary */}
            <div className="space-y-4">
              {/* Product card */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product anchor</h3>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => goToStep(1)}>
                    <Pencil className="w-3 h-3 mr-1" />Edit
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  {productUrl && (
                    <img src={getOptimizedUrl(productUrl, { quality: 70 })} alt={productTitle} className="w-20 h-20 rounded-lg object-cover border border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{productTitle || 'Product'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Geometry, scene and lighting locked</p>
                  </div>
                </div>
              </div>

              {/* Materials card */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Materials ({materials.length})</h3>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => goToStep(2)}>
                    <Pencil className="w-3 h-3 mr-1" />Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {materials.map(m => (
                    <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 border border-border">
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                        <img src={getOptimizedUrl(m.imageUrl, { quality: 60 })} alt={m.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: cost summary */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 md:sticky md:top-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Materials</span><span className="text-foreground font-medium">{materials.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ratios</span><span className="text-foreground font-medium">{Array.from(selectedRatios).join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Images</span><span className="text-foreground font-medium">{totalImages}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cost per image</span><span className="text-foreground font-medium">{PER_IMAGE_COST} credits</span></div>
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-foreground">{totalCost} credits</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Your balance</span>
                  <span className="text-muted-foreground">{credits} credits</span>
                </div>
                {totalCost <= credits ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">After generation</span>
                    <span className="text-muted-foreground">{credits - totalCost} credits</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <span>You need {creditsShort} more credit{creditsShort !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              {isGenerating && progress > 0 && <Progress value={progress} className="h-1.5 rounded-full" />}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ FLOATING STICKY BAR ═══════════ */}
      <div className="sticky bottom-4 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
          {/* Mobile */}
          <div className="flex flex-col gap-2 p-3 sm:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={cn(
                      'w-1.5 h-1.5 rounded-full transition-colors',
                      s === currentStep ? 'bg-primary scale-125' : s < currentStep ? 'bg-primary/40' : 'bg-border'
                    )} />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {STEP_DEFS.find(s => s.number === currentStep)?.label}
                </span>
              </div>
              {totalCost > 0 && (
                <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted border border-border">
                  <Coins className="w-3 h-3 text-primary" />
                  <span className={cn('font-bold', canAfford ? 'text-foreground' : 'text-destructive')}>{totalCost}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button variant="outline" size="pill" className="flex-shrink-0"
                  onClick={() => goToStep((currentStep - 1) as 1 | 2)}>Back</Button>
              )}
              {currentStep < 3 ? (
                <Button size="pill"
                  disabled={(currentStep === 1 && !canAdvanceFrom1) || (currentStep === 2 && !canAdvanceFrom2)}
                  onClick={() => goToStep((currentStep + 1) as 2 | 3)}
                  className="gap-1.5 flex-1">
                  Continue<ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="pill"
                  disabled={isGenerating || (canAfford && !canGenerate)}
                  onClick={!canAfford ? () => setNoCreditsOpen(true) : handleGenerate}
                  className="gap-1.5 flex-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGenerating ? 'Generating…' : !canAfford ? 'Upgrade' : `Generate ${totalImages || ''}`.trim()}
                </Button>
              )}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden sm:flex items-center justify-between gap-3 p-3 sm:p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(s => (
                  <div key={s} className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    s === currentStep ? 'bg-primary scale-125' : s < currentStep ? 'bg-primary/40' : 'bg-border'
                  )} />
                ))}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {STEP_DEFS.find(s => s.number === currentStep)?.label}
              </span>
              <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                {materials.length > 0 && (
                  <span className="font-medium text-foreground">
                    {materials.length} material{materials.length !== 1 ? 's' : ''}
                  </span>
                )}
                {totalImages > 0 && (
                  <>
                    <span>·</span>
                    <span className="font-bold text-foreground">{totalImages} img{totalImages !== 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>

            {totalCost > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted border border-border">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <span className={cn('font-bold', canAfford ? 'text-foreground' : 'text-destructive')}>{totalCost}</span>
                  <span className="text-muted-foreground">cr</span>
                </div>
                {!canAfford && <span className="text-xs text-destructive font-medium">Not enough credits</span>}
              </div>
            )}

            <div className="flex items-center gap-2 flex-shrink-0">
              {currentStep > 1 && (
                <Button variant="outline" size="pill" onClick={() => goToStep((currentStep - 1) as 1 | 2)}>Back</Button>
              )}
              {currentStep < 3 ? (
                <Button size="pill"
                  disabled={(currentStep === 1 && !canAdvanceFrom1) || (currentStep === 2 && !canAdvanceFrom2)}
                  onClick={() => goToStep((currentStep + 1) as 2 | 3)}
                  className="gap-1.5">
                  Continue<ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="pill"
                  disabled={isGenerating || (canAfford && !canGenerate)}
                  onClick={!canAfford ? () => setNoCreditsOpen(true) : handleGenerate}
                  className="gap-1.5">
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isGenerating ? 'Generating…' : !canAfford ? 'Upgrade for more credits' : `Generate ${totalImages} image${totalImages !== 1 ? 's' : ''}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
    </div>
  );
}
