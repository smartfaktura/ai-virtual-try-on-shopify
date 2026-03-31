/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
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

        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your {siteName} password. Click the
          button below to choose a new one.
        </Text>

        <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
          <Button style={ctaButton} href={confirmationUrl}>
            Reset Password
          </Button>
        </Section>

        <Section style={divider} />

        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
