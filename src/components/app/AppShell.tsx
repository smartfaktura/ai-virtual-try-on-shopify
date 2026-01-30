import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Frame,
  Navigation,
  TopBar,
  Text,
} from '@shopify/polaris';
import {
  HomeIcon,
  ImageIcon,
  LayoutBlockIcon,
  ClockIcon,
  SettingsIcon,
} from '@shopify/polaris-icons';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [
            { content: 'Account settings', onAction: () => navigate('/settings') },
            { content: 'Help center', onAction: () => window.open('https://help.example.com', '_blank') },
          ],
        },
        {
          items: [
            { content: 'Sign out', onAction: () => console.log('Sign out') },
          ],
        },
      ]}
      name="My Store"
      detail="mystore.myshopify.com"
      initials="M"
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
            selected: location.pathname === '/',
            onClick: () => navigate('/'),
          },
          {
            label: 'Generate',
            icon: ImageIcon,
            selected: location.pathname.startsWith('/generate'),
            onClick: () => navigate('/generate'),
          },
          {
            label: 'Templates',
            icon: LayoutBlockIcon,
            selected: location.pathname.startsWith('/templates'),
            onClick: () => navigate('/templates'),
          },
          {
            label: 'Jobs',
            icon: ClockIcon,
            selected: location.pathname.startsWith('/jobs'),
            onClick: () => navigate('/jobs'),
          },
        ]}
      />
      <Navigation.Section
        title="Configuration"
        items={[
          {
            label: 'Settings',
            icon: SettingsIcon,
            selected: location.pathname.startsWith('/settings'),
            onClick: () => navigate('/settings'),
          },
        ]}
      />
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
    accessibilityLabel: 'Product Image Generator',
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
