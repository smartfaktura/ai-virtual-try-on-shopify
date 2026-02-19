import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CreditProvider } from '@/contexts/CreditContext';
import { AdminViewProvider } from '@/contexts/AdminViewContext';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { AppShell } from '@/components/app/AppShell';
import Dashboard from '@/pages/Dashboard';
import Generate from '@/pages/Generate';
import BulkGenerate from '@/pages/BulkGenerate';
import Templates from '@/pages/Templates';
import Discover from '@/pages/Discover';
import Jobs from '@/pages/Jobs';
import Settings from '@/pages/Settings';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';

import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/NotFound';
import BrandProfiles from '@/pages/BrandProfiles';
import BrandProfileWizard from '@/components/app/BrandProfileWizard';
import Workflows from '@/pages/Workflows';
import Products from '@/pages/Products';
import CreativeDrops from '@/pages/CreativeDrops';
import MobileUpload from '@/pages/MobileUpload';
import VideoGenerate from '@/pages/VideoGenerate';
import Freestyle from '@/pages/Freestyle';
import About from '@/pages/About';
import Blog from '@/pages/Blog';
import Careers from '@/pages/Careers';
import Press from '@/pages/Press';
import HelpCenter from '@/pages/HelpCenter';
import Contact from '@/pages/Contact';
import Status from '@/pages/Status';
import Changelog from '@/pages/Changelog';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiePolicy from '@/pages/CookiePolicy';
import Team from '@/pages/Team';
import ResetPassword from '@/pages/ResetPassword';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors closeButton />
    <AuthProvider>
      <AdminViewProvider>
      <CreditProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/upload/:sessionToken" element={<MobileUpload />} />
            

            {/* Company pages */}
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
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
                      <Route path="/templates" element={<Discover />} />
                      <Route path="/templates/:id" element={<Templates />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/jobs/:id" element={<Jobs />} />
                      <Route path="/video" element={<VideoGenerate />} />
                      <Route path="/freestyle" element={<Freestyle />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <BuyCreditsModal />
        </BrowserRouter>
      </CreditProvider>
      </AdminViewProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
