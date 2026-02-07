import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CreditProvider } from '@/contexts/CreditContext';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';
import { AppShell } from '@/components/app/AppShell';
import Dashboard from '@/pages/Dashboard';
import Generate from '@/pages/Generate';
import BulkGenerate from '@/pages/BulkGenerate';
import Templates from '@/pages/Templates';
import Jobs from '@/pages/Jobs';
import Settings from '@/pages/Settings';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/NotFound';
import BrandProfiles from '@/pages/BrandProfiles';
import Workflows from '@/pages/Workflows';
import Products from '@/pages/Products';
import CreativeDrops from '@/pages/CreativeDrops';
import MobileUpload from '@/pages/MobileUpload';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-right" richColors closeButton />
    <AuthProvider>
      <CreditProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/upload/:sessionToken" element={<MobileUpload />} />

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
                      <Route path="/workflows" element={<Workflows />} />
                      <Route path="/creative-drops" element={<CreativeDrops />} />
                      <Route path="/generate" element={<Generate />} />
                      <Route path="/generate/bulk" element={<BulkGenerate />} />
                      <Route path="/library" element={<Jobs />} />
                      <Route path="/library/:id" element={<Jobs />} />
                      <Route path="/templates" element={<Templates />} />
                      <Route path="/templates/:id" element={<Templates />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/jobs/:id" element={<Jobs />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <BuyCreditsModal />
      </CreditProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
