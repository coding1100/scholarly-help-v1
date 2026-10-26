"use client";

import { handleTextUsClick } from "@/app/lib/client/smsTracking";

const TEXT_CTA_LABEL = "Secure My 'A' or 'B' Grades";
const TEXT_CTA_NUMBER = "17345303988";
const TEXT_CTA_NUMBER_DISPLAY = "+1 734 530 3988";
const TEXT_CTA_MESSAGE = "Hi, I need A or B Grades Guaranteed";

interface TextUsCtaProps {
  /** Mobile button classes, usually the classes of the CTA it replaces. */
  buttonClassName: string;
  /** Desktop text classes. */
  textClassName?: string;
  /** Render nothing on desktop (e.g. the sticky bar). */
  mobileOnly?: boolean;
  /** Where the CTA sits, reported to GTM (e.g. "hero", "final_cta"). */
  placement: string;
}

/**
 * CTA for the text-message landing pages (see isTextCtaLandingPage). On
 * mobile it is a button that opens the SMS app with a pre-filled message; on
 * desktop, where there is no SMS app, it is the number as plain text.
 */
export default function TextUsCta({
  buttonClassName,
  textClassName = "",
  mobileOnly = false,
  placement,
}: TextUsCtaProps) {
  return (
    <>
      <a
        href={`sms:${TEXT_CTA_NUMBER}`}
        onClick={(e) => {
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
          handleTextUsClick(e, TEXT_CTA_NUMBER, TEXT_CTA_MESSAGE);
        }}
        className={`${buttonClassName} md:hidden`}
      >
        {TEXT_CTA_LABEL}
      </a>
      {!mobileOnly && (
        <p className={`${textClassName} hidden md:block`}>
          Text us at {TEXT_CTA_NUMBER_DISPLAY}
        </p>
      )}
    </>
  );
}
