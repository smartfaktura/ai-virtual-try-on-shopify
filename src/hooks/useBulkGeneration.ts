import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { Product, ModelProfile, TryOnPose, Template } from '@/types';
import type {
  BulkGenerationConfig,
  BulkGenerationState,
  BulkQueueItem,
  BulkGenerationResult,
  BulkStatus,
  BulkItemStatus,
} from '@/types/bulk';
import {
  MAX_PRODUCTS_PER_BATCH,
  INTER_PRODUCT_DELAY_MS,
  MAX_RETRIES,
  calculateBulkCredits,
} from '@/types/bulk';
import { convertImageToBase64 } from '@/lib/imageUtils';

const STORAGE_KEY_PREFIX = 'bulk_generation_';

interface UseBulkGenerationParams {
  models: ModelProfile[];
  poses: TryOnPose[];
  templates: Template[];
}

interface UseBulkGenerationReturn {
  // State
  state: BulkGenerationState | null;
  isRunning: boolean;
  isPaused: boolean;
  currentItem: BulkQueueItem | null;
  overallProgress: number;
  
  // Actions
  startBulkGeneration: (products: Product[], config: BulkGenerationConfig) => void;
  pauseGeneration: () => void;
  resumeGeneration: () => void;
  cancelGeneration: () => void;
  clearResults: () => void;
  
  // Results
  results: BulkGenerationResult | null;
  
  // Utils
  canStartBulk: (productCount: number, creditsBalance: number, config: BulkGenerationConfig) => { valid: boolean; message?: string };
  checkForIncompleteBatch: () => BulkGenerationState | null;
  resumeIncompleteBatch: (state: BulkGenerationState) => void;
}

