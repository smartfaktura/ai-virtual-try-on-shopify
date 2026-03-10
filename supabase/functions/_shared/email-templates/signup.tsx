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
  token?: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => {
  const displayToken = token || ''

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>Your verification code is {displayToken} – VOVV.AI</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={wordmark}>VOVV.AI</Text>
          <Heading style={h1}>Verify your account</Heading>
          <Text style={subtitle}>
            Enter this code to confirm your email address ({recipient}):
          </Text>

          {displayToken && (
            <Section style={codeBlock}>
              <Text style={codeText}>{displayToken}</Text>
            </Section>
          )}

          <Text style={codeHint}>This code expires in 10 minutes</Text>

          <Text style={verifyText}>
            or{' '}
            <Link href={confirmationUrl} style={verifyLink}>
              verify directly →
            </Link>
          </Text>

          <Text style={disclaimer}>
            If you didn't create an account on{' '}
            <Link href={siteUrl} style={inlineLink}>VOVV.AI</Link>, you can safely ignore this email.
          </Text>

          <Section style={footer}>
            <Text style={footerCopy}>&copy; 2026 VOVV.AI. All rights reserved.</Text>
            <Text style={footerSub}>A product by 123Presets</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default SignupEmail

const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

const main = {
  backgroundColor: '#ffffff',
  fontFamily: fontStack,
}
const container = { padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }
const wordmark = {
  fontFamily: fontStack,
  fontWeight: 700 as const,
  fontSize: '20px',
  letterSpacing: '-0.03em',
  color: '#0f172a',
  margin: '0 0 32px 0',
}
const h1 = {
  fontFamily: fontStack,
  fontSize: '24px',
  fontWeight: 700 as const,
  color: '#0f172a',
  margin: '0 0 6px 0',
  letterSpacing: '-0.02em',
}
const subtitle = {
  fontFamily: fontStack,
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 24px 0',
}
const codeBlock = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px 0',
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
}
const codeText = {
  fontFamily: fontStack,
  fontSize: '32px',
  fontWeight: 700 as const,
  color: '#0f172a',
  letterSpacing: '0.3em',
  margin: '0',
  lineHeight: '1',
}
const codeHint = {
  fontFamily: fontStack,
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 28px 0',
  textAlign: 'center' as const,
}
const verifyText = {
  fontFamily: fontStack,
  fontSize: '13px',
  color: '#64748b',
  textAlign: 'center' as const,
  margin: '0 0 36px 0',
}
const verifyLink = {
  color: '#0f172a',
  textDecoration: 'underline',
  fontWeight: 500 as const,
}
const disclaimer = {
  fontFamily: fontStack,
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 40px 0',
}
const inlineLink = { color: '#0f172a', textDecoration: 'underline' }
const footer = { borderTop: '1px solid #e7e5e4', paddingTop: '16px' }
const footerCopy = {
  fontFamily: fontStack,
  fontSize: '12px',
  color: '#64748b',
  margin: '16px 0 0 0',
  lineHeight: '1.5',
}
const footerSub = {
  fontFamily: fontStack,
  fontSize: '12px',
  color: '#64748b',
  margin: '4px 0 0 0',
}
