import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
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
import Landing from '@/pages/Landing';

// Lazy-loaded routes for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Generate = lazy(() => import('@/pages/Generate'));
const BulkGenerate = lazy(() => import('@/pages/BulkGenerate'));
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
const CreativeDrops = lazy(() => import('@/pages/CreativeDrops'));
const MobileUpload = lazy(() => import('@/pages/MobileUpload'));
const VideoGenerate = lazy(() => import('@/pages/VideoGenerate'));
const Freestyle = lazy(() => import('@/pages/Freestyle'));
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
const WorkflowsFeature = lazy(() => import('@/pages/features/WorkflowsFeature'));
const VirtualTryOnFeature = lazy(() => import('@/pages/features/VirtualTryOnFeature'));
const CreativeDropsFeature = lazy(() => import('@/pages/features/CreativeDropsFeature'));
const BrandProfilesFeature = lazy(() => import('@/pages/features/BrandProfilesFeature'));
const Pricing = lazy(() => import('@/pages/Pricing'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors closeButton />
    <AuthProvider>
      <AdminViewProvider>
      <CreditProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/discover" element={<PublicDiscover />} />
            <Route path="/discover/:itemId" element={<PublicDiscover />} />
            <Route path="/upload/:sessionToken" element={<MobileUpload />} />


            {/* Feature pages */}
            <Route path="/features/workflows" element={<WorkflowsFeature />} />
            <Route path="/features/virtual-try-on" element={<VirtualTryOnFeature />} />
            <Route path="/features/creative-drops" element={<CreativeDropsFeature />} />
            <Route path="/features/brand-profiles" element={<BrandProfilesFeature />} />
            <Route path="/pricing" element={<Pricing />} />

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

            {/* Protected app routes */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Suspense fallback={<AppShellLoading />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/brand-profiles" element={<BrandProfiles />} />
                      <Route path="/brand-profiles/new" element={<BrandProfileWizard />} />
                      <Route path="/brand-profiles/:id/edit" element={<BrandProfileWizard />} />
                      <Route path="/workflows" element={<Workflows />} />
                      <Route path="/creative-drops" element={<CreativeDrops />} />
                      <Route path="/generate" element={<Generate />} />
                      <Route path="/generate/bulk" element={<BulkGenerate />} />
                      <Route path="/library" element={<Jobs />} />
                      <Route path="/library/:id" element={<Jobs />} />
                      <Route path="/discover" element={<Discover />} />
                      <Route path="/discover/:itemId" element={<Discover />} />
                      <Route path="/templates" element={<Discover />} />
                      <Route path="/templates/:id" element={<Templates />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/jobs/:id" element={<Jobs />} />
                      <Route path="/video" element={<VideoGenerate />} />
                      <Route path="/freestyle" element={<Freestyle />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    </Suspense>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <BuyCreditsModal />
        </BrowserRouter>
      </CreditProvider>
      </AdminViewProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;