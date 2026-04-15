import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LowCreditsBanner } from '@/components/app/LowCreditsBanner';
import {
  Search, Upload, X, Sparkles, Layers, ZoomIn, RotateCcw,
  ArrowLeft, ArrowRight, Maximize, ImageIcon, Check, Plus, Loader2,
  Package, Image as ImageLucide, Info, ClipboardPaste, CheckCircle, XCircle,
  Clock, Focus, CornerUpLeft, CornerUpRight, ArrowDown,
} from 'lucide-react';
import { toast } from '@/lib/brandedToast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import { NoCreditsModal } from '@/components/app/NoCreditsModal';
import { useQuery } from '@tanstack/react-query';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useGeneratePerspectives } from '@/hooks/useGeneratePerspectives';
import type { PerspectiveJobInfo } from '@/hooks/useGeneratePerspectives';
import { toSignedUrls } from '@/lib/signedUrl';
import { TEAM_MEMBERS } from '@/data/teamData';
import type { Tables } from '@/integrations/supabase/types';
import { getOptimizedUrl } from '@/lib/imageOptimization';

type UserProduct = Tables<'user_products'>;
type SourceType = 'library' | 'product' | 'scratch';

// ── Variation type definitions ──────────────────────────────────────────

interface ReferenceUploadConfig {
  prompt: string;
  recommended: boolean;
}

interface VariationType {
  id: string;
  label: string;
  instruction: string;
  category: string;
  referenceUpload: ReferenceUploadConfig | null;
}

const FALLBACK_VARIATIONS: VariationType[] = [
  { id: 'closeup', label: 'Close-up / Macro', instruction: 'Extreme close-up macro detail shot...', category: 'detail', referenceUpload: { prompt: 'Upload a close-up reference of your product for best results (optional)', recommended: true } },
  { id: 'back', label: 'Back Angle', instruction: 'Rear view...', category: 'angle', referenceUpload: { prompt: 'Upload a back view of your product for best results (optional)', recommended: true } },
  { id: 'left', label: 'Left Side', instruction: 'Left side profile...', category: 'angle', referenceUpload: { prompt: 'Upload a left side view of your product for best results (optional)', recommended: true } },
  { id: 'right', label: 'Right Side', instruction: 'Right side profile...', category: 'angle', referenceUpload: { prompt: 'Upload a right side view of your product for best results (optional)', recommended: true } },
  { id: 'wide', label: 'Wide / Environment', instruction: 'Pulled-back contextual shot...', category: 'context', referenceUpload: { prompt: 'Upload a wide/environment reference of your product for best results (optional)', recommended: true } },
  { id: 'supermacro', label: 'Super Macro / Texture', instruction: 'Ultra-extreme close-up focusing on a single micro-detail...', category: 'detail', referenceUpload: null },
  { id: 'front-left-45', label: '45° Front-Left', instruction: 'Classic three-quarter angle from the front-left...', category: 'angle', referenceUpload: null },
  { id: 'front-right-45', label: '45° Front-Right', instruction: 'Three-quarter angle from the front-right...', category: 'angle', referenceUpload: null },
  { id: 'topdown', label: 'Top-Down / Flat Lay', instruction: 'Direct overhead bird\'s-eye view...', category: 'top_down', referenceUpload: null },
];

const VARIATION_ICONS: Record<string, typeof ZoomIn> = {
  'Close-up / Macro': ZoomIn,
  'Back Angle': RotateCcw,
  'Left Side': ArrowLeft,
  'Right Side': ArrowRight,
  'Wide / Environment': Maximize,
  'Super Macro / Texture': Focus,
  '45° Front-Left': CornerUpLeft,
  '45° Front-Right': CornerUpRight,
  'Top-Down / Flat Lay': ArrowDown,
};

const ASPECT_RATIOS = ['1:1', '3:4', '4:5', '9:16'] as const;

// ── Library item type for the picker ────────────────────────────────────
interface LibraryPickerItem {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
}

