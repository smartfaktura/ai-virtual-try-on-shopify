/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {siteName} verification code: {token}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Brand header */}
        <Section style={brandHeader}>
          <Text style={brandBadge}>{siteName}</Text>
        </Section>

        <Heading style={h1}>Verify your email</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          ! Enter this code to confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ):
        </Text>

        {/* OTP code card */}
        <Section style={codeCard}>
          <Text style={codeLabel}>Verification code</Text>
          <Text style={codeStyle}>{token}</Text>
        </Section>

        <Text style={smallText}>
          Or{' '}
          <Link href={confirmationUrl} style={link}>
            click here to verify automatically
          </Link>
          .
        </Text>

        <Section style={divider} />

        <Text style={footer}>
          If you didn't create a {siteName} account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

/* ── Styles ─────────────────────────────────────── */

const fontStack =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const main = {
  backgroundColor: '#ffffff',
  fontFamily: fontStack,
}

const container = {
  padding: '40px 28px 32px',
  maxWidth: '480px',
  margin: '0 auto',
}

const brandHeader = {
  marginBottom: '32px',
}

const brandBadge = {
  display: 'inline-block' as const,
  backgroundColor: '#1f2d3d',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: '700' as const,
  letterSpacing: '0.5px',
  padding: '6px 14px',
  borderRadius: '6px',
  margin: '0',
}

const h1 = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#1f2d3d',
  lineHeight: '1.3',
  margin: '0 0 16px',
}

const text = {
  fontSize: '15px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 28px',
}

const link = { color: '#1f2d3d', textDecoration: 'underline' }

const codeCard = {
  backgroundColor: '#f8f9fb',
  border: '1px solid #e2e5ea',
  borderRadius: '8px',
  padding: '24px 16px',
  textAlign: 'center' as const,
  marginBottom: '28px',
}

const codeLabel = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const codeStyle = {
  fontFamily: "'SF Mono', 'Roboto Mono', Menlo, Courier, monospace",
  fontSize: '32px',
  fontWeight: '700' as const,
  color: '#1f2d3d',
  letterSpacing: '6px',
  margin: '0',
}

const smallText = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: '1.5',
  margin: '0 0 28px',
}

const divider = {
  borderTop: '1px solid #e2e5ea',
  margin: '0 0 20px',
}

const footer = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '1.5',
  margin: '0',
}
