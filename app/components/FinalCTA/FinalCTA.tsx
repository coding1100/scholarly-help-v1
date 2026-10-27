"use client";

import { FC, FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import SemiCircle from "@/app/assets/Images/finalCtaBg.png";
import { usePageData } from "../LandingPage/usePageData";
import { useQuoteLead } from "../LandingPage/useQuoteLead";
import {
  PHONE_PLACEHOLDER,
  QuoteLeadError,
  QuoteLeadNote,
  getDetailsField,
  quoteButtonClass,
  quoteInputClass,
} from "../LandingPage/QuoteLeadFields";
import TextUsCta from "../LandingPage/TextUsCta";
import { isTextCtaLandingPage } from "@/app/lib/takeMyClassLandingRoutes";
interface FinalCTAProps {}

const FinalCTA: FC<FinalCTAProps> = ({}) => {
  const data = usePageData() as any;
  const finalCta = data?.finalCta || {};
  const textBefore =
    (finalCta?.textBefore && String(finalCta.textBefore).trim()) || "Pass Your";
  const highlightedText =
    (finalCta?.highlightedText && String(finalCta.highlightedText).trim()) ||
    "Chemistry";
  const textAfter =
    (finalCta?.textAfter && String(finalCta.textAfter).trim()) ||
    "Class Without Burning Out.";
  const description =
    (finalCta?.description && String(finalCta.description).trim()) ||
    "You get a Guaranteed 'A' or 'B', 100% Domestic Logins, and 24/7 Support. Don't let Chemistry class ruin your GPA";
  const buttonText =
    (finalCta?.buttonText && String(finalCta.buttonText).trim()) ||
    "Secure My Grades Now";

  const [classDetails, setClassDetails] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { submit, sending, error } = useQuoteLead();
  const pathname = usePathname();
  const detailsField = getDetailsField(pathname);
  const isTextCta = isTextCtaLandingPage(pathname);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit({ classDetails, email, phone });
  };
  return (
    <div className="bg-[#3C3D5D]">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 px-4 sm:px-6">
        <div className="lg:col-span-6 py-8 sm:py-10 lg:py-12">
          <p
            className="text-white lg:text-[42px] md:text-3xl sm:text-[28px] text-[32px] font-bold"
            style={{ lineHeight: "1.2" }}
          >
            {textBefore}{" "}
            <span
              className="bg-[#5A5BE0] rounded-full px-3 sm:px-4 py-1 md:-rotate-3 inline-block font-semibold sm:whitespace-nowrap"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
              }}
            >
              {highlightedText}
            </span>{" "}
            {textAfter}
          </p>
          <p className="sm:text-lg text-base text-white mt-2.5 max-w-2xl">
            {description}
          </p>
        </div>
        <div
          className="lg:col-span-6 bg-cover min-h-[180px] sm:min-h-[220px] lg:min-h-full flex justify-center items-center pb-8 lg:py-10"
          style={{
            backgroundImage: `url(${SemiCircle.src})`,
            backgroundRepeat: "no-repeat",
          }}
        >
          {isTextCta ? (
            <div className="flex w-full max-w-[440px] justify-center">
              <TextUsCta
                placement="final_cta"
                buttonClassName={`${quoteButtonClass} w-full`}
                textClassName="text-center text-2xl font-semibold text-white"
              />
            </div>
          ) : (
            <form
              method="post"
              onSubmit={onSubmit}
              className="flex w-full max-w-[440px] flex-col gap-3"
            >
              <input
                type="text"
                name="classDetails"
                aria-label={detailsField.label}
                placeholder={detailsField.placeholder}
                required
                maxLength={200}
                value={classDetails}
                onChange={(e) => setClassDetails(e.target.value)}
                className={quoteInputClass}
              />
              <input
                type="email"
                name="email"
                aria-label="Email"
                placeholder="Email *"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={quoteInputClass}
              />
              <input
                type="tel"
                name="phone"
                aria-label="Mobile number"
                placeholder={PHONE_PLACEHOLDER}
                autoComplete="tel"
                inputMode="tel"
                required
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={quoteInputClass}
              />
              <button
                type="submit"
                disabled={sending}
                className={`${quoteButtonClass} w-full`}
              >
                {sending ? "Sending..." : buttonText}
              </button>
              <QuoteLeadError message={error} />
              <QuoteLeadNote text="No spam · No card needed" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalCTA;
