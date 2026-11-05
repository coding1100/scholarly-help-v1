export const WHATSAPP_HREF = "https://api.whatsapp.com/send?phone=14108445419";
export const WHATSAPP_NUMBER_DISPLAY = "+1 (410) 844-5419";

export const SMS_HREF = "sms:17345303988";
export const SMS_NUMBER_DISPLAY = "+1 (734) 530-3988";

/** GTM event for a tap on a /thank-you/ Text button (mobile only). */
export function pushTextCtaClick(placement: string) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "text_cta_click",
      text_cta_placement: placement,
      page_path: window.location.pathname,
    });
  } catch {
    // Never block the SMS action if GTM is unavailable.
  }
}
