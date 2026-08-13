/** Human-readable message from Clerk Core 3 `{ error }` or thrown values. */
export function clerkErrorMessage(error: unknown, fallback = 'Something went wrong. Try again.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    const record = error as {
      message?: string;
      longMessage?: string;
      long_message?: string;
      code?: string;
      clerkError?: boolean;
      errors?: Array<{
        longMessage?: string;
        long_message?: string;
        message?: string;
        code?: string;
      }>;
      data?: {
        errors?: Array<{
          longMessage?: string;
          long_message?: string;
          message?: string;
          code?: string;
        }>;
      };
      status?: number;
    };

    const first = record.errors?.[0] || record.data?.errors?.[0];
    const code = first?.code || record.code;
    const detail =
      first?.longMessage ||
      first?.long_message ||
      first?.message ||
      record.longMessage ||
      record.long_message ||
      record.message;

    if (code === 'captcha_invalid' || code === 'captcha_missing') {
      return (
        detail ||
        'Bot check failed. Complete the CAPTCHA, or turn off Bot sign-up protection in Clerk for local testing.'
      );
    }

    if (
      code === 'form_identifier_exists' ||
      /already\s+(exists|been\s+taken)|identifier.*exists/i.test(detail || '')
    ) {
      return 'That email already has an account. Use Sign In instead.';
    }

    if (
      code === 'form_password_pwned' ||
      code === 'form_password_not_strong_enough' ||
      code === 'form_password_length_too_short' ||
      code === 'form_password_incorrect' ||
      code === 'form_password_validation_failed'
    ) {
      return (
        detail ||
        'Password issue — use 8+ characters with upper, lower, number, and a symbol.'
      );
    }

    if (code === 'session_exists') {
      return 'You already have a session. Refresh the page.';
    }

    if (detail) return detail;
  }

  return fallback;
}

export function isExistingAccountError(error: unknown): boolean {
  const msg = clerkErrorMessage(error, '');
  if (/already has an account|already exists|already been taken/i.test(msg)) return true;

  if (error && typeof error === 'object') {
    const record = error as {
      code?: string;
      errors?: Array<{ code?: string }>;
      data?: { errors?: Array<{ code?: string }> };
    };
    const code =
      record.errors?.[0]?.code || record.data?.errors?.[0]?.code || record.code;
    return code === 'form_identifier_exists';
  }
  return false;
}
