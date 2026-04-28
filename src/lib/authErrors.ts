/**
 * Map Supabase auth errors to clear, user-friendly messages.
 * Avoids the catch-all "Something went wrong" by surfacing
 * the actual problem (existing account, weak password, rate limit, etc.).
 */

export type AuthMode = 'signup' | 'login';

export interface MappedAuthError {
  /** User-facing message to display in the form. */
  message: string;
  /** When true, the UI should switch the form to login mode (e.g. account already exists). */
  switchToLogin?: boolean;
  /** When true, indicates the email needs verification — the UI may offer to resend. */
  needsEmailConfirmation?: boolean;
  /** When true, the request was rate-limited; the UI may want to show a "wait a moment" hint. */
  rateLimited?: boolean;
}

function sentenceCase(input: string): string {
  if (!input) return input;
  const trimmed = input.trim();
  // Strip trailing period for consistency with our header style; keep punctuation in body.
  const noTrailingDot = trimmed.replace(/\.$/, '');
  return noTrailingDot.charAt(0).toUpperCase() + noTrailingDot.slice(1);
}

export function mapAuthError(error: unknown, mode: AuthMode): MappedAuthError {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const msg = raw.toLowerCase();

  // Network / fetch failures (offline, DNS, CORS preflight blocked, etc.)
  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed')
  ) {
    return { message: 'Network problem. Please check your connection and try again.' };
  }

  // Rate-limit / throttling
  if (
    msg.includes('rate limit') ||
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('too many requests') ||
    msg.includes('429')
  ) {
    if (mode === 'signup') {
      return {
        message: 'Verification email already sent. Check your inbox or wait a moment before trying again.',
        rateLimited: true,
      };
    }
    return {
      message: 'Too many attempts. Please wait a minute and try again.',
      rateLimited: true,
    };
  }

  if (mode === 'signup') {
    // Account already exists
    if (
      msg.includes('user already registered') ||
      msg.includes('already registered') ||
      msg.includes('already exists') ||
      msg.includes('email address already') ||
      msg.includes('user_already_exists')
    ) {
      return {
        message: 'An account with this email already exists. Try signing in instead.',
        switchToLogin: true,
      };
    }

    // Weak / breached / short password
    if (
      msg.includes('password should be at least') ||
      msg.includes('password is too short') ||
      msg.includes('weak password') ||
      msg.includes('pwned') ||
      msg.includes('compromised') ||
      msg.includes('password is known to be weak')
    ) {
      return {
        message: 'Please choose a stronger password (at least 6 characters, avoid common or breached passwords).',
      };
    }

    // Invalid email
    if (
      msg.includes('invalid email') ||
      msg.includes('unable to validate email') ||
      msg.includes('email address is invalid')
    ) {
      return { message: 'Please enter a valid email address.' };
    }

    // Signups disabled
    if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
      return { message: 'Account signups are temporarily disabled. Please try again later.' };
    }
  } else {
    // Login-specific
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
      return { message: 'Incorrect email or password. Please try again.' };
    }

    if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
      return {
        message: 'Please confirm your email first. Check your inbox for the verification link.',
        needsEmailConfirmation: true,
      };
    }

    if (msg.includes('user not found')) {
      return { message: "We couldn't find an account with that email. Try signing up instead." };
    }
  }

  // Last-resort: surface the real message instead of "Something went wrong"
  // so users (and we) get useful info.
  if (raw && raw.length < 200) {
    return { message: sentenceCase(raw) };
  }

  return {
    message:
      mode === 'signup'
        ? "We couldn't create your account. Please try again or contact support."
        : "We couldn't sign you in. Please try again or contact support.",
  };
}
