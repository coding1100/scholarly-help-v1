declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

/** Shared by the Done-for-you card, the pricing popup and the sidebar's "Get expert help" entry. */
export const EXPERT_WHATSAPP_HREF =
  "https://api.whatsapp.com/send?phone=14108445419";

export function trackExpertWhatsAppClick(placement: string) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "whatsapp_click",
    whatsapp_placement: placement,
    page_path: window.location.pathname,
  });
}
