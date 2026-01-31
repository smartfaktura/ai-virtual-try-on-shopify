import '@shopify/polaris/build/esm/styles.css';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CreditProvider } from '@/contexts/CreditContext';
import { BuyCreditsModal } from '@/components/app/BuyCreditsModal';
import { AppShell } from '@/components/app/AppShell';
import Dashboard from '@/pages/Dashboard';
import Generate from '@/pages/Generate';
import BulkGenerate from '@/pages/BulkGenerate';
import Templates from '@/pages/Templates';
import Jobs from '@/pages/Jobs';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider i18n={enTranslations}>
      <Toaster position="top-right" richColors closeButton />
      <CreditProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/generate/bulk" element={<BulkGenerate />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/:id" element={<Templates />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<Jobs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
        <BuyCreditsModal />
      </CreditProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
