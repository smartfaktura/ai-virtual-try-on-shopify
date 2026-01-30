import { Page, type PageProps } from '@shopify/polaris';

interface PageHeaderProps extends PageProps {
  children: React.ReactNode;
}

export function PageHeader({ children, ...pageProps }: PageHeaderProps) {
  return (
    <Page fullWidth {...pageProps}>
      {children}
    </Page>
  );
}
