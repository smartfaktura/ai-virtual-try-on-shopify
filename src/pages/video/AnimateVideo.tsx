import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, X, Loader2, Sparkles, Brain, Wand2, CheckCircle2, Image, Clapperboard, Eye, ScanSearch, Zap, RotateCcw, ClipboardPaste, FolderOpen, Play, ArrowRight, Images, Lock, Settings2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ProductContextSelector } from '@/components/app/video/ProductContextSelector';
import { MotionGoalSelector } from '@/components/app/video/MotionGoalSelector';
import { MotionRefinementPanel } from '@/components/app/video/MotionRefinementPanel';
import { PreservationRulesPanel } from '@/components/app/video/PreservationRulesPanel';
import { AudioModeSelector } from '@/components/app/video/AudioModeSelector';
import { CreditEstimateBox } from '@/components/app/video/CreditEstimateBox';
import { ValidationWarnings, type ValidationWarning } from '@/components/app/video/ValidationWarnings';
import { VideoResultsPanel, type QuickVariationPreset } from '@/components/app/video/VideoResultsPanel';
import { BulkImageGrid, type BulkImage } from '@/components/app/video/BulkImageGrid';
import { BulkProgressBanner } from '@/components/app/video/BulkProgressBanner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PRODUCT_CATEGORIES, SCENE_TYPES, CAMERA_MOTIONS, getMotionGoalsForCategory, getDefaultPreservation } from '@/lib/videoMotionRecipes';
import { estimateCredits, estimateBulkCredits } from '@/config/videoCreditPricing';
import { InfoTooltip } from '@/components/app/video/InfoTooltip';
import { useVideoProject } from '@/hooks/useVideoProject';
import { useBulkVideoProject } from '@/hooks/useBulkVideoProject';
import { useFileUpload } from '@/hooks/useFileUpload';
import { TEAM_MEMBERS } from '@/data/teamData';
import { useCredits } from '@/contexts/CreditContext';
import { getOptimizedUrl } from '@/lib/imageOptimization';
import { toast } from '@/lib/brandedToast';
import { LibraryPickerModal } from '@/components/app/video/LibraryPickerModal';
type AspectRatio = '9:16' | '1:1' | '16:9';
type Duration = '5' | '10';
type AudioMode = 'silent' | 'ambient';

const TIPS_TEAM = TEAM_MEMBERS.filter(m => ['Sophia', 'Kenji', 'Zara', 'Leo'].includes(m.name));
const PROGRESS_TEAM = TEAM_MEMBERS.filter(m => ['Sophia', 'Kenji', 'Luna', 'Amara', 'Yuki'].includes(m.name));

const TIPS = [
  'Our AI team analyzes your image to build the perfect motion plan.',
  'Higher preservation = more brand-safe output. Adjust per shot.',
  'Use "Specific Motion Note" for precise control over movement.',
  'Match your aspect ratio to your channel for best results.',
];

