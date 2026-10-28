declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

/**
 * Meta lead tracking for the forms that post /order/quote and route to
 * /thank-you. One event id goes to the backend, which sends the lead to the
 * Meta Conversions API, and into the "quote_lead" dataLayer event that fires
 * the GTM Pixel "Contact" tag, so Meta keeps one of the two. The server copy
 * still lands when Safari blocks the Pixel or has expired its cookies.
 */
function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Adds the event id and Meta's browser cookies to a quote request; returns the id. */
export function appendMetaLeadFields(fd: FormData): string {
  const eventId = crypto.randomUUID();
  fd.append("meta_event_id", eventId);
  const fbp = readCookie("_fbp");
  if (fbp) fd.append("fbp", fbp);
  const fbc = readCookie("_fbc");
  if (fbc) fd.append("fbc", fbc);
  return eventId;
}

/** Call once the quote request has succeeded. */
export function pushQuoteLeadEvent(eventId: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "quote_lead", event_id: eventId });
}
