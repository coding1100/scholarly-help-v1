declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

/**
 * Meta deduplication for conversions the backend also sends to the Meta
 * Conversions API (leads, sign-ups, tool purchases). The browser and the
 * server use one event id: it goes to the backend with the request, and
 * into the dataLayer with the event GTM fires the Pixel tag on, which reads
 * it as the tag's Event ID. Meta then keeps one of the two, and the server
 * copy still lands when Safari blocks the Pixel or has expired its cookies.
 */
function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * crypto.randomUUID only exists on secure pages in recent browsers (Safari
 * 15.4+). Older Safari must still be able to submit, so fall back.
 */
export function newMetaEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Meta's browser cookies, which help the backend match its events to people. */
export function metaCookieFields(): { fbp?: string; fbc?: string } {
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}

/** Request fields for a conversion the backend sends to Meta. */
export function metaEventFields(eventId: string): {
  meta_event_id: string;
  fbp?: string;
  fbc?: string;
} {
  return { meta_event_id: eventId, ...metaCookieFields() };
}

/**
 * GTM fires the Pixel on these: "contact" for a lead sent from any form
 * that does not create an account, "tools_signup" for a sign-up. Push only
 * after the backend accepted the request, with the id sent in it.
 */
export function pushMetaEvent(event: "contact" | "tools_signup", eventId: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, event_id: eventId });
}

/** Adds the Meta fields for a new lead to a quote request; returns its event id. */
export function appendMetaLeadFields(fd: FormData): string {
  const eventId = newMetaEventId();
  for (const [key, value] of Object.entries(metaEventFields(eventId))) {
    fd.append(key, value);
  }
  return eventId;
}

let signupEventId: string | undefined;

/**
 * One id per page load for "tools_signup", so repeat submits on one page
 * stay one sign-up. The backend sends its own Tools Sign Up with the same
 * id for a new account.
 */
export function signupMetaEventId(): string {
  signupEventId ??= newMetaEventId();
  return signupEventId;
}
