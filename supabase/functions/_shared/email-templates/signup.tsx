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
    <Preview>Your VOVV.AI verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>VOVV.AI</Text>
        <Heading style={h1}>Your verification code</Heading>
        {token && <Text style={codeStyle}>{token}</Text>}
        <Text style={text}>
          Use this code to verify your email for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          , or click the button below:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 32px' }
const brand = { fontSize: '18px', fontWeight: 'bold' as const, color: '#242f3d', letterSpacing: '-0.02em', margin: '0 0 32px' }
const h1 = { fontSize: '24px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0 0 16px', letterSpacing: '-0.01em' }
const text = { fontSize: '15px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 28px' }
const link = { color: 'inherit', textDecoration: 'underline' }
const codeStyle = { fontFamily: "'SF Mono', Courier, monospace", fontSize: '28px', fontWeight: 'bold' as const, color: '#242f3d', letterSpacing: '0.15em', margin: '0 0 24px' }
const button = { backgroundColor: '#242f3d', color: '#ffffff', fontSize: '15px', borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: '500' as const }
const footer = { fontSize: '13px', color: '#9ca3af', margin: '36px 0 0', lineHeight: '1.5' }
