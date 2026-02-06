import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Frame,
  Navigation,
  TopBar,
} from '@shopify/polaris';
import {
  HomeIcon,
  ImageIcon,
  LayoutBlockIcon,
  ClockIcon,
  SettingsIcon,
  ExitIcon,
} from '@shopify/polaris-icons';
import { CreditIndicator } from '@/components/app/CreditIndicator';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [userMenuActive, setUserMenuActive] = useState(false);

  const toggleMobileNavigation = useCallback(
    () => setMobileNavigationActive((active) => !active),
    []
  );

  const toggleUserMenu = useCallback(
    () => setUserMenuActive((active) => !active),
    []
  );

  const handleNavigationDismiss = useCallback(() => {
    setMobileNavigationActive(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const initials = displayName.charAt(0).toUpperCase();

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [
            { content: 'Account settings', onAction: () => navigate('/app/settings') },
          ],
        },
        {
          items: [
            { content: 'Sign out', icon: ExitIcon, onAction: handleSignOut },
          ],
        },
      ]}
      name={displayName}
      detail={userEmail}
      initials={initials}
      open={userMenuActive}
      onToggle={toggleUserMenu}
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      onNavigationToggle={toggleMobileNavigation}
    />
  );

  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            label: 'Dashboard',
            icon: HomeIcon,
            selected: location.pathname === '/app' || location.pathname === '/app/',
            onClick: () => navigate('/app'),
          },
          {
            label: 'Generate',
            icon: ImageIcon,
            selected: location.pathname.startsWith('/app/generate'),
            onClick: () => navigate('/app/generate'),
          },
          {
            label: 'Templates',
            icon: LayoutBlockIcon,
            selected: location.pathname.startsWith('/app/templates'),
            onClick: () => navigate('/app/templates'),
          },
          {
            label: 'Jobs',
            icon: ClockIcon,
            selected: location.pathname.startsWith('/app/jobs'),
            onClick: () => navigate('/app/jobs'),
          },
        ]}
      />
      <Navigation.Section
        title="Configuration"
        items={[
          {
            label: 'Settings',
            icon: SettingsIcon,
            selected: location.pathname.startsWith('/app/settings'),
            onClick: () => navigate('/app/settings'),
          },
        ]}
      />
      <Navigation.Section
        title=""
        items={[]}
        fill
      />
      <div className="p-3">
        <CreditIndicator />
      </div>
    </Navigation>
  );

  const logo = {
    width: 36,
    topBarSource: 'data:image/svg+xml,' + encodeURIComponent(`
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="8" fill="#008060"/>
        <path d="M10 18L16 12L22 18L28 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 24L16 18L22 24L28 18" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
    accessibilityLabel: 'nanobanna',
    url: '/app',
  };

  return (
    <Frame
      logo={logo}
      topBar={topBarMarkup}
      navigation={navigationMarkup}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={handleNavigationDismiss}
    >
      {children}
    </Frame>
  );
}
