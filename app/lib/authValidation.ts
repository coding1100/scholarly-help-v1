/**
 * Shared client-side validation for the auth forms (sign-in / sign-up).
 *
 * Each validator returns an empty string when the value is valid, or a short,
 * user-facing message describing the first problem. Keeping these in one place
 * ensures sign-in and sign-up enforce identical rules.
 */

// Pragmatic email shape check: non-empty local part, single @, a dotted domain.
// Intentionally not RFC-perfect — the backend is the source of truth; this just
// catches obvious typos before a network round-trip.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// At least 8 chars with one lowercase, one uppercase, and one digit.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

export function validateEmail(email: string): string {
  const value = email.trim();
  if (!value) return "Email is required.";
  if (value.length > 254) return "Email is too long.";
  if (!EMAIL_REGEX.test(value)) return "Enter a valid email address.";
  return "";
}

export function validatePassword(password: string): string {
  if (!password) return "Password is required.";
  if (password.length < 8) return "At least 8 characters required.";
  if (!/[A-Z]/.test(password)) return "At least one uppercase letter required.";
  if (!/[a-z]/.test(password)) return "At least one lowercase letter required.";
  if (!/\d/.test(password)) return "At least one number required.";
  if (!PASSWORD_REGEX.test(password)) return "Only letters and numbers allowed.";
  return "";
}

/**
 * Sign-in is lenient on the password (any non-empty value) since legacy
 * accounts may predate the current strength rules — we only enforce strength on
 * sign-up. We still validate the email shape.
 */
export function validateSignInPassword(password: string): string {
  if (!password) return "Password is required.";
  return "";
}