export default function Perspectives() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { balance: credits, refreshBalance: refreshCredits, setBalanceFromServer } = useCredits();
  const { upload, isUploading } = useFileUpload();
  const [noCreditsOpen, setNoCreditsOpen] = useState(false);

  // ── State ──────────────────────────────────────────────────────────────
  const initialSource: SourceType | null = searchParams.get('source') ? 'scratch' : null;
  const [sourceType, setSourceType] = useState<SourceType | null>(initialSource);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());
  const [selectedVariations, setSelectedVariations] = useState<Set<number>>(new Set());
  const [selectedRatios, setSelectedRatios] = useState<Set<string>>(new Set());
  const quality = 'high' as const;
  const [productSearch, setProductSearch] = useState('');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryVisibleCount, setLibraryVisibleCount] = useState(30);
  
  const [productVisibleCount, setProductVisibleCount] = useState(10);
  const [referenceImages, setReferenceImages] = useState<Record<number, string>>({});
  const [uploadingRefIndex, setUploadingRefIndex] = useState<number | null>(null);

  // Direct upload (from scratch)
  const [directUploadUrl, setDirectUploadUrl] = useState<string | null>(
    searchParams.get('source') || null
  );

  // ── Generating progress state ─────────────────────────────────────────
  const [isGeneratingView, setIsGeneratingView] = useState(false);
  const [generatingJobs, setGeneratingJobs] = useState<PerspectiveJobInfo[]>([]);
  const [jobStatuses, setJobStatuses] = useState<Record<string, { status: string; error?: string }>>({});
  const [genElapsed, setGenElapsed] = useState(0);
  const [teamIndex, setTeamIndex] = useState(0);
  const genStartRef = useRef<number>(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollVersionRef = useRef(0);

  // ── Source type change handler ─────────────────────────────────────────
  const handleSourceTypeChange = (type: SourceType | null) => {
    setSourceType(type);
    setSelectedProductIds(new Set());
    setSelectedLibraryIds(new Set());
    setDirectUploadUrl(null);
    setLibraryVisibleCount(10);
    setProductVisibleCount(10);
  };

  // ── Fetch workflow config from DB ─────────────────────────────────────
  const { data: workflow } = useQuery({
    queryKey: ['workflow-perspectives'],
    queryFn: async () => {
      const { data } = await supabase
        .from('workflows')
        .select('*')
        .eq('name', 'Picture Perspectives')
        .single();
      return data;
    },
  });

  const variations: VariationType[] = useMemo(() => {
    if (!workflow?.generation_config) return FALLBACK_VARIATIONS;
    const config = workflow.generation_config as Record<string, unknown>;
    const strategy = config.variation_strategy as { variations: VariationType[] } | undefined;
    if (!strategy?.variations) return FALLBACK_VARIATIONS;
    return strategy.variations.map((v, i) => ({ ...v, id: `var-${i}` }));
  }, [workflow]);

  // ── Fetch user products ───────────────────────────────────────────────
  const { data: products = [] } = useQuery({
    queryKey: ['user-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_products')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []) as UserProduct[];
    },
    enabled: !!user,
  });

  // ── Fetch library items ───────────────────────────────────────────────
  const { data: libraryItems = [], isLoading: libraryLoading } = useQuery({
    queryKey: ['perspectives-library-items'],
    queryFn: async () => {
      const [fsResult, jobsResult] = await Promise.all([
        supabase
          .from('freestyle_generations')
          .select('id, image_url, prompt, created_at')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('generation_jobs')
          .select('id, results, created_at, status, workflows(name), user_products(title)')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      const items: LibraryPickerItem[] = [];

      // Freestyle items
      for (const f of fsResult.data || []) {
        items.push({
          id: `fs-${f.id}`,
          imageUrl: f.image_url,
          title: f.prompt?.slice(0, 40) || 'Freestyle',
          createdAt: f.created_at,
        });
      }

      // Job items — flatten results array
      for (const job of jobsResult.data || []) {
        const results = job.results as any;
        if (!Array.isArray(results)) continue;
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const url = typeof r === 'string' ? r : r?.url || r?.image_url;
          if (!url || url.startsWith('data:')) continue;
          const workflowName = (job.workflows as any)?.name || '';
          const productTitle = (job.user_products as any)?.title || '';
          items.push({
            id: `job-${job.id}-${i}`,
            imageUrl: url,
            title: workflowName || productTitle || 'Generated',
            createdAt: job.created_at,
          });
        }
      }

      // Sort by newest
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Sign URLs
      const urls = await toSignedUrls(items.map(i => i.imageUrl));
      return items.map((item, idx) => ({ ...item, imageUrl: urls[idx] }));
    },
    enabled: !!user,
    staleTime: 60_000,
  });


  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredLibrary = libraryItems.filter(i =>
    i.title.toLowerCase().includes(librarySearch.toLowerCase())
  );

  // ── Hook ──────────────────────────────────────────────────────────────
  const { generate, isGenerating, progress } = useGeneratePerspectives();

  // ── Generating progress polling ───────────────────────────────────────
  const stopPolling = useCallback(() => {
    pollVersionRef.current++;
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Elapsed timer during generating view
  useEffect(() => {
    if (!isGeneratingView) return;
    const interval = setInterval(() => {
      setGenElapsed(Math.floor((Date.now() - genStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isGeneratingView]);

  // Team avatar rotation
  useEffect(() => {
    if (!isGeneratingView) return;
    const interval = setInterval(() => {
      setTeamIndex(prev => (prev + 1) % TEAM_MEMBERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isGeneratingView]);

  const startPolling = useCallback((jobs: PerspectiveJobInfo[]) => {
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
          `${SUPABASE_URL}/rest/v1/generation_queue?id=in.(${idsFilter})&select=id,status,error_message`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
        );
        if (!res.ok || pollVersionRef.current !== version) return;
        const rows = await res.json();

        const statuses: Record<string, { status: string; error?: string }> = {};
        for (const row of rows) {
          statuses[row.id] = { status: row.status, error: row.error_message || undefined };
        }
        // Fill missing as queued
        for (const id of jobIds) {
          if (!statuses[id]) statuses[id] = { status: 'queued' };
        }

        if (pollVersionRef.current !== version) return;
        setJobStatuses(statuses);

        const allDone = jobIds.every(id => {
          const s = statuses[id]?.status;
          return s === 'completed' || s === 'failed' || s === 'cancelled';
        });

        if (allDone) {
          const completed = jobIds.filter(id => statuses[id]?.status === 'completed').length;
          const failed = jobIds.filter(id => statuses[id]?.status === 'failed').length;
          stopPolling();

          refreshCredits();

          if (completed > 0) {
            toast.success(`${completed} perspective${completed > 1 ? 's' : ''} ready! ${failed > 0 ? `(${failed} failed)` : ''}`);
            setTimeout(() => {
              setIsGeneratingView(false);
              navigate('/app/library');
            }, 1500);
          } else {
            toast.error('All generations failed. Credits have been refunded.');
          }
          return;
        }
      } catch {
        // Network error — keep polling
      }

      if (pollVersionRef.current === version) {
        pollRef.current = setTimeout(poll, 3000);
      }
    };

    poll();
  }, [navigate, refreshCredits, stopPolling]);

  // ── Derived ───────────────────────────────────────────────────────────
  const sourceCount = sourceType === 'scratch'
    ? (directUploadUrl ? 1 : 0)
    : sourceType === 'product'
      ? selectedProductIds.size
      : sourceType === 'library'
        ? selectedLibraryIds.size
        : 0;

  const perImageCost = 6;
  const totalImages = sourceCount * selectedVariations.size * selectedRatios.size;
  const totalCost = totalImages * perImageCost;
  const canGenerate = sourceCount > 0 && selectedVariations.size > 0 && selectedRatios.size > 0 && !isGenerating;

  // ── Handlers ──────────────────────────────────────────────────────────
  const toggleVariation = (index: number) => {
    const next = new Set(selectedVariations);
    if (next.has(index)) {
      next.delete(index);
      const newRefs = { ...referenceImages };
      delete newRefs[index];
      setReferenceImages(newRefs);
    } else {
      next.add(index);
    }
    setSelectedVariations(next);
  };

  const toggleRatio = (ratio: string) => {
    const next = new Set(selectedRatios);
    if (next.has(ratio)) next.delete(ratio);
    else next.add(ratio);
    setSelectedRatios(next);
  };

  const toggleProduct = (id: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < 10) next.add(id);
    setSelectedProductIds(next);
  };

  const toggleLibraryItem = (id: string) => {
    const next = new Set(selectedLibraryIds);
    if (next.has(id)) next.delete(id);
    else if (next.size < 10) next.add(id);
    setSelectedLibraryIds(next);
  };

  const handleDirectFile = useCallback(async (file: File) => {
    const url = await upload(file);
    if (url) setDirectUploadUrl(url);
  }, [upload]);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleDirectFile(file);
  };

  const handleReferenceUpload = async (variationIndex: number, file: File) => {
    setUploadingRefIndex(variationIndex);
    const url = await upload(file);
    if (url) {
      setReferenceImages(prev => ({ ...prev, [variationIndex]: url }));
    }
    setUploadingRefIndex(null);
  };

  // ── Clipboard paste for reference images ──────────────────────────────
  // Find the first selected variation that has referenceUpload and no image yet
  const pasteTargetIndex = useMemo(() => {
    for (const i of selectedVariations) {
      if (variations[i]?.referenceUpload && !referenceImages[i]) return i;
    }
    return null;
  }, [selectedVariations, variations, referenceImages]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;
          // Scratch upload takes priority when active and empty
          if (sourceType === 'scratch' && !directUploadUrl) {
            handleDirectFile(file);
          } else if (pasteTargetIndex !== null) {
            handleReferenceUpload(pasteTargetIndex, file);
          }
          return;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [sourceType, directUploadUrl, pasteTargetIndex, handleDirectFile]);

  const handleGenerate = async () => {
    if (selectedRatios.size === 0) {
      toast.error('Please select at least one aspect ratio.');
      return;
    }
    if (selectedVariations.size === 0) {
      toast.error('Please select at least one perspective angle.');
      return;
    }
    if (!canGenerate) return;
    if (totalCost > credits) {
      setNoCreditsOpen(true);
      return;
    }

    let selectedSources: Array<{ id: string; image_url: string; title: string }> = [];

    if (sourceType === 'scratch' && directUploadUrl) {
      selectedSources = [{ id: 'direct', image_url: directUploadUrl, title: 'Uploaded Image' }];
    } else if (sourceType === 'product') {
      selectedSources = products.filter(p => selectedProductIds.has(p.id));
    } else if (sourceType === 'library') {
      selectedSources = libraryItems
        .filter(i => selectedLibraryIds.has(i.id))
        .map(i => ({ id: i.id, image_url: i.imageUrl, title: i.title }));
    }

    const selectedVarList = Array.from(selectedVariations).map(i => ({
      ...variations[i],
      referenceImageUrl: referenceImages[i] || null,
    }));

    const result = await generate({
      products: selectedSources.map(p => ({
        id: p.id,
        imageUrl: p.image_url,
        title: p.title,
      })),
      variations: selectedVarList,
      ratios: Array.from(selectedRatios),
      quality,
    });

    if (result && result.jobs.length > 0) {
      if (result.newBalance !== null) {
        setBalanceFromServer(result.newBalance);
      }
      setGeneratingJobs(result.jobs);
      setJobStatuses(Object.fromEntries(result.jobs.map(j => [j.jobId, { status: 'queued' }])));
      genStartRef.current = Date.now();
      setGenElapsed(0);
      setTeamIndex(0);
      setIsGeneratingView(true);
      startPolling(result.jobs);
    }
  };

  // ── Source type cards config ───────────────────────────────────────────
  const sourceOptions: Array<{ id: SourceType; title: string; description: string; icon: typeof Package }> = [
    { id: 'library', title: 'From Library', description: 'Select from your generated images', icon: ImageLucide },
    { id: 'product', title: 'From Products', description: 'Select from your product catalog', icon: Package },
    { id: 'scratch', title: 'From Scratch', description: 'Upload your own image file', icon: Upload },
  ];

  // ── Generating view helpers ─────────────────────────────────────────────
  const genCompletedCount = Object.values(jobStatuses).filter(s => s.status === 'completed').length;
  const genFailedCount = Object.values(jobStatuses).filter(s => s.status === 'failed').length;
  const genTotalCount = generatingJobs.length;
  const genAllDone = genTotalCount > 0 && Object.values(jobStatuses).every(s => s.status === 'completed' || s.status === 'failed' || s.status === 'cancelled');
  const genProgressPercent = genTotalCount > 0 ? (genCompletedCount / genTotalCount) * 100 : 0;
  const estimatedSecondsPerImage = 35;
  const estimatedTotal = genTotalCount * estimatedSecondsPerImage;

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }

  const currentMember = TEAM_MEMBERS[teamIndex % TEAM_MEMBERS.length];

  // ── Generating progress view ──────────────────────────────────────────
  if (isGeneratingView) {
    return (
      <div className="min-h-screen">
        <SEOHead title="Generating Perspectives…" description="Your product perspectives are being created." />
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7 text-primary animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Creating Picture Perspectives…</h1>
            <p className="text-sm text-muted-foreground">
              Generating {genTotalCount} angle{genTotalCount !== 1 ? 's' : ''}
              {generatingJobs[0] ? ` of ${generatingJobs[0].productTitle}` : ''}
            </p>
          </div>

          {/* Progress card */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {genCompletedCount} of {genTotalCount} complete
                  {genFailedCount > 0 && <span className="text-destructive ml-1">({genFailedCount} failed)</span>}
                </span>
                <span className="font-mono text-muted-foreground">{formatTime(genElapsed)}</span>
              </div>
              <Progress
                value={genAllDone ? 100 : Math.max(genProgressPercent, 5)}
                className="h-2 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-linear"
              />
              <p className="text-xs text-muted-foreground">
                Est. {formatTime(Math.round(estimatedTotal * 0.8))} – {formatTime(Math.round(estimatedTotal * 1.2))} total
              </p>
            </div>

            {/* Per-variation chips */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Perspectives</p>
              <div className="flex flex-wrap gap-2">
                {generatingJobs.map(job => {
                  const s = jobStatuses[job.jobId];
                  const status = s?.status || 'queued';
                  const Icon = VARIATION_ICONS[job.variationLabel] || ImageIcon;

                  return (
                    <div
                      key={job.jobId}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                        status === 'completed'
                          ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400'
                          : status === 'failed'
                            ? 'border-destructive/30 bg-destructive/5 text-destructive'
                            : status === 'processing'
                              ? 'border-primary/30 bg-primary/5 text-primary'
                              : 'border-border bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : status === 'failed' ? (
                        <XCircle className="w-4 h-4" />
                      ) : status === 'processing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      <Icon className="w-3.5 h-3.5" />
                      <span className="font-medium">{job.variationLabel}</span>
                      {job.ratio !== '1:1' && (
                        <span className="text-xs opacity-60">{job.ratio}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team avatar rotation */}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src={getOptimizedUrl(currentMember.avatar, { quality: 60 })} alt={currentMember.name} />
                <AvatarFallback className="text-xs">{currentMember.name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground italic">
                {currentMember.name} is {currentMember.statusMessage.toLowerCase()}
              </p>
            </div>

            {/* Overtime message */}
            {genElapsed > estimatedTotal && !genAllDone && (
              <p className="text-xs text-muted-foreground text-center">
                Taking a bit longer than usual — high-quality Pro model results are worth the wait…
              </p>
            )}
          </div>

          {/* Cancel button */}
          {!genAllDone && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopPolling();
                  setIsGeneratingView(false);
                  toast.info('Generation continues in the background. Check your library for results.');
                }}
                className="text-muted-foreground"
              >
                Continue in background
              </Button>
            </div>
          )}

          {/* All done — manual nav */}
          {genAllDone && genCompletedCount > 0 && (
            <div className="text-center">
              <Button
                onClick={() => {
                  setIsGeneratingView(false);
                  navigate('/app/library');
                }}
                className="h-11 px-6 rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View in Library
              </Button>
            </div>
          )}

          {/* All failed */}
          {genAllDone && genCompletedCount === 0 && (
            <div className="text-center space-y-3">
              <p className="text-sm text-destructive">All generations failed. Credits have been refunded.</p>
              <Button variant="outline" onClick={() => setIsGeneratingView(false)}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead title="Picture Perspectives" description="Generate angle and detail variations from any image." />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/workflows')}
            className="gap-1.5 -ml-2 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Templates
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Picture Perspectives</h1>
              <p className="text-sm text-muted-foreground">
                Generate angle and detail variations — close-ups, back views, side angles, and wide shots from any image.
              </p>
            </div>
          </div>
        </div>

        <LowCreditsBanner />

        {/* Step 1: Source Selection */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
            Choose Source
          </h2>

          {/* Source type selector cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sourceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSourceTypeChange(option.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                  sourceType === option.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="space-y-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    sourceType === option.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    <option.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  {sourceType === option.id && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-xs font-medium text-primary">Selected</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* ── Library picker ─────────────────────────────────────────── */}
          {sourceType === 'library' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search generated images..."
                  value={librarySearch}
                  onChange={e => { setLibrarySearch(e.target.value); setLibraryVisibleCount(10); }}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={selectedLibraryIds.size > 0 ? 'default' : 'secondary'}>
                  {selectedLibraryIds.size} selected
                </Badge>
                <span className="text-xs text-muted-foreground">(max 10)</span>
              </div>
              {libraryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                  {filteredLibrary.slice(0, libraryVisibleCount).map(item => {
                    const isSelected = selectedLibraryIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleLibraryItem(item.id)}
                        className={`relative rounded-xl border-2 p-1.5 cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={getOptimizedUrl(item.imageUrl, { quality: 60 })} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-1 px-0.5">{item.title}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              {!libraryLoading && filteredLibrary.length > libraryVisibleCount && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => setLibraryVisibleCount(c => c + 30)}>
                    Load more ({filteredLibrary.length - libraryVisibleCount} remaining)
                  </Button>
                </div>
              )}
              {!libraryLoading && filteredLibrary.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  No generated images found. Generate some images first in{' '}
                  <button className="text-primary underline" onClick={() => navigate('/app/freestyle')}>Freestyle</button>.
                </p>
              )}
            </div>
          )}

          {/* ── Product picker ─────────────────────────────────────────── */}
          {sourceType === 'product' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Info note about primary image */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  The <span className="font-medium text-foreground">primary product image</span> will be used as the source for perspective generation.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setProductVisibleCount(10); }}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={selectedProductIds.size > 0 ? 'default' : 'secondary'}>
                  {selectedProductIds.size} selected
                </Badge>
                <span className="text-xs text-muted-foreground">(max 10)</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                {filteredProducts.slice(0, productVisibleCount).map(product => {
                  const isSelected = selectedProductIds.has(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className={`relative rounded-xl border-2 p-1.5 cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="absolute top-1.5 left-1.5 z-10 bg-background/90 rounded shadow-sm p-0.5">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleProduct(product.id)} />
                      </div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {product.image_url ? (
                          <img src={getOptimizedUrl(product.image_url, { quality: 60 })} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                        )}
                      </div>
                      <p className="text-[10px] font-medium truncate mt-1">{product.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{product.product_type}</p>
                    </div>
                  );
                })}
              </div>
              {filteredProducts.length > productVisibleCount && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => setProductVisibleCount(c => c + 10)}>
                    Load more ({filteredProducts.length - productVisibleCount} remaining)
                  </Button>
                </div>
              )}
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  No products found.{' '}
                  <button className="text-primary underline" onClick={() => navigate('/app/products/new')}>Add one</button>
                </p>
              )}
            </div>
          )}

          {/* ── From Scratch upload ────────────────────────────────────── */}
          {sourceType === 'scratch' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {directUploadUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <img src={directUploadUrl} alt="Uploaded" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Uploaded Image</p>
                    <p className="text-xs text-muted-foreground">Ready for perspective generation</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setDirectUploadUrl(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.type.startsWith('image/')) handleDirectFile(file); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Upload an image</p>
                        <p className="text-xs text-muted-foreground">Drag & drop, paste, or click to browse</p>
                        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60 mt-1.5">
                          <ClipboardPaste className="w-3 h-3" />
                          ⌘V / Ctrl+V to paste from clipboard
                        </p>
                      </div>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleDirectUpload} disabled={isUploading} />
                </label>
              )}
            </div>
          )}
        </section>

        {/* Step 2: Choose Angles */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
            Choose Perspectives
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variations.map((v, i) => {
              const isSelected = selectedVariations.has(i);
              const Icon = VARIATION_ICONS[v.label] || ImageIcon;
              const hasRefUpload = v.referenceUpload && isSelected;
              const showRefUpload = hasRefUpload && v.referenceUpload!.recommended;

              return (
                <div key={v.id} className="space-y-2">
                  <div
                    onClick={() => toggleVariation(i)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleVariation(i)} />
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.label}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{v.instruction.slice(0, 80)}…</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </div>

                  {/* Conditional reference upload — recommended */}
                  {showRefUpload && (
                    <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                      {referenceImages[i] ? (
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <img src={referenceImages[i]} alt="Reference" className="w-20 h-20 rounded-xl object-cover border border-border" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Reference uploaded ✓</p>
                            <p className="text-xs text-muted-foreground mt-0.5">This will improve angle accuracy</p>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                            const newRefs = { ...referenceImages };
                            delete newRefs[i];
                            setReferenceImages(newRefs);
                          }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label
                          className="relative flex flex-col items-center justify-center gap-2.5 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file?.type.startsWith('image/')) handleReferenceUpload(i, file);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          {uploadingRefIndex === i ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <Upload className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-foreground">{v.referenceUpload!.prompt}</p>
                                <p className="text-xs text-muted-foreground mt-1">Drag & drop, paste, or click to upload</p>
                                <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60 mt-1.5">
                                  <ClipboardPaste className="w-3 h-3" />
                                  ⌘V / Ctrl+V to paste from clipboard
                                </p>
                              </div>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleReferenceUpload(i, file);
                            }}
                            disabled={uploadingRefIndex === i}
                          />
                        </label>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Aspect Ratios */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</span>
            Aspect Ratios
          </h2>

          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio}
                onClick={() => toggleRatio(ratio)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedRatios.has(ratio)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </section>

        {/* Quality note */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            All perspectives are generated in <span className="font-semibold text-foreground">High Quality</span> (6 credits/image) for maximum product fidelity.
          </p>
        </div>

        {/* Generate bar */}
        <div className="sticky bottom-2 sm:bottom-4 z-50 max-w-3xl mx-auto">
          <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalImages}</span> images ·{' '}
                <span className="font-semibold text-foreground">{totalCost}</span> credits
              </div>
              {sourceCount > 0 && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                  {sourceCount} source{sourceCount !== 1 ? 's' : ''} × {selectedVariations.size} angle{selectedVariations.size !== 1 ? 's' : ''} × {selectedRatios.size} ratio{selectedRatios.size !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || totalCost > credits}
              className="h-11 px-6 rounded-xl shadow-lg shadow-primary/10 w-full sm:w-auto"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate {totalImages} images</>
              )}
            </Button>
          </div>

          {isGenerating && progress > 0 && (
            <Progress value={progress} className="mt-2 h-1.5 rounded-full" />
          )}
        </div>
      </div>
    </div>
      <NoCreditsModal open={noCreditsOpen} onClose={() => setNoCreditsOpen(false)} category="fallback" />
    </>
  );
}
