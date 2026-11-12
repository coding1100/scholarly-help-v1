import { MessageSquare } from "lucide-react";
import { SMS_NUMBER_DISPLAY } from "@/app/components/ThankYou/contact";

type TextOnlyNumberProps = {
  /** Visibility and colour, e.g. "hidden lg:flex text-primary-400". */
  className?: string;
  iconClassName?: string;
  /** Put the number on its own line, for narrow columns such as the footer. */
  stacked?: boolean;
};

/**
 * Desktop contact line. The number takes text messages only, so it is plain
 * text rather than a tel: link. Mobile views keep the existing call link.
 */
export default function TextOnlyNumber({
  className = "",
  iconClassName = "",
  stacked = false,
}: TextOnlyNumberProps) {
  return (
    <p
      className={`${stacked ? "items-start" : "items-center whitespace-nowrap"} ${className}`}
    >
      <MessageSquare
        aria-hidden="true"
        className={`w-5 h-5 mr-2 shrink-0 ${stacked ? "mt-0.5" : ""} ${iconClassName}`}
      />
      {stacked ? (
        <span>
          <span className="block">Text only:</span>
          <span className="block">{SMS_NUMBER_DISPLAY}</span>
        </span>
      ) : (
        `Text only: ${SMS_NUMBER_DISPLAY}`
      )}
    </p>
  );
}
