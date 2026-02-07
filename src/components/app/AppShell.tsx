import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Palette, Layers, Calendar, Image, Settings, LogOut, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { CreditIndicator } from '@/components/app/CreditIndicator';
import { StudioChat } from '@/components/app/StudioChat';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/app' },
  { label: 'Products', icon: Package, path: '/app/products' },
  { label: 'Brand Profiles', icon: Palette, path: '/app/brand-profiles' },
  { label: 'Workflows', icon: Layers, path: '/app/workflows' },
  { label: 'Creative Drops', icon: Calendar, path: '/app/creative-drops' },
  { label: 'Library', icon: Image, path: '/app/library' },
];

const configItems = [
  { label: 'Settings', icon: Settings, path: '/app/settings' },
];

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app' || location.pathname === '/app/';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo — matches landing nav */}
      <div className="px-5 pt-6 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">bf</span>
          </div>
          <span className="font-bold text-lg text-sidebar-foreground tracking-tight">brandframe.ai</span>
        </div>
      </div>

      {/* Generate CTA */}
      <div className="px-3 pt-5 pb-2">
        <button
          onClick={() => handleNav('/app/generate')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all duration-150 hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <p className="px-3 py-1.5 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/35">Main</p>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive(item.path)
                ? 'bg-white/[0.1] text-white'
                : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </button>
        ))}

        <div className="pt-8">
          <p className="px-3 py-1.5 mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/35">Configuration</p>
          {configItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive(item.path)
                  ? 'bg-white/[0.1] text-white'
                  : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Credits */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-4">
        <CreditIndicator />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar shadow-xl">
            <div className="absolute top-4 right-3">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-white/[0.04]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0 border-b border-border shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium">{displayName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-2xl shadow-lg z-50 py-1 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/app/settings'); setUserMenuOpen(false); }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Account settings
                  </button>
                  <button
                    onClick={() => { handleSignOut(); setUserMenuOpen(false); }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Studio Team Chat */}
      <StudioChat />
    </div>
  );
}
