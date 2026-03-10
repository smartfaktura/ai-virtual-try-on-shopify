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
  token?: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => {
  const displayToken = token?.slice(0, 6) || ''
  const digits = displayToken.split('')

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>Your verification code is {displayToken} - VOVV.AI</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={wordmark}>VOVV.AI</Text>
          <Heading style={h1}>Verify your account</Heading>
          <Text style={text}>
            Enter this code to confirm your email address ({recipient}):
          </Text>

          {digits.length > 0 && (
            <Section style={codeSection}>
              <table cellPadding="0" cellSpacing="0" style={digitTable}>
                <tbody>
                  <tr>
                    {digits.map((digit, i) => (
                      <td key={i} style={digitCell}>
                        <span style={digitText}>{digit}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <Text style={codeHint}>This code expires in 10 minutes</Text>
            </Section>
          )}

          <Section style={dividerSection}>
            <table cellPadding="0" cellSpacing="0" width="100%">
              <tbody>
                <tr>
                  <td style={dividerLine} />
                  <td style={dividerLabel}>or</td>
                  <td style={dividerLine} />
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={altText}>Click below to verify directly</Text>
          <Button style={button} href={confirmationUrl}>
            Verify Email
          </Button>

          <Text style={footerText}>
            If you didn't create an account on{' '}
            <Link href={siteUrl} style={link}>VOVV.AI</Link>, you can safely ignore this email.
          </Text>
          <Section style={footerSection}>
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
  margin: '0 0 8px 0',
  letterSpacing: '-0.02em',
}
const text = {
  fontFamily: fontStack,
  fontSize: '15px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 28px 0',
}
const codeSection = {
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
}
const digitTable = {
  margin: '0 auto',
  borderCollapse: 'separate' as const,
  borderSpacing: '8px 0',
}
const digitCell = {
  width: '48px',
  height: '56px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '10px',
  textAlign: 'center' as const,
  verticalAlign: 'middle' as const,
  backgroundColor: '#f8fafc',
}
const digitText = {
  fontFamily: fontStack,
  fontSize: '26px',
  fontWeight: 700 as const,
  color: '#0f172a',
  lineHeight: '56px',
}
const codeHint = {
  fontFamily: fontStack,
  fontSize: '12px',
  color: '#94a3b8',
  margin: '12px 0 0 0',
  textAlign: 'center' as const,
}
const dividerSection = {
  margin: '28px 0',
}
const dividerLine = {
  height: '1px',
  backgroundColor: '#e7e5e4',
  width: '45%',
}
const dividerLabel = {
  fontFamily: fontStack,
  fontSize: '12px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  padding: '0 12px',
  whiteSpace: 'nowrap' as const,
}
const altText = {
  fontFamily: fontStack,
  fontSize: '13px',
  color: '#94a3b8',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
}
const button = {
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontFamily: fontStack,
  fontSize: '13px',
  fontWeight: 600 as const,
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  padding: '10px 24px',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
  margin: '0 auto 32px auto',
  display: 'block' as const,
  textAlign: 'center' as const,
  width: '160px',
}
const link = { color: '#0f172a', textDecoration: 'underline' }
const footerText = {
  fontFamily: fontStack,
  fontSize: '13px',
  color: '#64748b',
  margin: '0 0 40px 0',
}
const footerSection = { borderTop: '1px solid #e7e5e4', paddingTop: '16px' }
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
