import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Package, Palette, Layers, Calendar, Image, Film, Compass,
  LayoutTemplate, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight,
  Sparkles, Wand2, ChevronUp, ArrowUpRight, Eye, EyeOff,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useAdminView } from '@/contexts/AdminViewContext';
import { CreditIndicator } from '@/components/app/CreditIndicator';
import { StudioChat } from '@/components/app/StudioChat';
import { MobileTabBar } from '@/components/app/MobileTabBar';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/app' },
  { label: 'Products', icon: Package, path: '/app/products' },
  { label: 'Workflows', icon: Layers, path: '/app/workflows' },
  { label: 'Creative Drops', icon: Calendar, path: '/app/creative-drops' },
  { label: 'Discover', icon: Compass, path: '/app/discover' },
  { label: 'Video', icon: Film, path: '/app/video' },
  { label: 'Freestyle', icon: Wand2, path: '/app/freestyle' },
  { label: 'Library', icon: Image, path: '/app/library' },
];

const configItems = [
  { label: 'Brand Profiles', icon: Palette, path: '/app/brand-profiles' },
  { label: 'Settings', icon: Settings, path: '/app/settings' },
];

const STORAGE_KEY = 'sidebar-collapsed';

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isRealAdmin } = useIsAdmin();
  const { isAdminView, toggleAdminView } = useAdminView();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

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

  const NavItemButton = ({ item }: { item: typeof navItems[0] }) => (
    <button
      onClick={() => handleNav(item.path)}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 relative group',
        collapsed ? 'justify-center px-0 py-3' : 'px-3 py-3',
        isActive(item.path)
          ? 'bg-white/[0.08] text-white'
          : 'text-white/50 hover:bg-white/[0.04] hover:text-white/75'
      )}
      title={collapsed ? item.label : undefined}
    >
      {/* Active accent bar */}
      {isActive(item.path) && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
      )}
      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </button>
  );

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div className="flex flex-col h-full">
        {/* Logo + Collapse Toggle */}
        <div className={cn('flex items-center border-b border-white/[0.06]', isCollapsed ? 'justify-center px-3 pt-6 pb-5' : 'justify-between px-5 pt-6 pb-5')}>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg text-sidebar-foreground tracking-tight">VOVV.AI</span>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(c => !c)}
              className={cn(
                'p-1.5 rounded-lg text-sidebar-foreground/30 hover:text-sidebar-foreground/60 hover:bg-white/[0.04] transition-colors',
                isCollapsed && 'mt-3'
              )}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Generate CTA */}
        <div className={cn('pt-5 pb-2', isCollapsed ? 'px-2' : 'px-4')}>
          <button
            onClick={() => handleNav('/app/freestyle')}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold transition-all duration-150 hover:bg-primary/90 shadow-lg shadow-primary/25',
              isCollapsed ? 'px-2 py-3 text-xs' : 'px-3 py-3 text-sm'
            )}
            title={isCollapsed ? 'Generate' : undefined}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && 'Generate'}
          </button>
        </div>

        {/* Main Nav */}
        <nav className={cn('flex-1 py-4 space-y-1 overflow-y-auto', isCollapsed ? 'px-2' : 'px-4')}>
          {!isCollapsed && (
            <p className="px-3 py-2 mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30">Main</p>
          )}
          {navItems.map((item) => (
            <NavItemButton key={item.path} item={item} />
          ))}

          <div className="pt-6">
            {!isCollapsed && (
              <p className="px-3 py-2 mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/30">Configuration</p>
            )}
            {configItems.map((item) => (
              <NavItemButton key={item.path} item={item} />
            ))}
          </div>
        </nav>

        {/* Credits */}
        <div className={cn('border-t border-white/[0.06] pt-4', isCollapsed ? 'px-2 pb-2' : 'px-4 pb-3')}>
          {isCollapsed ? (
            <button
              onClick={() => navigate('/app/settings')}
              className="flex justify-center w-full"
              title="Upgrade plan"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 text-sidebar-foreground/70" />
              </div>
            </button>
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
                {isRealAdmin && (
                  <button
                    onClick={() => { toggleAdminView(); }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground"
                  >
                    {isAdminView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {isAdminView ? 'View as visitor' : 'View as admin'}
                  </button>
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
    <div className="flex h-screen bg-background">
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
            <div className="absolute top-4 right-3">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-white/[0.04]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Main Content — no header */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Studio Team Chat */}
      <StudioChat />
    </div>
  );
}
