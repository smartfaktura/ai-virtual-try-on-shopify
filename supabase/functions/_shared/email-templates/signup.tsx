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
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Confirm your VOVV.AI account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={wordmark}>VOVV.AI</Text>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>VOVV.AI</strong>
          </Link>
          ! Please confirm your email address ({recipient}) by clicking the button below or entering the code.
        </Text>
        {token && <Text style={codeStyle}>{token}</Text>}
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footerText}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <Section style={footerSection}>
          <Text style={footerCopy}>&copy; 2026 VOVV.AI. All rights reserved.</Text>
          <Text style={footerSub}>A product by 123Presets</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}
const container = { padding: '40px 20px', maxWidth: '560px', margin: '0 auto' }
const wordmark = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700 as const,
  fontSize: '20px',
  letterSpacing: '-0.03em',
  color: '#0f172a',
  margin: '0 0 32px 0',
}
const h1 = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '24px',
  fontWeight: 700 as const,
  color: '#0f172a',
  margin: '0 0 16px 0',
  letterSpacing: '-0.02em',
}
const text = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '15px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const codeStyle = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '28px',
  fontWeight: 700 as const,
  color: '#0f172a',
  letterSpacing: '0.15em',
  margin: '0 0 24px 0',
}
const button = {
  backgroundColor: '#1e293b',
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  fontWeight: 600 as const,
  borderRadius: '8px',
  padding: '14px 32px',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  margin: '0 0 32px 0',
  display: 'inline-block' as const,
}
const footerText = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  color: '#64748b',
  margin: '0 0 40px 0',
}
const footerSection = { borderTop: '1px solid #e7e5e4', paddingTop: '16px' }
const footerCopy = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#64748b',
  margin: '16px 0 0 0',
  lineHeight: '1.5',
}
const footerSub = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  color: '#64748b',
  margin: '4px 0 0 0',
}
