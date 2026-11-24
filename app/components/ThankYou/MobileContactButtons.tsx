import { FC } from "react";
import { WhatsAppIcon } from "./ThankYouIcons";
import { WHATSAPP_HREF } from "./contact";

// The mobile look of every /thank-you/ WhatsApp button.
const mobileButton =
  "flex min-h-[48px] items-center justify-center gap-2 rounded-xl text-base font-bold text-white no-underline whitespace-nowrap";

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
    <WhatsAppIcon className="w-5 h-5" />
    WhatsApp Us
  </a>
);
