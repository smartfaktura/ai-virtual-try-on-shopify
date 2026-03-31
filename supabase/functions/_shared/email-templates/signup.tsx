/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
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
          <table cellPadding="0" cellSpacing="0" role="presentation">
            <tr>
              <td style={logoDot}>
                <Text style={logoLetter}>V</Text>
              </td>
              <td style={{ paddingLeft: '10px' }}>
                <Text style={logoText}>{siteName}</Text>
              </td>
            </tr>
          </table>
        </Section>

        <Heading style={h1}>Verify your email</Heading>
        <Text style={text}>
          Thanks for joining{' '}
          <Link href={siteUrl} style={link}>
            {siteName}
          </Link>
          ! Use the code below to confirm your email address.
        </Text>

        {/* OTP code card */}
        <Section style={codeCard}>
          <Text style={codeLabel}>Verification code</Text>
          <Text style={codeStyle}>{token}</Text>
        </Section>

        <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
          <Button style={ctaButton} href={confirmationUrl}>
            Or verify automatically →
          </Button>
        </Section>

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
  backgroundColor: '#f4f5f7',
  fontFamily: fontStack,
  padding: '40px 0',
}

const container = {
  backgroundColor: '#ffffff',
  padding: '48px 32px 40px',
  maxWidth: '480px',
  margin: '0 auto',
  borderRadius: '12px',
}

const brandHeader = {
  marginBottom: '36px',
}

const logoDot = {
  width: '32px',
  height: '32px',
  backgroundColor: '#1e293b',
  borderRadius: '8px',
  textAlign: 'center' as const,
  verticalAlign: 'middle' as const,
}

const logoLetter = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  lineHeight: '32px',
  margin: '0',
}

const logoText = {
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#1e293b',
  margin: '0',
  letterSpacing: '0.3px',
}

const h1 = {
  fontSize: '26px',
  fontWeight: '600' as const,
  color: '#1e293b',
  lineHeight: '1.3',
  margin: '0 0 14px',
}

const text = {
  fontSize: '15px',
  color: '#64748b',
  lineHeight: '1.65',
  margin: '0 0 32px',
}

const link = { color: '#1e293b', fontWeight: '500' as const, textDecoration: 'underline' }

const codeCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  padding: '28px 16px',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const codeLabel = {
  fontSize: '11px',
  fontWeight: '600' as const,
  color: '#94a3b8',
  textTransform: 'uppercase' as const,
  letterSpacing: '1.5px',
  margin: '0 0 10px',
}

const codeStyle = {
  fontFamily: "'SF Mono', 'Roboto Mono', Menlo, Courier, monospace",
  fontSize: '36px',
  fontWeight: '600' as const,
  color: '#1e293b',
  letterSpacing: '8px',
  margin: '0',
}

const ctaButton = {
  backgroundColor: '#1e293b',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500' as const,
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}

const divider = {
  borderTop: '1px solid #e2e8f0',
  margin: '0 0 20px',
}

const footer = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '1.5',
  margin: '0',
}
