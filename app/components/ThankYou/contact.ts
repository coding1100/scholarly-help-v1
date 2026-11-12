export const WHATSAPP_HREF = "https://api.whatsapp.com/send?phone=14108445419";
export const WHATSAPP_NUMBER_DISPLAY = "+1 (410) 844-5419";

/** The SMS and call number for the whole site, as bare digits for sms:/tel:. */
export const SMS_NUMBER = "17345303988";
export const SMS_HREF = `sms:${SMS_NUMBER}`;
export const TEL_HREF = `tel:${SMS_NUMBER}`;
export const SMS_NUMBER_DISPLAY = "+1 (734) 530-3988";

/** GTM event for a tap on a mobile "Text" button (header or /thank-you/). */
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
