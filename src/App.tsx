import { Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AuthProvider } from '@/contexts/AuthContext';
import { CreditProvider } from '@/contexts/CreditContext';
import { AdminViewProvider } from '@/contexts/AdminViewContext';
import { GlobalUpgradeModal } from '@/components/app/GlobalUpgradeModal';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { AppShell } from '@/components/app/AppShell';
import { AppShellLoading } from '@/components/app/AppShellLoading';
import { checkAppVersion } from '@/lib/versionCheck';
import { BrandLoaderProgressGlyph } from '@/components/ui/brand-loader-progress-glyph';
const TryShot = lazy(() => import('@/pages/TryShot'));
const Home = lazy(() => import('@/pages/Home'));

// Lazy-loaded routes for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Generate = lazy(() => import('@/pages/Generate'));
const ProductImages = lazy(() => import('@/pages/ProductImages'));
const TextToProduct = lazy(() => import('@/pages/TextToProduct'));

const Templates = lazy(() => import('@/pages/Templates'));
const Discover = lazy(() => import('@/pages/Discover'));
const Jobs = lazy(() => import('@/pages/Jobs'));
const Settings = lazy(() => import('@/pages/Settings'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
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
const ShortFilm = lazy(() => import('@/pages/video/ShortFilm'));
const StartEndVideo = lazy(() => import('@/pages/video/StartEndVideo'));
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
const AdminRecommendedScenes = lazy(() => import('@/pages/AdminRecommendedScenes'));
const Perspectives = lazy(() => import('@/pages/Perspectives'));
const Learn = lazy(() => import('@/pages/Learn'));
const LearnGuide = lazy(() => import('@/pages/LearnGuide'));
const AppHelp = lazy(() => import('@/pages/AppHelp'));
const BugBounty = lazy(() => import('@/pages/BugBounty'));

const AdminTrendWatch = lazy(() => import('@/pages/AdminTrendWatch'));
const AdminSceneLibrary = lazy(() => import('@/pages/AdminSceneLibrary'));
const AdminPromptTokens = lazy(() => import('@/pages/AdminPromptTokens'));
const AdminBulkPreviewUpload = lazy(() => import('@/pages/AdminBulkPreviewUpload'));
const AdminUgcBulkPreviewUpload = lazy(() => import('@/pages/AdminUgcBulkPreviewUpload'));
const AdminPlanPopups = lazy(() => import('@/pages/AdminPlanPopups'));
const AdminUIAudit = lazy(() => import('@/pages/AdminUIAudit'));
const LoadingLab = lazy(() => import('@/pages/admin/LoadingLab'));
const SceneUsage = lazy(() => import('@/pages/admin/SceneUsage'));
const SeoPageVisuals = lazy(() => import('@/pages/admin/SeoPageVisuals'));
const EmailMarketing = lazy(() => import('@/pages/admin/EmailMarketing'));
const Unsubscribe = lazy(() => import('@/pages/Unsubscribe'));

const BrandModels = lazy(() => import('@/pages/BrandModels'));
const AppPricing = lazy(() => import('@/pages/AppPricing'));
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
const WhyVovv = lazy(() => import('@/pages/WhyVovv'));
const Roadmap = lazy(() => import('@/pages/Roadmap'));
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
const FreestyleFeature = lazy(() => import('@/pages/features/FreestyleFeature'));
const RealEstateStagingFeature = lazy(() => import('@/pages/features/RealEstateStagingFeature'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const TryFree = lazy(() => import('@/pages/TryFree'));

const AIProductPhotography = lazy(() => import('@/pages/seo/AIProductPhotography'));
const AIProductPhotographyCategory = lazy(() => import('@/pages/seo/AIProductPhotographyCategory'));
const ShopifyProductPhotography = lazy(() => import('@/pages/seo/ShopifyProductPhotography'));
const AIProductPhotoGenerator = lazy(() => import('@/pages/seo/AIProductPhotoGenerator'));
const EtsyProductPhotography = lazy(() => import('@/pages/seo/EtsyProductPhotography'));
const AIPhotographyVsPhotoshoot = lazy(() => import('@/pages/seo/AIPhotographyVsPhotoshoot'));
const AIPhotographyVsStudio = lazy(() => import('@/pages/seo/AIPhotographyVsStudio'));
const ProductVisualLibrary = lazy(() => import('@/pages/ProductVisualLibrary'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const CompareHub = lazy(() => import('@/pages/compare/CompareHub'));
const VovvVsFlairAi = lazy(() => import('@/pages/compare/VovvVsFlairAi'));
const VovvVsPhotoroom = lazy(() => import('@/pages/compare/VovvVsPhotoroom'));
const VovvVsClaidAi = lazy(() => import('@/pages/compare/VovvVsClaidAi'));
const VovvVsPebblely = lazy(() => import('@/pages/compare/VovvVsPebblely'));

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
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors closeButton />
    <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<BrandLoaderProgressGlyph fullScreen />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
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
            <Route path="/unsubscribe" element={<Unsubscribe />} />


            {/* Feature pages */}
            <Route path="/features/workflows" element={<WorkflowsFeature />} />
            <Route path="/features/virtual-try-on" element={<VirtualTryOnFeature />} />
            <Route path="/features/creative-drops" element={<CreativeDropsFeature />} />
            <Route path="/features/brand-profiles" element={<BrandProfilesFeature />} />
            <Route path="/features/ai-models-backgrounds" element={<AIModelsBackgroundsFeature />} />
            <Route path="/features/shopify-image-generator" element={<ShopifyImageGenerator />} />
            <Route path="/features/upscale" element={<UpscaleFeature />} />
            <Route path="/features/perspectives" element={<PerspectivesFeature />} />
            <Route path="/features/freestyle" element={<FreestyleFeature />} />
            <Route path="/features/real-estate-staging" element={<RealEstateStagingFeature />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/try" element={<TryFree />} />
            
            <Route path="/ai-product-photography" element={<AIProductPhotography />} />
            <Route path="/ai-product-photography/:slug" element={<AIProductPhotographyCategory />} />
            <Route path="/shopify-product-photography-ai" element={<ShopifyProductPhotography />} />
            <Route path="/ai-product-photo-generator" element={<AIProductPhotoGenerator />} />
            <Route path="/etsy-product-photography-ai" element={<EtsyProductPhotography />} />
            <Route path="/ai-product-photography-vs-photoshoot" element={<AIPhotographyVsPhotoshoot />} />
            <Route path="/ai-product-photography-vs-studio" element={<AIPhotographyVsStudio />} />
            <Route path="/product-visual-library" element={<ProductVisualLibrary />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Comparison pages */}
            <Route path="/compare" element={<CompareHub />} />
            <Route path="/compare/vovv-vs-flair-ai" element={<VovvVsFlairAi />} />
            <Route path="/compare/vovv-vs-photoroom" element={<VovvVsPhotoroom />} />
            <Route path="/compare/vovv-vs-claid-ai" element={<VovvVsClaidAi />} />
            <Route path="/compare/vovv-vs-pebblely" element={<VovvVsPebblely />} />

            {/* Company pages */}
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="/team" element={<Team />} />
            <Route path="/why-vovv" element={<WhyVovv />} />
            <Route path="/roadmap" element={<Roadmap />} />

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
                        <Route path="/generate/text-to-product" element={<TextToProduct />} />
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
                        <Route path="/video/short-film" element={<ShortFilm />} />
                        <Route path="/video/start-end" element={<StartEndVideo />} />
                        <Route path="/video/legacy" element={<VideoGenerate />} />
                        <Route path="/freestyle" element={<Freestyle />} />
                        <Route path="/catalog" element={<CatalogHub />} />
                        <Route path="/catalog/new" element={<CatalogGenerate />} />
                        <Route path="/perspectives" element={<Perspectives />} />
                        <Route path="/learn" element={<Learn />} />
                        <Route path="/learn/freestyle" element={<LearnGuide />} />
                        <Route path="/learn/:section/:slug" element={<LearnGuide />} />
                        <Route path="/help" element={<AppHelp />} />
                        <Route path="/bug-bounty" element={<BugBounty />} />
                        
                        <Route path="/models" element={<BrandModels />} />
                        <Route path="/admin/models" element={<AdminModels />} />
                        <Route path="/admin/scenes" element={<AdminScenes />} />
                        <Route path="/admin/scene-upload" element={<AdminSceneUpload />} />
                        <Route path="/admin/chat-sessions" element={<AdminChatSessions />} />
                        <Route path="/admin/feedback" element={<AdminFeedback />} />
                        <Route path="/admin/status" element={<AdminStatus />} />
                        <Route path="/admin/product-image-scenes" element={<AdminProductImageScenes />} />
                        <Route path="/admin/recommended-scenes" element={<AdminRecommendedScenes />} />
                        <Route path="/admin/trend-watch" element={<AdminTrendWatch />} />
                        <Route path="/admin/scene-library" element={<AdminSceneLibrary />} />
                        <Route path="/admin/prompt-tokens" element={<AdminPromptTokens />} />
                        <Route path="/admin/bulk-preview-upload" element={<AdminBulkPreviewUpload />} />
                        <Route path="/admin/ugc-bulk-upload" element={<AdminUgcBulkPreviewUpload />} />
                        <Route path="/admin/plan-popups" element={<AdminPlanPopups />} />
                        <Route path="/admin/ui-audit" element={<AdminUIAudit />} />
                        <Route path="/admin/loading-lab" element={<LoadingLab />} />
                        <Route path="/admin/scene-performance" element={<SceneUsage />} />
                        <Route path="/admin/seo-page-visuals" element={<SeoPageVisuals />} />
                        <Route path="/admin/email-marketing" element={<EmailMarketing />} />
                        <Route path="/admin/campaigns" element={<EmailMarketing />} />
                        
                        <Route path="/pricing" element={<AppPricing />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/payment-success" element={<PaymentSuccess />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      </Suspense>
                    </AppShell>
                    <GlobalUpgradeModal />
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
  </HelmetProvider>
  </ErrorBoundary>
  );
};

export default App;