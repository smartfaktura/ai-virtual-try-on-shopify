import { Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AuthProvider } from '@/contexts/AuthContext';
import { CreditProvider } from '@/contexts/CreditContext';
import { AdminViewProvider } from '@/contexts/AdminViewContext';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { AppShell } from '@/components/app/AppShell';
import { AppShellLoading } from '@/components/app/AppShellLoading';
import { checkAppVersion } from '@/lib/versionCheck';
import Landing from '@/pages/Landing';

const TryShot = lazy(() => import('@/pages/TryShot'));
const Home = lazy(() => import('@/pages/Home'));

// Lazy-loaded routes for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Generate = lazy(() => import('@/pages/Generate'));
const ProductImages = lazy(() => import('@/pages/ProductImages'));

const Templates = lazy(() => import('@/pages/Templates'));
const Discover = lazy(() => import('@/pages/Discover'));
const Jobs = lazy(() => import('@/pages/Jobs'));
const Settings = lazy(() => import('@/pages/Settings'));
const Auth = lazy(() => import('@/pages/Auth'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const BrandProfiles = lazy(() => import('@/pages/BrandProfiles'));
const BrandProfileWizard = lazy(() => import('@/components/app/BrandProfileWizard'));
const Workflows = lazy(() => import('@/pages/Workflows'));
const Products = lazy(() => import('@/pages/Products'));
const AddProduct = lazy(() => import('@/pages/AddProduct'));
const CreativeDrops = lazy(() => import('@/pages/CreativeDrops'));
const MobileUpload = lazy(() => import('@/pages/MobileUpload'));
const VideoGenerate = lazy(() => import('@/pages/VideoGenerate'));
const VideoHub = lazy(() => import('@/pages/VideoHub'));
const AnimateVideo = lazy(() => import('@/pages/video/AnimateVideo'));
const Freestyle = lazy(() => import('@/pages/Freestyle'));
const CatalogHub = lazy(() => import('@/pages/CatalogHub'));
const CatalogGenerate = lazy(() => import('@/pages/CatalogGenerate'));
const AdminScenes = lazy(() => import('@/pages/AdminScenes'));
const AdminSceneUpload = lazy(() => import('@/pages/AdminSceneUpload'));
const AdminModels = lazy(() => import('@/pages/AdminModels'));
const AdminChatSessions = lazy(() => import('@/pages/AdminChatSessions'));
const AdminFeedback = lazy(() => import('@/pages/AdminFeedback'));
const AdminStatus = lazy(() => import('@/pages/AdminStatus'));
const AdminProductImageScenes = lazy(() => import('@/pages/AdminProductImageScenes'));
const Perspectives = lazy(() => import('@/pages/Perspectives'));
const AdminTrendWatch = lazy(() => import('@/pages/AdminTrendWatch'));
const AdminSceneLibrary = lazy(() => import('@/pages/AdminSceneLibrary'));
const AdminPromptTokens = lazy(() => import('@/pages/AdminPromptTokens'));
const BrandModels = lazy(() => import('@/pages/BrandModels'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Careers = lazy(() => import('@/pages/Careers'));
const Press = lazy(() => import('@/pages/Press'));
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const Contact = lazy(() => import('@/pages/Contact'));
const Status = lazy(() => import('@/pages/Status'));
const Changelog = lazy(() => import('@/pages/Changelog'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));
const Team = lazy(() => import('@/pages/Team'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const PublicDiscover = lazy(() => import('@/pages/PublicDiscover'));
const PublicFreestyle = lazy(() => import('@/pages/PublicFreestyle'));
const WorkflowsFeature = lazy(() => import('@/pages/features/WorkflowsFeature'));
const VirtualTryOnFeature = lazy(() => import('@/pages/features/VirtualTryOnFeature'));
const CreativeDropsFeature = lazy(() => import('@/pages/features/CreativeDropsFeature'));
const BrandProfilesFeature = lazy(() => import('@/pages/features/BrandProfilesFeature'));
const AIModelsBackgroundsFeature = lazy(() => import('@/pages/features/AIModelsBackgroundsFeature'));
const ShopifyImageGenerator = lazy(() => import('@/pages/features/ShopifyImageGenerator'));
const UpscaleFeature = lazy(() => import('@/pages/features/UpscaleFeature'));
const PerspectivesFeature = lazy(() => import('@/pages/features/PerspectivesFeature'));
const RealEstateStagingFeature = lazy(() => import('@/pages/features/RealEstateStagingFeature'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const TryFree = lazy(() => import('@/pages/TryFree'));
const AIProductPhotographyEcommerce = lazy(() => import('@/pages/seo/AIProductPhotographyEcommerce'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

const App = () => {
  useEffect(() => { checkAppVersion(); }, []);

  return (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors closeButton />
    <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/discover" element={<PublicDiscover />} />
            <Route path="/discover/:itemId" element={<PublicDiscover />} />
            <Route path="/freestyle" element={<PublicFreestyle />} />
            <Route path="/freestyle/:itemId" element={<PublicFreestyle />} />
            <Route path="/upload/:sessionToken" element={<MobileUpload />} />
            <Route path="/tryshot" element={<TryShot />} />
            <Route path="/tryshot/:domain" element={<TryShot />} />


            {/* Feature pages */}
            <Route path="/features/workflows" element={<WorkflowsFeature />} />
            <Route path="/features/virtual-try-on" element={<VirtualTryOnFeature />} />
            <Route path="/features/creative-drops" element={<CreativeDropsFeature />} />
            <Route path="/features/brand-profiles" element={<BrandProfilesFeature />} />
            <Route path="/features/ai-models-backgrounds" element={<AIModelsBackgroundsFeature />} />
            <Route path="/features/shopify-image-generator" element={<ShopifyImageGenerator />} />
            <Route path="/features/upscale" element={<UpscaleFeature />} />
            <Route path="/features/perspectives" element={<PerspectivesFeature />} />
            <Route path="/features/real-estate-staging" element={<RealEstateStagingFeature />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/try" element={<TryFree />} />
            <Route path="/ai-product-photography-for-ecommerce" element={<AIProductPhotographyEcommerce />} />

            {/* Company pages */}
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/team" element={<Team />} />

            {/* Support pages */}
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/status" element={<Status />} />
            <Route path="/changelog" element={<Changelog />} />

            {/* Legal pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />

            {/* Protected app routes — CreditProvider scoped here */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AdminViewProvider>
                  <CreditProvider>
                    <AppShell>
                      <Suspense fallback={<AppShellLoading />}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/new" element={<AddProduct />} />
                        <Route path="/products/:id/edit" element={<AddProduct />} />
                        <Route path="/brand-profiles" element={<BrandProfiles />} />
                        <Route path="/brand-profiles/new" element={<BrandProfileWizard />} />
                        <Route path="/brand-profiles/:id/edit" element={<BrandProfileWizard />} />
                        <Route path="/workflows" element={<Workflows />} />
                        <Route path="/creative-drops" element={<CreativeDrops />} />
                        <Route path="/generate" element={<Generate />} />
                        <Route path="/generate/product-images" element={<ProductImages />} />
                        <Route path="/generate/:workflowSlug" element={<Generate />} />
                        <Route path="/library" element={<Jobs />} />
                        <Route path="/library/:id" element={<Jobs />} />
                        <Route path="/discover" element={<Discover />} />
                        <Route path="/discover/:itemId" element={<Discover />} />
                        <Route path="/templates" element={<Discover />} />
                        <Route path="/templates/:id" element={<Templates />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/jobs/:id" element={<Jobs />} />
                        <Route path="/video" element={<VideoHub />} />
                        <Route path="/video/animate" element={<AnimateVideo />} />
                        <Route path="/video/legacy" element={<VideoGenerate />} />
                        <Route path="/freestyle" element={<Freestyle />} />
                        <Route path="/catalog" element={<CatalogHub />} />
                        <Route path="/catalog/new" element={<CatalogGenerate />} />
                        <Route path="/perspectives" element={<Perspectives />} />
                        <Route path="/models" element={<BrandModels />} />
                        <Route path="/admin/models" element={<AdminModels />} />
                        <Route path="/admin/scenes" element={<AdminScenes />} />
                        <Route path="/admin/scene-upload" element={<AdminSceneUpload />} />
                        <Route path="/admin/chat-sessions" element={<AdminChatSessions />} />
                        <Route path="/admin/feedback" element={<AdminFeedback />} />
                        <Route path="/admin/status" element={<AdminStatus />} />
                        <Route path="/admin/product-image-scenes" element={<AdminProductImageScenes />} />
                        <Route path="/admin/trend-watch" element={<AdminTrendWatch />} />
                        <Route path="/admin/scene-library" element={<AdminSceneLibrary />} />
                        <Route path="/admin/prompt-tokens" element={<AdminPromptTokens />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      </Suspense>
                    </AppShell>
                    <BuyCreditsModal />
                  </CreditProvider>
                  </AdminViewProvider>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;