function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useBulkGeneration({ models, poses, templates }: UseBulkGenerationParams): UseBulkGenerationReturn {
  const [state, setState] = useState<BulkGenerationState | null>(null);
  const [results, setResults] = useState<BulkGenerationResult | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const processingRef = useRef(false);

  // Computed values
  const isRunning = state?.status === 'running';
  const isPaused = state?.status === 'paused';
  const currentItem = state && state.status === 'running' 
    ? state.queue[state.currentIndex] || null 
    : null;
  
  const overallProgress = state 
    ? Math.round((state.queue.filter(q => q.status === 'completed' || q.status === 'failed').length / state.queue.length) * 100)
    : 0;

  // Save checkpoint to localStorage
  const saveCheckpoint = useCallback((currentState: BulkGenerationState) => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${currentState.batchId}`,
        JSON.stringify({
          ...currentState,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Failed to save bulk generation checkpoint:', e);
    }
  }, []);

  // Clear checkpoint from localStorage
  const clearCheckpoint = useCallback((batchId: string) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${batchId}`);
    } catch (e) {
      console.warn('Failed to clear bulk generation checkpoint:', e);
    }
  }, []);

  // Check for incomplete batches on mount
  const checkForIncompleteBatch = useCallback((): BulkGenerationState | null => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_KEY_PREFIX));
      
      for (const key of keys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const savedState = JSON.parse(stored) as BulkGenerationState & { savedAt: string };
          if (savedState.status === 'running' || savedState.status === 'paused') {
            return savedState;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to check for incomplete batches:', e);
    }
    return null;
  }, []);

  // Validate if bulk generation can start
  const canStartBulk = useCallback((
    productCount: number, 
    creditsBalance: number, 
    config: BulkGenerationConfig
  ): { valid: boolean; message?: string } => {
    if (productCount < 2) {
      return { valid: false, message: 'Select at least 2 products for bulk generation' };
    }
    
    if (productCount > MAX_PRODUCTS_PER_BATCH) {
      return { valid: false, message: `Maximum ${MAX_PRODUCTS_PER_BATCH} products per batch` };
    }
    
    const requiredCredits = calculateBulkCredits(productCount, config.imageCount, config.mode);
    if (requiredCredits > creditsBalance) {
      return { valid: false, message: `Not enough credits. Need ${requiredCredits}, have ${creditsBalance}` };
    }
    
    return { valid: true };
  }, []);

  // Update queue item status
  const updateQueueItem = useCallback((
    productId: string, 
    updates: Partial<BulkQueueItem>
  ) => {
    setState(prev => {
      if (!prev) return prev;
      
      const newQueue = prev.queue.map(item => 
        item.productId === productId ? { ...item, ...updates } : item
      );
      
      const newState = { ...prev, queue: newQueue };
      saveCheckpoint(newState);
      return newState;
    });
  }, [saveCheckpoint]);

  // Process a single item in the queue
  const processQueueItem = useCallback(async (
    item: BulkQueueItem,
    config: BulkGenerationConfig,
    signal: AbortSignal
  ): Promise<string[]> => {
    // Update status to converting
    updateQueueItem(item.productId, { status: 'converting', progress: 10 });
    
    // Convert image to base64
    const base64Image = await convertImageToBase64(item.sourceImageUrl);
    
    if (signal.aborted) throw new Error('Cancelled');
    
    // Update status to generating
    updateQueueItem(item.productId, { status: 'generating', progress: 30 });
    
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL) {
      throw new Error('Supabase URL not configured');
    }

    // Virtual Try-On mode
    if (config.mode === 'virtual-try-on' && config.modelId && config.poseId) {
      const model = models.find(m => m.modelId === config.modelId);
      const pose = poses.find(p => p.poseId === config.poseId);
      
      if (!model || !pose) {
        throw new Error('Model or pose not found');
      }
      
      // Convert model image to base64
      const base64ModelImage = await convertImageToBase64(model.previewUrl);
      
      if (signal.aborted) throw new Error('Cancelled');
      
      updateQueueItem(item.productId, { progress: 50 });
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-tryon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(SUPABASE_ANON_KEY && { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }),
        },
        body: JSON.stringify({
          product: {
            title: item.product.title,
            description: item.product.description,
            productType: item.product.productType,
            imageUrl: base64Image,
          },
          model: {
            name: model.name,
            gender: model.gender,
            ethnicity: model.ethnicity,
            bodyType: model.bodyType,
            ageRange: model.ageRange,
            imageUrl: base64ModelImage,
          },
          pose: {
            name: pose.name,
            description: pose.description,
            category: pose.category,
          },
          aspectRatio: config.aspectRatio,
          imageCount: config.imageCount,
        }),
        signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed (${response.status})`);
      }
      
      const result = await response.json();
      return result.images || [];
    }
    
    // Product-only mode (mock for now - would integrate with actual template generation)
    await delay(2000); // Simulate API call
    
    // Return mock generated images based on template category
    const template = templates.find(t => t.templateId === config.templateId);
    const mockImages = Array(config.imageCount).fill(null).map((_, i) => 
      `https://images.unsplash.com/photo-${1523275335684 + i * 1000}-37898b6baf30?w=800&h=800&fit=crop`
    );
    
    return mockImages;
  }, [models, poses, templates, updateQueueItem]);

  // Main queue processor
  const processQueue = useCallback(async () => {
    if (!state || processingRef.current) return;
    
    processingRef.current = true;
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setState(prev => prev ? { ...prev, status: 'running', startedAt: prev.startedAt || new Date().toISOString() } : prev);
    
    try {
      for (let i = state.currentIndex; i < state.queue.length; i++) {
        // Check if paused or cancelled
        const currentState = await new Promise<BulkGenerationState | null>(resolve => {
          setState(prev => {
            resolve(prev);
            return prev;
          });
        });
        
        if (!currentState || currentState.status === 'paused' || currentState.status === 'cancelled') {
          break;
        }
        
        const item = currentState.queue[i];
        if (item.status === 'completed' || item.status === 'failed') {
          continue;
        }
        
        // Update current index
        setState(prev => prev ? { ...prev, currentIndex: i } : prev);
        
        let success = false;
        let lastError: string | undefined;
        
        // Retry logic
        for (let retry = item.retryCount; retry < MAX_RETRIES; retry++) {
          try {
            if (signal.aborted) throw new Error('Cancelled');
            
            const images = await processQueueItem(item, currentState.config, signal);
            
            // Success
            updateQueueItem(item.productId, { 
              status: 'completed', 
              progress: 100, 
              results: images,
              error: undefined,
            });
            
            success = true;
            break;
          } catch (err) {
            lastError = err instanceof Error ? err.message : 'Unknown error';
            
            if (signal.aborted || lastError === 'Cancelled') {
              break;
            }
            
            // Update retry count
            updateQueueItem(item.productId, { retryCount: retry + 1 });
            
            // Exponential backoff
            if (retry < MAX_RETRIES - 1) {
              await delay(1000 * Math.pow(2, retry));
            }
          }
        }
        
        if (!success && !signal.aborted) {
          updateQueueItem(item.productId, { 
            status: 'failed', 
            progress: 0,
            error: lastError || 'Max retries exceeded',
          });
        }
        
        // Inter-product delay to avoid rate limits
        if (i < state.queue.length - 1 && !signal.aborted) {
          await delay(INTER_PRODUCT_DELAY_MS);
        }
      }
      
      // Generation complete
      if (!signal.aborted) {
        setState(prev => {
          if (!prev) return prev;
          
          const completedState: BulkGenerationState = {
            ...prev,
            status: 'completed',
            completedAt: new Date().toISOString(),
          };
          
          // Calculate results
          const productResults = prev.queue.map(item => ({
            productId: item.productId,
            productTitle: item.product.title,
            images: item.results || [],
            status: item.status === 'completed' ? 'success' as const : 
                   (item.results?.length ? 'partial' as const : 'failed' as const),
          }));
          
          const summary = {
            totalProducts: prev.queue.length,
            successfulProducts: prev.queue.filter(q => q.status === 'completed').length,
            failedProducts: prev.queue.filter(q => q.status === 'failed').length,
            totalImages: prev.queue.reduce((acc, q) => acc + (q.results?.length || 0), 0),
            creditsUsed: calculateBulkCredits(
              prev.queue.filter(q => q.status === 'completed').length,
              prev.config.imageCount,
              prev.config.mode
            ),
          };
          
          setResults({
            batchId: prev.batchId,
            productResults,
            summary,
          });
          
          // Clear checkpoint on completion
          clearCheckpoint(prev.batchId);
          
          toast.success(`Bulk generation complete! ${summary.successfulProducts}/${summary.totalProducts} products processed.`);
          
          return completedState;
        });
      }
    } finally {
      processingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [state, processQueueItem, updateQueueItem, clearCheckpoint]);

  // Start bulk generation
  const startBulkGeneration = useCallback((products: Product[], config: BulkGenerationConfig) => {
    const batchId = generateBatchId();
    
    const queue: BulkQueueItem[] = products.map(product => ({
      productId: product.id,
      product,
      sourceImageUrl: product.images[0]?.url || '',
      status: 'pending' as BulkItemStatus,
      progress: 0,
      retryCount: 0,
    }));
    
    const newState: BulkGenerationState = {
      batchId,
      config,
      queue,
      currentIndex: 0,
      status: 'running',
      startedAt: new Date().toISOString(),
      totalCreditsUsed: 0,
    };
    
    setState(newState);
    setResults(null);
    saveCheckpoint(newState);
    
    toast.info(`Starting bulk generation for ${products.length} products...`);
  }, [saveCheckpoint]);

  // Pause generation
  const pauseGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => {
      if (!prev) return prev;
      const pausedState = { ...prev, status: 'paused' as BulkStatus };
      saveCheckpoint(pausedState);
      toast.info('Bulk generation paused');
      return pausedState;
    });
  }, [saveCheckpoint]);

  // Resume generation
  const resumeGeneration = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, status: 'running' as BulkStatus };
    });
    
    toast.info('Resuming bulk generation...');
  }, []);

  // Resume incomplete batch
  const resumeIncompleteBatch = useCallback((savedState: BulkGenerationState) => {
    setState(savedState);
    setResults(null);
    toast.info(`Resuming bulk generation batch (${savedState.queue.length - savedState.currentIndex} products remaining)...`);
  }, []);

  // Cancel generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState(prev => {
      if (!prev) return prev;
      clearCheckpoint(prev.batchId);
      toast.warning('Bulk generation cancelled');
      return { ...prev, status: 'cancelled' as BulkStatus };
    });
  }, [clearCheckpoint]);

  // Clear results and state
  const clearResults = useCallback(() => {
    if (state?.batchId) {
      clearCheckpoint(state.batchId);
    }
    setState(null);
    setResults(null);
  }, [state?.batchId, clearCheckpoint]);

  // Effect to process queue when status changes to running
  useEffect(() => {
    if (state?.status === 'running' && !processingRef.current) {
      processQueue();
    }
  }, [state?.status, processQueue]);

  return {
    state,
    isRunning,
    isPaused,
    currentItem,
    overallProgress,
    startBulkGeneration,
    pauseGeneration,
    resumeGeneration,
    cancelGeneration,
    clearResults,
    results,
    canStartBulk,
    checkForIncompleteBatch,
    resumeIncompleteBatch,
  };
}
