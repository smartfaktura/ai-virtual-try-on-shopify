import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Package, Palette, Layers, Calendar, Image, Film, Compass,
  Settings, LogOut, Menu, X, ChevronLeft, ChevronRight,
  Sparkles, ChevronUp, ArrowUpRight, Eye, EyeOff, MessageSquare, Gift, Users,
  TrendingUp, BookOpen, Clock, Camera,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAdminView } from '@/contexts/AdminViewContext';
import { CreditIndicator } from '@/components/app/CreditIndicator';
import { EarnCreditsModal } from '@/components/app/EarnCreditsModal';

const StudioChat = lazy(() => import('@/components/app/StudioChat').then(m => ({ default: m.StudioChat })));
const GlobalGenerationBar = lazy(() => import('@/components/app/GlobalGenerationBar').then(m => ({ default: m.GlobalGenerationBar })));

import { toast } from '@/hooks/use-toast';
import { useCredits } from '@/contexts/CreditContext';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

// Prefetch map for top routes — triggers lazy chunk download on hover
const prefetchMap: Record<string, () => void> = {
  '/app': () => { import('@/pages/Dashboard'); },
  '/app/products': () => { import('@/pages/Products'); },
  '/app/generate': () => { import('@/pages/Generate'); },
  '/app/workflows': () => { import('@/pages/Workflows'); },
  '/app/library': () => { import('@/pages/Jobs'); },
  '/app/freestyle': () => { import('@/pages/Freestyle'); },
  '/app/discover': () => { import('@/pages/Discover'); },
  '/app/settings': () => { import('@/pages/Settings'); },
  '/app/creative-drops': () => { import('@/pages/CreativeDrops'); },
  '/app/video': () => { import('@/pages/VideoHub'); },
  '/app/models': () => { import('@/pages/BrandModels'); },
  '/app/brand-profiles': () => { import('@/pages/BrandProfiles'); },
  '/app/catalog': () => { import('@/pages/CatalogHub'); },
  '/app/catalog/new': () => { import('@/pages/CatalogGenerate'); },
};
const prefetched = new Set<string>();
const prefetchRoute = (path: string) => {
  if (prefetched.has(path)) return;
  const fn = prefetchMap[path];
  if (fn) { prefetched.add(path); fn(); }
};

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', icon: Home, path: '/app' },
    ],
  },
  {
    label: 'Create',
    items: [
      { label: 'Visual Studio', icon: Layers, path: '/app/workflows' },
      { label: 'Create with Prompt', icon: Sparkles, path: '/app/freestyle' },
      { label: 'Video', icon: Film, path: '/app/video' },
      { label: 'Explore', icon: Compass, path: '/app/discover' },
    ],
  },
  {
    label: 'Assets',
    items: [
      { label: 'Products', icon: Package, path: '/app/products' },
      { label: 'Brand Models', icon: Users, path: '/app/models' },
      { label: 'Library', icon: Image, path: '/app/library' },
    ],
  },
];

type NavItem = { label: string; icon: typeof Home; path: string };

