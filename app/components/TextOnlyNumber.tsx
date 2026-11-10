import { MessageSquare } from "lucide-react";

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
          <span className="block">+1 (646) 480-6092</span>
        </span>
      ) : (
        "Text only: +1 (646) 480-6092"
      )}
    </p>
  );
}
