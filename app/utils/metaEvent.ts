declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

/**
 * Meta deduplication for conversions the backend also sends to the Meta
 * Conversions API (quote leads, sign-ups, tool purchases). The browser and
 * the server use one event id: it goes to the backend with the request, and
 * into the dataLayer as `event_id`, which the existing GTM Pixel tags read
 * as their Event ID. Meta then keeps one of the two, and the server copy
 * still lands when Safari blocks the Pixel or has expired its cookies.
 */
function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * crypto.randomUUID only exists on secure pages in recent browsers (Safari
 * 15.4+). Older Safari must still be able to submit, so fall back.
 */
function newEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Request fields for a conversion the backend sends to Meta. */
export function metaEventFields(eventId: string): {
  meta_event_id: string;
  fbp?: string;
  fbc?: string;
} {
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  return {
    meta_event_id: eventId,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}

/** Puts the id in the dataLayer for the Pixel tags that fire next. */
export function pushMetaEventId(eventId: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event_id: eventId });
}

/** Adds the Meta fields for a new lead to a quote request; returns its event id. */
export function appendMetaLeadFields(fd: FormData): string {
  const eventId = newEventId();
  for (const [key, value] of Object.entries(metaEventFields(eventId))) {
    fd.append(key, value);
  }
  return eventId;
}

let signupEventId: string | undefined;

/**
 * One id per page load for the "Tools Sign Up" events: the GTM click
 * triggers on the sign-up buttons and the Google button, and the account
 * the backend creates on the first sign-in.
 */
export function signupMetaEventId(): string {
  signupEventId ??= newEventId();
  return signupEventId;
}
