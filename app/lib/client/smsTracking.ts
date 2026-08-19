/**
 * Client-side SMS offline-conversion tracking for /take-my-class.
 *
 * Flow (only on exact "/take-my-class"):
 *  - On landing with an `fbclid`, remember it (cookie 90d + sessionStorage) so it
 *    survives navigation and short return visits.
 *  - When the user taps "Text Us": if we have an `fbclid`, generate a UUID,
 *    append a row to the "Send SMS Tracking" sheet, then open the SMS app with a
 *    pre-filled body containing "Reference ID: <UUID>".
 *  - No `fbclid` -> just open the SMS app, write nothing.
 *
 * The inbound side (matching the Reference ID back from GHL, filling Message /
 * Phone) is handled separately and is out of scope here.
 */

const FBCLID_COOKIE = "sh_fbclid";
const LANDING_COOKIE = "sh_landing";
const FBCLID_SS_KEY = "sh:fbclid";
const LANDING_SS_KEY = "sh:landingUrl";
const COOKIE_MAX_AGE_DAYS = 90;

/**
 * sms:/tel: targets must be bare digits — the env value may contain "+", spaces
 * or dashes (e.g. "+1-646-480-6092"), which breaks the link on iOS. Strip them.
 */
function sanitizeNumber(raw: string): string {
  return (raw || "").replace(/[^0-9]/g, "");
}

export const SMS_NUMBER =
  sanitizeNumber(
    process.env.NEXT_PUBLIC_TEXT_US_PHONE_NUMBER || "",
  ) || "14108445419";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readCookie(name: string): string {
  if (!isBrowser()) return "";
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name: string, value: string): void {
  if (!isBrowser() || !value) return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/** Read fbclid from the current URL query string. */
function fbclidFromUrl(): string {
  if (!isBrowser()) return "";
  try {
    return new URLSearchParams(window.location.search).get("fbclid") || "";
  } catch {
    return "";
  }
}

/**
 * If the current URL carries an fbclid, persist it (and the full landing URL)
 * to cookie + sessionStorage. Safe to call on every mount; a no-op without one.
 */
export function rememberFbclidFromUrl(): void {
  if (!isBrowser()) return;
  const fbclid = fbclidFromUrl();
  if (!fbclid) return;
  const landingUrl = window.location.href;
  writeCookie(FBCLID_COOKIE, fbclid);
  writeCookie(LANDING_COOKIE, landingUrl);
  try {
    window.sessionStorage.setItem(FBCLID_SS_KEY, fbclid);
    window.sessionStorage.setItem(LANDING_SS_KEY, landingUrl);
  } catch {
    /* sessionStorage may be unavailable (private mode) */
  }
}

/** Resolve fbclid from URL -> cookie -> sessionStorage (first hit wins). */
export function resolveFbclid(): string {
  if (!isBrowser()) return "";
  const fromUrl = fbclidFromUrl();
  if (fromUrl) return fromUrl;
  const fromCookie = readCookie(FBCLID_COOKIE);
  if (fromCookie) return fromCookie;
  try {
    return window.sessionStorage.getItem(FBCLID_SS_KEY) || "";
  } catch {
    return "";
  }
}

/** The landing URL we captured alongside the fbclid (falls back to current). */
function resolveLandingUrl(): string {
  if (!isBrowser()) return "";
  const fromCookie = readCookie(LANDING_COOKIE);
  if (fromCookie) return fromCookie;
  try {
    const ss = window.sessionStorage.getItem(LANDING_SS_KEY);
    if (ss) return ss;
  } catch {
    /* ignore */
  }
  return window.location.href;
}

function isIOS(): boolean {
  if (!isBrowser()) return false;
  const ua = navigator.userAgent || "";
  const iOSClassic = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as "MacIntel" but has touch points.
  const iPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSClassic || iPadOS;
}

/**
 * Build an sms: link that pre-fills the body on both platforms.
 * iOS wants `&body=`, Android wants `?body=`; body must be URL-encoded.
 */
export function buildSmsHref(number: string, body: string): string {
  const sep = isIOS() ? "&" : "?";
  return `sms:${number}${sep}body=${encodeURIComponent(body)}`;
}

function buildSmsBody(referenceId: string): string {
  return `Reference ID: ${referenceId}\n\nHi Scholarly Help,\n\nMessage: `;
}

/**
 * Short 10-char reference ID (uppercase A–Z0–9). Cryptographically random when
 * available so collisions are effectively impossible at our volume. Shown to the
 * user in the SMS body, so kept short and unambiguous.
 */
function generateReferenceId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 36 chars
  const length = 10;
  let out = "";
  if (isBrowser() && typeof window.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  }
  // Fallback: extremely rare (very old browsers).
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Fire-and-forget append to the Send SMS Tracking sheet. Never blocks the SMS. */
function postTrackingRow(payload: {
  fbclid: string;
  userId: string;
  landingPage: string;
}): void {
  try {
    const body = JSON.stringify(payload);
    // keepalive lets the request survive the page/app switch to the SMS composer.
    fetch("/api/sms-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never let tracking break the SMS action */
  }
}

/**
 * Click handler for the take-my-class "Text Us" button.
 * Prevents default, logs the row (only when an fbclid exists), then opens SMS.
 */
export function handleTextUsClick(
  e: { preventDefault: () => void },
  number: string = SMS_NUMBER,
): void {
  e.preventDefault();

  // Capture at tap time in case the URL still holds the fbclid.
  rememberFbclidFromUrl();

  const fbclid = resolveFbclid();

  let href = `sms:${number}`;
  if (fbclid) {
    const referenceId = generateReferenceId();
    postTrackingRow({
      fbclid,
      userId: referenceId,
      landingPage: resolveLandingUrl(),
    });
    href = buildSmsHref(number, buildSmsBody(referenceId));
  }

  if (isBrowser()) {
    window.location.href = href;
  }
}
