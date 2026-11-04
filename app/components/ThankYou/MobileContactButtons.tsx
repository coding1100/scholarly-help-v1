import { FC } from "react";
import { MessageSquare } from "lucide-react";
import { WhatsAppIcon } from "./ThankYouIcons";
import { WHATSAPP_HREF, SMS_HREF, pushTextCtaClick } from "./contact";

// The mobile look shared by every /thank-you/ WhatsApp / Text Us button.
const mobileButton =
  "flex min-h-[44px] items-center justify-center gap-2 rounded-lg text-sm font-bold text-white no-underline whitespace-nowrap";

export const WhatsAppMobileButton: FC<{ onClick?: () => void; className?: string }> = ({
  onClick,
  className = "",
}) => (
  <a
    href={WHATSAPP_HREF}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className={`${mobileButton} bg-[#41A800] ${className}`}
  >
    <WhatsAppIcon className="w-4 h-4" />
    WhatsApp
  </a>
);

export const TextMobileButton: FC<{ placement: string; className?: string }> = ({
  placement,
  className = "",
}) => (
  <a
    href={SMS_HREF}
    onClick={() => pushTextCtaClick(placement)}
    className={`${mobileButton} bg-[#5B4FE0] ${className}`}
  >
    <MessageSquare className="w-4 h-4 flex-shrink-0" />
    Text Us
  </a>
);
