import axiosInstance from "@/app/axios";

// Same US number rule as the existing take-my-class phone form.
const US_PHONE_REGEX = /^\+1[2-9]\d{2}[2-9](?!11)\d{6}$/;

/**
 * Normalises a US number typed in any common format ("(555) 123-4567",
 * "555-123-4567", "+1 555 123 4567") to E.164, or returns null if it is not
 * a valid US number.
 */
export function toUsE164(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const e164 =
    digits.length === 10
      ? `+1${digits}`
      : digits.length === 11 && digits.startsWith("1")
        ? `+${digits}`
        : "";
  return US_PHONE_REGEX.test(e164) ? e164 : null;
}

/**
 * Posts a lead to the backend's take-my-class flow, which saves it to the
 * quotes sheet, creates the GHL contact and emails support. Tracking fields
 * mirror the existing phone form: the full page URL when it carries the id.
 */
export async function submitLead({
  phoneNumber,
  email = "",
}: {
  phoneNumber: string;
  email?: string;
}): Promise<void> {
  const url = window.location.href;
  await axiosInstance.post("/order/take-my-class/", {
    phoneNumber,
    email,
    PageURL: url,
    FBCLID: url.includes("fbclid=") ? url : "",
    GCLID: url.includes("gclid=") ? url : "",
  });
}