const STORAGE_KEY = 'sidebar-collapsed';

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin, isRealAdmin } = useIsAdmin();
  const { isAdminView, toggleAdminView } = useAdminView();
  const { balance, isLow, isEmpty, openBuyModal } = useCredits();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [earnCreditsOpen, setEarnCreditsOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

  // Reset scroll position on route change (skip Discover to preserve feed position)
  useEffect(() => {
    if (location.pathname.startsWith('/app/discover')) return;
    const main = document.getElementById('app-main-scroll');
    if (main) main.scrollTop = 0;
  }, [location.pathname]);

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

  const NavItemButton = ({ item }: { item: NavItem }) => {
    const isComingSoon = false;
    const isEarnCredits = item.path === '#earn-credits';

    const handleClick = () => {
      if (isComingSoon) {
        toast({ title: 'Coming soon!', description: 'Video generation will be available soon.' });
        return;
      }
      if (isEarnCredits) {
        setEarnCreditsOpen(true);
        return;
      }
      handleNav(item.path);
    };

    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => prefetchRoute(item.path)}
        className={cn(
          'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
          collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
          isComingSoon
            ? 'text-white/30 cursor-default'
            : isEarnCredits
              ? 'text-white/50 hover:bg-white/[0.04] hover:text-white/75'
              : isActive(item.path)
                ? 'bg-white/[0.08] text-white'
                : 'text-white/50 hover:bg-white/[0.04] hover:text-white/75'
        )}
        title={collapsed ? item.label : undefined}
      >
        {!isComingSoon && !isEarnCredits && isActive(item.path) && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
        )}
        <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
        {!collapsed && (
          <span className="flex items-center gap-2">
            {item.label}
            {isComingSoon && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-white/[0.08] text-white/40">
                Soon
              </span>
            )}
          </span>
        )}
      </button>
    );
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div className="flex flex-col h-full">
        {/* Logo + Collapse Toggle */}
        <div className={cn('flex items-center border-b border-white/[0.06] relative', isCollapsed ? 'justify-center px-3 pt-6 pb-5' : 'justify-start px-5 pt-6 pb-5')}>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/app')}>
            {!isCollapsed && (
              <span className="font-bold text-xl text-sidebar-foreground tracking-tight">VOVV.AI</span>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(c => !c)}
              className={cn(
                'absolute right-3 p-1.5 rounded-lg text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-white/[0.04] transition-colors',
                isCollapsed && 'relative right-auto mt-3'
              )}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Create Visuals CTA */}
        <div className={cn('pt-4 pb-3', isCollapsed ? 'px-2' : 'px-4')}>
          <button
            onClick={() => handleNav('/app/generate/product-images')}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold transition-all duration-150 hover:bg-primary/90 shadow-lg shadow-primary/25',
              isCollapsed ? 'px-2 py-3 text-xs' : 'px-3 py-3 text-sm'
            )}
            title={isCollapsed ? 'Create Visuals' : undefined}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && 'Create Visuals'}
          </button>
        </div>

        {/* Main Nav */}
        <nav className={cn('flex-1 pt-2 pb-4 overflow-y-auto', isCollapsed ? 'px-2' : 'px-4')}>
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              {isCollapsed ? (
                gi > 0 && <div className="h-px bg-white/[0.06] mx-2 mb-2" />
              ) : (
                <p className="px-3 mb-1 text-[10px] uppercase tracking-widest font-semibold text-white/25 select-none">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavItemButton key={item.path} item={item} />
              ))}
            </div>
          ))}
        </nav>


        {/* Credits */}
        <div className={cn('border-t border-white/[0.06] pt-4', isCollapsed ? 'px-2 pb-2' : 'px-4 pb-3')}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={openBuyModal}
                className="flex flex-col items-center gap-1"
                title={`${balance} credits`}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  isEmpty ? 'bg-destructive/30' : 'bg-primary/20 hover:bg-primary/30'
                )}>
                  <Sparkles className={cn('w-3.5 h-3.5', isEmpty ? 'text-red-400' : 'text-sidebar-foreground/70')} />
                </div>
                <span className={cn(
                  'text-[10px] font-bold',
                  isEmpty ? 'text-red-400' : 'text-sidebar-foreground/50'
                )}>{balance}</span>
              </button>
              <button
                onClick={() => navigate('/app/settings')}
                title="Upgrade plan"
                className="text-sidebar-foreground/30 hover:text-sidebar-foreground/60 transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <CreditIndicator />
          )}
        </div>


        {/* User Profile */}
        <div className={cn('border-t border-white/[0.06] relative', isCollapsed ? 'px-2 py-3' : 'px-4 py-3')}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'w-full flex items-center rounded-xl transition-colors hover:bg-white/[0.04]',
              isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
                  <p className="text-[11px] text-sidebar-foreground/40 truncate">{userEmail}</p>
                </div>
                <ChevronUp className="w-3.5 h-3.5 text-sidebar-foreground/30 flex-shrink-0" />
              </>
            )}
          </button>

          {/* User dropdown — anchored above */}
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className={cn(
                'absolute bottom-full mb-2 w-52 bg-popover border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden',
                isCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-3'
              )}>
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
                <button
                  onClick={() => { navigate('/app/settings'); setUserMenuOpen(false); }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Account settings
                </button>
                <button
                  onClick={() => { navigate('/app/brand-profiles'); setUserMenuOpen(false); }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Brand Profiles
                </button>
                <button
                  onClick={() => { setEarnCreditsOpen(true); setUserMenuOpen(false); }}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Earn Credits
                </button>
                {isRealAdmin && (
                  <>
                    <button
                      onClick={() => { toggleAdminView(); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      {isAdminView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {isAdminView ? 'View as visitor' : 'View as admin'}
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/chat-sessions'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat Sessions
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/feedback'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Feedback
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/models'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <Eye className="w-4 h-4" />
                      Models
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/scenes'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <Eye className="w-4 h-4" />
                      Scenes
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/product-image-scenes'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <Camera className="w-4 h-4" />
                      Product Visuals Scenes
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/trend-watch'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Trend Watch
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/scene-library'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <BookOpen className="w-4 h-4" />
                      Scene Library
                    </button>
                    <button
                      onClick={() => { navigate('/app/admin/conversion'); setUserMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                    >
                      <Sparkles className="w-4 h-4" />
                      Conversion
                    </button>
                  </>
                )}
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
      </div>
    );
  };

  return (
    <div className="flex h-dvh bg-background" style={{ '--sidebar-offset': collapsed ? '96px' : '264px' } as React.CSSProperties}>
      {/* Desktop Floating Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar m-3 rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/20 transition-all duration-300 flex-shrink-0',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-sidebar shadow-2xl">
            <div className="absolute top-4 right-3 z-10">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-white/[0.04]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Mobile Floating Header */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden p-3">
        <div className="flex items-center justify-between h-14 px-4 rounded-2xl border border-white/[0.06] bg-sidebar shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/app')}>
            <span className="font-bold text-xl text-sidebar-foreground tracking-tight">VOVV.AI</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Credit pill */}
            <button
              onClick={openBuyModal}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-colors',
                isEmpty
                  ? 'bg-destructive/30 border-destructive/40 text-red-400'
                  : isLow
                    ? 'bg-white/[0.06] border-white/10 text-sidebar-foreground/70 animate-pulse'
                    : 'bg-white/[0.06] border-white/10 text-sidebar-foreground/70 hover:bg-white/10'
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{balance}</span>
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/[0.06] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main id="app-main-scroll" className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-8 pb-4 sm:pb-6 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Studio Team Chat */}
      <Suspense fallback={null}><StudioChat /></Suspense>

      {/* Global Generation Progress */}
      <Suspense fallback={null}><GlobalGenerationBar /></Suspense>

      {/* Earn Credits Modal */}
      <EarnCreditsModal open={earnCreditsOpen} onOpenChange={setEarnCreditsOpen} />
    </div>
  );
}
