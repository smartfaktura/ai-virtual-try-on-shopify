import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Sparkles, Image, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTabBarProps {
  onOpenSidebar: () => void;
}

const tabs = [
  { label: 'Home', icon: Home, path: '/app' },
  { label: 'Products', icon: Package, path: '/app/products' },
  { label: 'Generate', icon: Sparkles, path: '/app/freestyle' },
  { label: 'Library', icon: Image, path: '/app/library' },
] as const;

export function MobileTabBar({ onOpenSidebar }: MobileTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app' || location.pathname === '/app/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-sidebar border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
              isActive(tab.path)
                ? 'text-primary'
                : 'text-sidebar-foreground/40 active:text-sidebar-foreground/60'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-sidebar-foreground/40 active:text-sidebar-foreground/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