export default function AnimateVideo() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    pipelineStage, videoUrl, videoError, elapsedSeconds, videoStatus,
    isAnalyzing, isBuildingPrompt, isGenerating, isComplete,
    analysisResult, isAnalyzingImage, analyzeImage,
    runAnimatePipeline, resetPipeline, activeJob,
  } = useVideoProject();

  const { bulkItems, isBulkRunning, isBulkComplete, runBulkAnimatePipeline, resetBulk } = useBulkVideoProject();

  const { balance: creditsBalance, plan } = useCredits();
  const { upload, isUploading, progress: uploadProgress } = useFileUpload();

  const isPaidUser = plan !== 'free';
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkImages, setBulkImages] = useState<BulkImage[]>([]);
  const [customizePerImage, setCustomizePerImage] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<string | null>(null);
  const [perImageSettings, setPerImageSettings] = useState<Map<string, Record<string, any>>>(new Map());

  // Upload state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Minimum 5s staged analysis experience
  const [analysisCompleteData, setAnalysisCompleteData] = useState<any>(null);
  const [uploadCompleteTime, setUploadCompleteTime] = useState<number | null>(null);
  const [uiRevealReady, setUiRevealReady] = useState(false);

  // Simulated analysis step progress (0-3) — 1500ms pacing for ~4.5s total
  const [analysisStep, setAnalysisStep] = useState(0);
  const showAnalysisUI = isAnalyzingImage || (!!imageUrl && !uiRevealReady && !hasAnalyzed);

  useEffect(() => {
    if (!showAnalysisUI) { setAnalysisStep(0); return; }
    setAnalysisStep(0);
    const iv = setInterval(() => setAnalysisStep(s => Math.min(s + 1, 3)), 1500);
    return () => clearInterval(iv);
  }, [showAnalysisUI]);

  // Gate: when backend finishes early, wait until 5s from upload before revealing
  useEffect(() => {
    if (!analysisCompleteData || !uploadCompleteTime) return;
    const elapsed = Date.now() - uploadCompleteTime;
    const remaining = Math.max(0, 5000 - elapsed);
    const timer = setTimeout(() => setUiRevealReady(true), remaining);
    return () => clearTimeout(timer);
  }, [analysisCompleteData, uploadCompleteTime]);

  // When uiRevealReady flips, apply buffered analysis data
  useEffect(() => {
    if (!uiRevealReady || !analysisCompleteData) return;
    const analysis = analysisCompleteData;
    setHasAnalyzed(true);
    if (analysis.category) { setCategory(analysis.category); setDetectedCategory(analysis.category); }
    if (analysis.ecommerce_scene_type) { setSceneType(analysis.ecommerce_scene_type); setDetectedSceneType(analysis.ecommerce_scene_type); }
    if (analysis.recommended_motion_goals?.length) { setRecommendedGoalIds(analysis.recommended_motion_goals); setMotionGoalId(analysis.recommended_motion_goals[0]); }
    if (analysis.recommended_camera_motion) { setCameraMotion(analysis.recommended_camera_motion); setSelectedCameraMotions([analysis.recommended_camera_motion]); }
    if (analysis.recommended_subject_motion) setSubjectMotion(analysis.recommended_subject_motion);
    if (analysis.recommended_realism) setRealismLevel(analysis.recommended_realism);
    if (analysis.recommended_loop_style) setLoopStyle(analysis.recommended_loop_style);
    if (analysis.risk_flags?.identity_sensitive || analysis.identity_sensitive) { setPreserveIdentity(true); setPreserveOutfit(true); }
    setAnalysisCompleteData(null);
    setUploadCompleteTime(null);
  }, [uiRevealReady, analysisCompleteData]);

  // Product Context
  const [category, setCategory] = useState('fashion_apparel');
  const [sceneType, setSceneType] = useState('studio_product');
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedSceneType, setDetectedSceneType] = useState<string | null>(null);

  // Motion Goal
  const [motionGoalId, setMotionGoalId] = useState('');
  const [recommendedGoalIds, setRecommendedGoalIds] = useState<string[]>([]);

  // Refinements
  const [cameraMotion, setCameraMotion] = useState('slow_push_in');
  const [selectedCameraMotions, setSelectedCameraMotions] = useState<string[]>(['slow_push_in']);
  const [subjectMotion, setSubjectMotion] = useState('minimal');
  const [realismLevel, setRealismLevel] = useState('realistic');
  const [loopStyle, setLoopStyle] = useState('none');
  const [motionIntensity, setMotionIntensity] = useState<'low' | 'medium' | 'high'>('low');

  // Preservation
  const [preserveScene, setPreserveScene] = useState(true);
  const [preserveProductDetails, setPreserveProductDetails] = useState(true);
  const [preserveIdentity, setPreserveIdentity] = useState(false);
  const [preserveOutfit, setPreserveOutfit] = useState(false);

  // Settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<Duration>('5');
  const [audioMode, setAudioMode] = useState<AudioMode>('silent');
  const [userPrompt, setUserPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false);

  // Cycling tip index
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  // Cycling avatar for progress
  const [progressAvatarIdx, setProgressAvatarIdx] = useState(0);
  useEffect(() => {
    if (!isPipelineActive) return;
    const iv = setInterval(() => setProgressAvatarIdx(i => (i + 1) % PROGRESS_TEAM.length), 3000);
    return () => clearInterval(iv);
  }, [pipelineStage, videoStatus]);

  // When category or sceneType changes, update motion goals and preservation defaults
  useEffect(() => {
    const goals = getMotionGoalsForCategory(category, sceneType);
    if (goals.length > 0 && !goals.find(g => g.id === motionGoalId)) {
      setMotionGoalId(goals[0].id);
    }
    const pres = getDefaultPreservation(category, sceneType);
    setPreserveScene(pres.preserveScene);
    setPreserveProductDetails(pres.preserveProductDetails);
    setPreserveIdentity(pres.preserveIdentity);
    setPreserveOutfit(pres.preserveOutfit);
  }, [category, sceneType]);

  // When motion goal changes, apply its defaults
  useEffect(() => {
    const goals = getMotionGoalsForCategory(category, sceneType);
    const goal = goals.find(g => g.id === motionGoalId);
    if (goal) {
      setCameraMotion(goal.defaultCameraMotion);
      setSelectedCameraMotions([goal.defaultCameraMotion]);
      setSubjectMotion(goal.subjectMotion);
      setMotionIntensity(goal.defaultIntensity);
    }
  }, [motionGoalId, category, sceneType]);

  // Core file processing function (used by file input, paste, and library)
  const processFile = useCallback(async (file: File) => {
    const newWarnings: ValidationWarning[] = [];
    if (file.size > 20 * 1024 * 1024) {
      newWarnings.push({ type: 'error', message: 'Image must be under 20MB.' });
      setWarnings(newWarnings);
      return;
    }
    if (file.type === 'image/png') {
      newWarnings.push({ type: 'info', message: 'Transparent PNGs may produce edge artifacts. Consider JPG.' });
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const url = await upload(file);
    if (url) {
      setImageUrl(url);
      setWarnings(newWarnings);
      setHasAnalyzed(false);
      setUiRevealReady(false);
      setAnalysisCompleteData(null);
      setUploadCompleteTime(Date.now());
      const analysis = await analyzeImage(url);
      if (analysis) {
        setAnalysisCompleteData(analysis);
      }
    }
  }, [upload, analyzeImage]);

  // File input handler
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }, [processFile]);

  // Library image selection handler
  const handleLibrarySelect = useCallback(async (libraryImageUrl: string) => {
    setImagePreview(libraryImageUrl);
    setImageUrl(libraryImageUrl);
    setWarnings([]);
    setHasAnalyzed(false);
    setUiRevealReady(false);
    setAnalysisCompleteData(null);
    setUploadCompleteTime(Date.now());
    const analysis = await analyzeImage(libraryImageUrl);
    if (analysis) {
      setAnalysisCompleteData(analysis);
    }
  }, [analyzeImage]);

  // Auto-load image from query param (e.g. from Library "Generate Video" button)
  const queryImageConsumed = useRef(false);
  useEffect(() => {
    if (queryImageConsumed.current) return;
    const paramUrl = searchParams.get('imageUrl');
    if (paramUrl && !imageUrl) {
      queryImageConsumed.current = true;
      setSearchParams({}, { replace: true });
      handleLibrarySelect(paramUrl);
    }
  }, [searchParams, imageUrl, handleLibrarySelect, setSearchParams]);


  useEffect(() => {
    if (imageUrl) return; // Only listen when no image is loaded
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            toast.success('Image pasted — uploading...');
            processFile(file);
          }
          return;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [imageUrl, processFile]);

  const removeImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    setWarnings([]);
    setHasAnalyzed(false);
    setDetectedCategory(null);
    setDetectedSceneType(null);
    setRecommendedGoalIds([]);
    setAnalysisCompleteData(null);
    setUploadCompleteTime(null);
    setUiRevealReady(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Bulk image handling ──
  const handleBulkAddFiles = useCallback(async (files: File[]) => {
    const remaining = 10 - bulkImages.length;
    const toAdd = files.slice(0, remaining);

    for (const file of toAdd) {
      if (file.size > 20 * 1024 * 1024) { toast.error(`${file.name} exceeds 20MB`); continue; }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const preview = URL.createObjectURL(file);

      setBulkImages(prev => [...prev, { id, file, url: null, preview, isUploading: true, uploadProgress: 30 }]);

      const url = await upload(file);
      if (url) {
        setBulkImages(prev => prev.map(img => img.id === id ? { ...img, url, isUploading: false, uploadProgress: 100 } : img));

        // Analyze the first image only
        setBulkImages(prev => {
          const current = prev;
          const firstWithUrl = current.find(i => i.url);
          if (firstWithUrl?.id === id && !hasAnalyzed) {
            analyzeImage(url).then(analysis => {
              if (analysis) setAnalysisCompleteData(analysis);
            });
            setUploadCompleteTime(Date.now());
          }
          return current;
        });
      } else {
        setBulkImages(prev => prev.filter(img => img.id !== id));
      }
    }
  }, [bulkImages, upload, analyzeImage, hasAnalyzed]);

  const handleBulkRemoveImage = useCallback((id: string) => {
    setBulkImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // Handle multi-select from library in batch mode
  const handleBulkLibrarySelect = useCallback((urls: string[]) => {
    const remaining = 10 - bulkImages.length;
    const toAdd = urls.slice(0, remaining);
    const newImages: BulkImage[] = toAdd.map(url => ({
      id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url,
      preview: url,
      isUploading: false,
    }));
    setBulkImages(prev => {
      const updated = [...prev, ...newImages];
      // Trigger analysis on first image if not yet analyzed
      if (!hasAnalyzed && updated.length > 0 && updated[0].url) {
        setUploadCompleteTime(Date.now());
        analyzeImage(updated[0].url).then(analysis => {
          if (analysis) setAnalysisCompleteData(analysis);
        });
      }
      return updated;
    });
  }, [bulkImages, hasAnalyzed, analyzeImage]);

  const motionCount = isPaidUser ? selectedCameraMotions.length : 1;

  const handleGenerate = async () => {
    if (bulkMode && bulkImages.length > 0) {
      const readyImages = bulkImages.filter(img => img.url);
      if (readyImages.length === 0) { toast.error('Wait for images to finish uploading'); return; }

      const perVideoCost = estimateCredits({ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion });
      const total = perVideoCost * readyImages.length * motionCount;
      if (total > creditsBalance) {
        toast.error(`Insufficient credits: need ${total}, have ${creditsBalance}`);
        return;
      }

      const sharedParams = { category, sceneType, motionGoalId, cameraMotion, subjectMotion, realismLevel, loopStyle, motionIntensity,
          preserveScene, preserveProductDetails, preserveIdentity, preserveOutfit,
          aspectRatio, duration, audioMode, userPrompt: userPrompt || undefined };

      // Multi-motion: run bulk pipeline once per camera motion
      if (motionCount > 1) {
        for (const motion of selectedCameraMotions) {
          await runBulkAnimatePipeline(
            readyImages.map(img => ({ id: img.id, url: img.url!, preview: img.preview })),
            { ...sharedParams, cameraMotion: motion },
            customizePerImage ? perImageSettings : undefined
          );
        }
      } else {
        runBulkAnimatePipeline(
          readyImages.map(img => ({ id: img.id, url: img.url!, preview: img.preview })),
          sharedParams,
          customizePerImage ? perImageSettings : undefined
        );
      }
      return;
    }

    if (!imageUrl) { toast.error('Please upload an image first'); return; }

    // Multi-motion for single image: generate one video per motion
    if (motionCount > 1) {
      const perVideoCost = estimateCredits({ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion });
      const total = perVideoCost * motionCount;
      if (total > creditsBalance) {
        toast.error(`Insufficient credits: need ${total}, have ${creditsBalance}`);
        return;
      }
      for (let i = 0; i < selectedCameraMotions.length; i++) {
        if (i > 0) {
          resetPipeline();
          await new Promise(r => setTimeout(r, 300));
        }
        await runAnimatePipeline({
          imageUrl,
          category, sceneType, motionGoalId,
          cameraMotion: selectedCameraMotions[i], subjectMotion, realismLevel, loopStyle, motionIntensity,
          preserveScene, preserveProductDetails, preserveIdentity, preserveOutfit,
          aspectRatio, duration, audioMode,
          userPrompt: userPrompt || undefined,
        });
      }
      return;
    }

    runAnimatePipeline({
      imageUrl,
      category, sceneType, motionGoalId,
      cameraMotion, subjectMotion, realismLevel, loopStyle, motionIntensity,
      preserveScene, preserveProductDetails, preserveIdentity, preserveOutfit,
      aspectRatio, duration, audioMode,
      userPrompt: userPrompt || undefined,
    });
  };

  const handleReuse = () => resetPipeline();
  const handleNewProject = () => {
    resetPipeline();
    resetBulk();
    removeImage();
    setBulkImages([]);
    setBulkMode(false);
    setUserPrompt('');
  };

  const handleQuickVariation = (preset: QuickVariationPreset) => {
    if (!imageUrl) return;
    const changes = preset.changes;
    if (changes.motionIntensity) setMotionIntensity(changes.motionIntensity as 'low' | 'medium' | 'high');
    if (changes.cameraMotion) setCameraMotion(changes.cameraMotion);
    if (changes.realismLevel) setRealismLevel(changes.realismLevel);
    if (changes.loopStyle) setLoopStyle(changes.loopStyle);
    // Preservation overrides from correction presets
    if (changes.preserveScene === 'true') setPreserveScene(true);
    if (changes.preserveProductDetails === 'true') setPreserveProductDetails(true);
    if (changes.preserveIdentity === 'true') setPreserveIdentity(true);
    if (changes.preserveOutfit === 'true') setPreserveOutfit(true);

    // Build the extra negative prompt if correction preset adds one
    const extraNegative = changes.negativePromptAppend || '';

    resetPipeline();
    setTimeout(() => {
      const effectiveUserPrompt = extraNegative
        ? `${userPrompt || ''} [Negative: ${extraNegative}]`.trim()
        : userPrompt || undefined;

      runAnimatePipeline({
        imageUrl,
        category, sceneType, motionGoalId,
        cameraMotion: changes.cameraMotion || cameraMotion,
        subjectMotion: changes.subjectMotion || subjectMotion,
        realismLevel: changes.realismLevel || realismLevel,
        loopStyle: changes.loopStyle || loopStyle,
        motionIntensity: (changes.motionIntensity || motionIntensity) as 'low' | 'medium' | 'high',
        preserveScene: changes.preserveScene === 'true' ? true : preserveScene,
        preserveProductDetails: changes.preserveProductDetails === 'true' ? true : preserveProductDetails,
        preserveIdentity: changes.preserveIdentity === 'true' ? true : preserveIdentity,
        preserveOutfit: changes.preserveOutfit === 'true' ? true : preserveOutfit,
        aspectRatio, duration, audioMode,
        userPrompt: effectiveUserPrompt,
      });
    }, 50);
  };

  // Build generation context for results panel
  const buildGenerationContext = () => {
    const catLabel = PRODUCT_CATEGORIES.find(c => c.id === category)?.label || category;
    const sceneLabel = SCENE_TYPES.find(s => s.id === sceneType)?.label || sceneType;
    const goals = getMotionGoalsForCategory(category, sceneType);
    const goalTitle = goals.find(g => g.id === motionGoalId)?.title || motionGoalId;
    const credits = estimateCredits({ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion });
    return {
      categoryLabel: catLabel,
      sceneTypeLabel: sceneLabel,
      motionGoalTitle: goalTitle,
      cameraMotion: cameraMotion.replace(/_/g, ' '),
      subjectMotion: subjectMotion.replace(/_/g, ' '),
      duration: `${duration}s`,
      audioMode: audioMode === 'silent' ? 'Silent' : 'Ambient',
      creditsUsed: credits,
      realismLevel: realismLevel.replace(/_/g, ' '),
      loopStyle: loopStyle === 'none' ? 'None' : loopStyle.replace(/_/g, ' '),
    };
  };

  const isPipelineActive = pipelineStage !== 'idle' && pipelineStage !== 'error' && !isComplete && (isGenerating || isAnalyzing || isBuildingPrompt || pipelineStage === 'creating_project');

  const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: '9:16', label: '9:16' },
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
  ];

  const getStageMessage = () => {
    if (isAnalyzing) return { text: 'Analyzing your image...', sub: 'Understanding composition and product context' };
    if (isBuildingPrompt) return { text: 'Building motion plan...', sub: 'Applying category-aware motion strategy' };
    if (videoStatus === 'creating') return { text: 'Submitting to queue...', sub: 'Reserving credits and queueing your video' };
    if (videoStatus === 'queued' && pipelineStage !== 'generating') {
      const position = activeJob?.position ?? 0;
      return { text: 'Queued', sub: position > 0 ? `Position #${position + 1} in queue — will start automatically` : 'Starting shortly…' };
    }
    return { text: 'Generating your video...', sub: `Typically 3-5 minutes • ${elapsedSeconds}s elapsed` };
  };

  const currentProgressMember = PROGRESS_TEAM[progressAvatarIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Animate Image"
        subtitle="Turn a still product image into a polished commercial video."
        backAction={{ content: 'Video', onAction: () => navigate('/app/video') }}
      >
        <div />
      </PageHeader>

      <LibraryPickerModal
        open={libraryPickerOpen}
        onOpenChange={setLibraryPickerOpen}
        onSelect={handleLibrarySelect}
        multiSelect={bulkMode}
        onMultiSelect={handleBulkLibrarySelect}
        maxSelect={Math.max(1, 10 - bulkImages.length)}
      />

      {/* ──── PRE-UPLOAD: Premium First Screen ──── */}
      {!isPipelineActive && !isBulkRunning && !isComplete && !isBulkComplete && !imageUrl && bulkImages.length === 0 && (
        <>
          {/* Batch Mode toggle — paid vs free */}
          <div className={cn(
            'flex items-center justify-between rounded-xl border p-3 transition-colors',
            isPaidUser ? 'border-border bg-card' : 'border-border/60 bg-muted/20'
          )}>
            <div className="flex items-center gap-3">
              {isPaidUser ? (
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Images className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <img
                  src={getOptimizedUrl(TEAM_MEMBERS.find(m => m.name === 'Sophia')?.avatar || '', { quality: 60 })}
                  alt="Sophia"
                  className="w-8 h-8 rounded-full object-cover border-2 border-background shrink-0"
                />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Batch Mode</p>
                {isPaidUser ? (
                  <p className="text-xs text-muted-foreground">Animate up to 10 images with the same settings</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Upgrade to any paid plan to animate multiple images at once
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPaidUser && (
                <button
                  onClick={() => navigate('/app/settings')}
                  className="text-[10px] font-semibold text-primary hover:text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md transition-colors"
                >
                  Upgrade
                </button>
              )}
              <Switch checked={bulkMode} onCheckedChange={setBulkMode} disabled={!isPaidUser} />
            </div>
          </div>

          {/* Two-column layout: Upload Card + How It Works */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
            {/* Left: Dominant Upload Card */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-6 space-y-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 min-h-[400px] flex flex-col">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {bulkMode ? 'Upload your product images' : 'Upload your product image'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {bulkMode
                    ? 'Select up to 10 images — first image is analyzed to configure settings for all.'
                    : "We'll detect category, scene type, and recommended motion automatically."}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={bulkMode}
                onChange={(e) => {
                  if (bulkMode) {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) handleBulkAddFiles(files);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  } else {
                    handleFileSelect(e);
                  }
                }}
                className="hidden"
              />

              {/* Show BulkImageGrid when batch images exist */}
              {bulkMode && bulkImages.length > 0 ? (
                <div className="flex-1 space-y-3">
                  <BulkImageGrid
                    images={bulkImages}
                    maxImages={10}
                    onAddFiles={handleBulkAddFiles}
                    onRemoveImage={handleBulkRemoveImage}
                    disabled={isBulkRunning}
                    onPickFromLibrary={() => setLibraryPickerOpen(true)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex-1 min-h-[200px] rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-primary/[0.02] to-muted/5 hover:from-primary/[0.05] hover:to-muted/10 group"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="text-sm font-medium text-foreground">
                          {bulkMode ? 'Drop images here or click to browse' : 'Drop image here or click to browse'}
                        </span>
                        <p className="text-xs text-muted-foreground">JPG, PNG, WebP — Max 20 MB</p>
                      </div>
                    </>
                  )}
                </button>
              )}

              {/* Secondary input methods */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 gap-1.5 hover:border-primary/30"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-3 w-3" />
                  {bulkMode ? 'Upload images' : 'Upload image'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8 gap-1.5 hover:border-primary/30"
                  onClick={() => setLibraryPickerOpen(true)}
                  disabled={isUploading}
                >
                  <FolderOpen className="h-3 w-3" />
                  Choose from Library
                </Button>
                {!bulkMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 gap-1.5 hover:border-primary/30 cursor-default"
                    disabled={isUploading}
                    onClick={() => toast.info('Press ⌘V (or Ctrl+V) to paste an image')}
                  >
                    <ClipboardPaste className="h-3 w-3" />
                    Paste (⌘V)
                  </Button>
                )}
              </div>
            </div>

            {/* Right: How It Works + Best Results (lighter) */}
            <div className="space-y-4">
              {/* How It Works */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-4 hover:border-border/80 transition-colors">
                <h3 className="text-sm font-semibold text-foreground">How it works</h3>
                <div className="space-y-3">
                  {[
                    { icon: Upload, label: 'Upload your image', sub: 'Any product or campaign photo' },
                    { icon: Brain, label: 'VOVV detects context', sub: 'Category, scene type & motion' },
                    { icon: Wand2, label: 'Choose realistic motion', sub: 'Camera, subject & intensity' },
                    { icon: Clapperboard, label: 'Generate video', sub: 'Polished commercial animation' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <step.icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">{step.label}</p>
                        <p className="text-xs text-muted-foreground">{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Results — Lighter, no border */}
              <div className="rounded-xl bg-muted/20 p-4 space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Best results</h3>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Use clean, sharp images with one clear subject. Well-lit photos with visible product details produce the smoothest motion.
                </p>
              </div>
            </div>
          </div>


          {/* Smart Assistant Banner — smarter copy */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4 hover:bg-muted/40 transition-colors">
            <div className="flex -space-x-2 shrink-0">
              {TIPS_TEAM.map((m) => (
                <img
                  key={m.name}
                  src={getOptimizedUrl(m.avatar, { quality: 60 })}
                  alt={m.name}
                  className="w-7 h-7 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground/70">VOVV AI Studio</p>
              <p className="text-sm text-muted-foreground">
                We detect category, scene type, and motion opportunities so you don't need to prompt from scratch.
              </p>
            </div>
          </div>

        </>
      )}

      {/* ──── POST-UPLOAD: Form with image preview + settings ──── */}
      {!isPipelineActive && !isBulkRunning && !isComplete && !isBulkComplete && (imageUrl || (bulkMode && bulkImages.length > 0)) && (
        <div className="space-y-5">
          {/* Hide small upload preview during analysis — it's shown large in the analysis grid */}
          {!showAnalysisUI && (
            <>
              {bulkMode && isPaidUser ? (
                <div className="rounded-xl border border-border bg-card">
                  <div className="p-4">
                    <BulkImageGrid
                      images={bulkImages}
                      maxImages={10}
                      onAddFiles={handleBulkAddFiles}
                      onRemoveImage={handleBulkRemoveImage}
                      disabled={isBulkRunning}
                      onPickFromLibrary={() => setLibraryPickerOpen(true)}
                    />
                  </div>

                  {/* Per-image customization — integrated into the same card */}
                  {bulkImages.length > 1 && (
                    <>
                      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">Customize per image</span>
                        </div>
                        <Switch checked={customizePerImage} onCheckedChange={(v) => {
                          setCustomizePerImage(v);
                          if (v && !activeImageTab && bulkImages.length > 0) setActiveImageTab(bulkImages[0].id);
                        }} />
                      </div>

                      {customizePerImage && (
                        <div className="border-t border-border px-4 py-4 space-y-3">
                          {/* Thumbnail tab bar */}
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {bulkImages.map((img, idx) => {
                              const isActive = activeImageTab === img.id;
                              const hasOverride = perImageSettings.has(img.id);
                              return (
                                <button
                                  key={img.id}
                                  onClick={() => setActiveImageTab(img.id)}
                                  className={cn(
                                    'relative shrink-0 w-12 h-12 rounded-lg border-2 overflow-hidden transition-all',
                                    isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                                  )}
                                >
                                  <img src={img.preview} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                                  <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-primary-foreground bg-foreground/60 text-center">{idx + 1}</span>
                                  {hasOverride && (
                                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Per-image settings overrides */}
                          {activeImageTab && (() => {
                            const imgOverrides = perImageSettings.get(activeImageTab) || {};
                            const setOverride = (key: string, value: any) => {
                              setPerImageSettings(prev => {
                                const next = new Map(prev);
                                const current = next.get(activeImageTab!) || {};
                                next.set(activeImageTab!, { ...current, [key]: value });
                                return next;
                              });
                            };
                            const imgIdx = bulkImages.findIndex(i => i.id === activeImageTab);
                            return (
                              <div className="rounded-lg bg-muted/20 p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-foreground">Image {imgIdx + 1} overrides</p>
                                  {Object.keys(imgOverrides).length > 0 && (
                                    <button
                                      onClick={() => {
                                        setPerImageSettings(prev => { const next = new Map(prev); next.delete(activeImageTab!); return next; });
                                      }}
                                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      Reset to shared
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Camera Motion</label>
                                    <select
                                      value={imgOverrides.cameraMotion || cameraMotion}
                                      onChange={(e) => setOverride('cameraMotion', e.target.value)}
                                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    >
                                      {CAMERA_MOTIONS.map(cm => (
                                        <option key={cm.id} value={cm.id}>{cm.label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Motion Intensity</label>
                                    <select
                                      value={imgOverrides.motionIntensity || motionIntensity}
                                      onChange={(e) => setOverride('motionIntensity', e.target.value)}
                                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Custom motion note</label>
                                  <Textarea
                                    value={imgOverrides.userPrompt ?? ''}
                                    onChange={(e) => setOverride('userPrompt', e.target.value)}
                                    placeholder="Override motion note for this image..."
                                    className="min-h-[60px] resize-none text-xs"
                                    maxLength={500}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : !bulkMode && (
                <div className="space-y-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 max-w-xs">
                    <img src={imagePreview!} alt="Upload" className="w-full rounded-xl object-cover" />
                    <button onClick={removeImage} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background">
                      <X className="h-4 w-4" />
                    </button>
                    {isUploading && (
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <Progress value={uploadProgress} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <ValidationWarnings warnings={warnings} />

          {/* ──── Premium Analysis Loading State ──── */}
          {showAnalysisUI && (
            <div className="space-y-5">
              {/* Full-width two-column analysis layout */}
              <div className="grid lg:grid-cols-2 gap-5">
                {/* Left: Large image preview */}
                <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 shadow-sm">
                  {(imagePreview || (bulkMode && bulkImages[0]?.preview)) && (
                    <img
                      src={imagePreview || bulkImages[0]?.preview}
                      alt="Uploaded"
                      className="w-full max-h-[500px] object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Image uploaded
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Right: Understanding your image */}
                <div className="rounded-2xl border border-border bg-card shadow-sm p-6 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-semibold text-foreground">Understanding your image</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">Detecting category, scene type, and realistic motion opportunities.</p>
                    </div>

                    {/* Step-based progress */}
                    <div className="space-y-3">
                      {[
                        { icon: CheckCircle2, label: 'Image uploaded' },
                        { icon: ScanSearch, label: 'Detecting category' },
                        { icon: Eye, label: 'Detecting scene type' },
                        { icon: Zap, label: 'Preparing motion recommendations' },
                      ].map((step, i) => {
                        const done = analysisStep > i;
                        const active = analysisStep === i;
                        return (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center gap-3 transition-all duration-500',
                              done || active ? 'opacity-100' : 'opacity-40'
                            )}
                          >
                            {done ? (
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </div>
                            ) : active ? (
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center shrink-0">
                                <step.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                              </div>
                            )}
                            <span className={cn(
                              'text-sm transition-colors duration-300',
                              done ? 'text-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground/60'
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Detection Preview fields */}
                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Detection Preview</p>
                      {(() => {
                        const catLabel = analysisCompleteData?.category
                          ? PRODUCT_CATEGORIES.find(c => c.id === analysisCompleteData.category)?.label || analysisCompleteData.category
                          : null;
                        const sceneLabel = analysisCompleteData?.ecommerce_scene_type
                          ? SCENE_TYPES.find(s => s.id === analysisCompleteData.ecommerce_scene_type)?.label || analysisCompleteData.ecommerce_scene_type
                          : null;
                        const fields = [
                          { label: 'Category', stepThreshold: 1, resolvedValue: catLabel },
                          { label: 'Scene type', stepThreshold: 2, resolvedValue: sceneLabel },
                          { label: 'Recommended motion', stepThreshold: 3, resolvedValue: analysisCompleteData?.recommended_motion_goals?.[0]?.replace(/_/g, ' ') },
                          { label: 'Preservation rules', stepThreshold: 3, resolvedValue: analysisCompleteData ? 'configured' : null },
                        ];
                        return fields.map((field) => (
                          <div key={field.label} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{field.label}</span>
                            {analysisStep > field.stepThreshold && field.resolvedValue ? (
                              <span className="text-foreground font-medium transition-all duration-300">{field.resolvedValue}</span>
                            ) : analysisStep >= field.stepThreshold ? (
                              <span className="text-primary/70 italic flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                detecting…
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40">pending</span>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Bottom tip */}
                  <p className="text-[11px] text-muted-foreground/60 mt-4">
                    Usually takes a few seconds — preparing your motion options.
                  </p>
                </div>
              </div>

              {/* Dynamic assistant card */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4">
                <div className="flex -space-x-2 shrink-0">
                  {TIPS_TEAM.map((m) => (
                    <img key={m.name} src={getOptimizedUrl(m.avatar, { quality: 60 })} alt={m.name} className="w-7 h-7 rounded-full border-2 border-background object-cover" />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground/70">VOVV.AI Studio</p>
                  <p className="text-sm text-muted-foreground">We're analyzing your image to detect category, scene type, and the most realistic motion options.</p>
                </div>
              </div>

              {/* What we're preparing + skeleton placeholders */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* What we're preparing */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">What we're preparing</h4>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Category & Scene</p>
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Motion goals</p>
                      <div className="space-y-1.5">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Refinement controls</p>
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-20 rounded-md" />
                        <Skeleton className="h-7 w-20 rounded-md" />
                        <Skeleton className="h-7 w-20 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best results reminder */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Best results</h4>
                  <ul className="space-y-2.5">
                    {[
                      'AI detects product type and scene for optimal motion planning',
                      'Preservation rules protect brand elements during animation',
                      'Camera + subject motion are tuned to your content category',
                      'Lower intensity = safer for product detail retention',
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Settings skeleton preview */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Output settings</p>
                    <div className="flex gap-2">
                      <Skeleton className="h-7 w-14 rounded-md" />
                      <Skeleton className="h-7 w-14 rounded-md" />
                      <Skeleton className="h-7 w-14 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show form sections after analysis */}
          {!showAnalysisUI && (
            <>
              <ProductContextSelector
                category={category}
                sceneType={sceneType}
                onCategoryChange={setCategory}
                onSceneTypeChange={setSceneType}
                detectedCategory={detectedCategory}
                detectedSceneType={detectedSceneType}
              />

              <MotionGoalSelector
                category={category}
                sceneType={sceneType}
                selectedGoalId={motionGoalId}
                onChange={setMotionGoalId}
                recommendedGoalIds={recommendedGoalIds}
              />

              <MotionRefinementPanel
                cameraMotion={cameraMotion}
                subjectMotion={subjectMotion}
                realismLevel={realismLevel}
                loopStyle={loopStyle}
                motionIntensity={motionIntensity}
                onCameraMotionChange={(v) => { setCameraMotion(v); setSelectedCameraMotions([v]); }}
                onSubjectMotionChange={setSubjectMotion}
                onRealismLevelChange={setRealismLevel}
                onLoopStyleChange={setLoopStyle}
                onMotionIntensityChange={setMotionIntensity}
                multiSelect={isPaidUser}
                isPaidUser={isPaidUser}
                selectedCameraMotions={selectedCameraMotions}
                onMultiCameraMotionChange={(ids) => { setSelectedCameraMotions(ids); setCameraMotion(ids[0]); }}
              />

              <PreservationRulesPanel
                preserveScene={preserveScene}
                preserveProductDetails={preserveProductDetails}
                preserveIdentity={preserveIdentity}
                preserveOutfit={preserveOutfit}
                onPreserveSceneChange={setPreserveScene}
                onPreserveProductDetailsChange={setPreserveProductDetails}
                onPreserveIdentityChange={setPreserveIdentity}
                onPreserveOutfitChange={setPreserveOutfit}
              />

              {/* Settings */}
              <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-medium text-foreground">Settings</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-muted-foreground">Aspect Ratio</label>
                    <InfoTooltip text="Match your output channel. 9:16 for Reels/TikTok, 1:1 for feed posts, 16:9 for ads and web." />
                  </div>
                  <div className="flex gap-2">
                    {ASPECT_RATIOS.map((ar) => (
                      <button key={ar.value} onClick={() => setAspectRatio(ar.value)}
                        className={cn('px-3 py-1 rounded-md text-sm border transition-colors',
                          aspectRatio === ar.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/40'
                        )}>
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <InfoTooltip text="Longer videos use more credits but allow more complex motion sequences." />
                  </div>
                  <div className="flex gap-2">
                    {(['5', '10'] as Duration[]).map((d) => (
                      <button key={d} onClick={() => setDuration(d)}
                        className={cn('px-3 py-1 rounded-md text-sm border transition-colors',
                          duration === d ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/40'
                        )}>
                        {d} seconds
                      </button>
                    ))}
                  </div>
                </div>

                <AudioModeSelector value={audioMode} onChange={(v) => setAudioMode(v as AudioMode)} />
              </div>

              {/* Specific Motion Note */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="text-sm font-medium text-foreground">
                    Specific Motion Note <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <InfoTooltip text="Add precise instructions like 'one basketball dribble' or 'gentle fabric sway at the hem'. Overrides may be softened if they conflict with preservation settings." />
                </div>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Example: one realistic basketball dribble, controlled body movement, background stays static"
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>

              {/* Object grounding note */}
              {analysisResult && !analysisResult.visible_product_detected && (
                <Alert className="bg-muted/30 border-border">
                  <AlertDescription className="text-xs text-muted-foreground flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    No product was explicitly provided. VOVV will keep the video grounded to the visible subject and scene.
                  </AlertDescription>
                </Alert>
              )}




              {/* Generate */}
              <div className="flex flex-col gap-3">
                {(() => {
                  const perVideo = estimateCredits({ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion });
                  const imageCount = bulkMode ? bulkImages.filter(i => i.url).length : 1;
                  const totalVideos = imageCount * motionCount;
                  const totalCredits = perVideo * totalVideos;

                  return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border flex-wrap">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Estimated cost:</span>
                      <span className="text-sm font-semibold text-foreground">
                        {totalVideos > 1 ? (
                          <>
                            {perVideo} × {totalVideos} video{totalVideos > 1 ? 's' : ''} = {totalCredits} credits
                          </>
                        ) : (
                          <>{perVideo} credits</>
                        )}
                      </span>
                      {motionCount > 1 && (
                        <span className="text-xs text-muted-foreground">
                          ({motionCount} camera motion{motionCount > 1 ? 's' : ''}{imageCount > 1 ? ` × ${imageCount} images` : ''})
                        </span>
                      )}
                    </div>
                  );
                })()}
                <Button
                  onClick={handleGenerate}
                  disabled={bulkMode ? bulkImages.filter(i => i.url).length === 0 : !imageUrl || isUploading}
                  className="gap-2 self-start"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  {(() => {
                    const imageCount = bulkMode ? bulkImages.filter(i => i.url).length : 1;
                    const totalVideos = imageCount * motionCount;
                    return totalVideos > 1 ? `Generate ${totalVideos} Videos` : 'Generate Video';
                  })()}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      {/* ──── PIPELINE ACTIVE: Generation in progress ──── */}
      {isPipelineActive && (
        <div className="space-y-6">
          {/* Branded takeover card */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={getOptimizedUrl(currentProgressMember.avatar, { quality: 60 })}
                  alt={currentProgressMember.name}
                  className="w-12 h-12 rounded-full border-2 border-primary/20 object-cover transition-all duration-700"
                />
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 className="h-2.5 w-2.5 animate-spin text-primary-foreground" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">VOVV.AI Studio</p>
                <h2 className="text-lg font-semibold text-foreground">{getStageMessage().text}</h2>
                <p className="text-sm text-muted-foreground">{getStageMessage().sub}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress
                value={
                  isAnalyzing ? 20 :
                  isBuildingPrompt ? 40 :
                  videoStatus === 'creating' ? 50 :
                  (videoStatus === 'queued' || pipelineStage === 'queued') ? 55 :
                  Math.min(60 + (elapsedSeconds / 180) * 35, 95)
                }
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {isAnalyzing ? 'Analyzing…' :
                   isBuildingPrompt ? 'Building prompt…' :
                   videoStatus === 'creating' ? 'Submitting…' :
                   (videoStatus === 'queued' || pipelineStage === 'queued') ? 'Queued' :
                   'Processing…'}
                </span>
                {elapsedSeconds > 0 && <span>{elapsedSeconds}s elapsed</span>}
              </div>
            </div>

            {/* Source image preview */}
            {(imagePreview || (bulkMode && bulkImages[0]?.preview)) && (
              <div className="flex items-center gap-4">
                <div className="rounded-lg overflow-hidden border border-border w-20 h-20 shrink-0">
                  <img src={imagePreview || bulkImages[0]?.preview} alt="Source" className="w-full h-full object-cover" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Your image is being animated with <span className="text-foreground font-medium">{cameraMotion.replace(/_/g, ' ')}</span> camera motion.</p>
                  <p className="text-xs mt-1">Typically takes 1–3 minutes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──── ERROR STATE ──── */}
      {(pipelineStage === 'error' || videoStatus === 'error') && !isPipelineActive && !isComplete && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <X className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Generation failed</h2>
              <p className="text-sm text-muted-foreground mt-1">{videoError || 'Something went wrong. Please try again.'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
            <Button variant="outline" onClick={handleNewProject}>
              Start New Video
            </Button>
          </div>
        </div>
      )}

      {/* ──── BULK PROGRESS ──── */}
      {(isBulkRunning || isBulkComplete) && bulkItems.length > 0 && (
        <div className="space-y-4">
          <BulkProgressBanner items={bulkItems} isComplete={isBulkComplete} />
          {isBulkComplete && (
            <Button variant="outline" onClick={handleNewProject} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Start New Batch
            </Button>
          )}
        </div>
      )}

      {/* ──── COMPLETE: Results panel (single mode) ──── */}
      {isComplete && videoUrl && !isBulkComplete && (
        <VideoResultsPanel
          videoUrl={videoUrl}
          sourceImageUrl={imagePreview || imageUrl || undefined}
          aspectRatio={aspectRatio}
          generationContext={buildGenerationContext()}
          creditCost={estimateCredits({ workflowType: 'animate', duration, audioMode, motionRecipe: cameraMotion })}
          creditsRemaining={creditsBalance}
          onReuse={handleReuse}
          onNewProject={handleNewProject}
          onQuickVariation={handleQuickVariation}
        />
      )}
    </div>
  );
}
