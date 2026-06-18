import { StaticImageData } from "next/image";
import tmIcon1 from "@/app/assets/Icons/tmIcon1.png";
import tmIcon2 from "@/app/assets/Icons/tmIcon2.png";
import tmIcon3 from "@/app/assets/Icons/tmIcon3.png";
import tmIcon4 from "@/app/assets/Icons/tmIcon4.png";
import MTconfidentiality from "@/app/assets/Icons/MTconfidentiality.png";
import MTstudents from "@/app/assets/Icons/MTstudents.png";
import MTtutors from "@/app/assets/Icons/MTtutors.png";
import MTcourse from "@/app/assets/Icons/MTcourse.png";

export const mainToolPickIcons: Record<string, StaticImageData> = {
  tmIcon1,
  tmIcon2,
  tmIcon3,
  tmIcon4,
};

export const mainToolCardIcons: Record<string, StaticImageData> = {
  MTconfidentiality,
  MTstudents,
  MTtutors,
  MTcourse,
};

export function resolvePickIcon(iconKey?: string) {
  return mainToolPickIcons[iconKey || ""] || tmIcon1;
}

export function resolveCardIcon(iconKey?: string) {
  return mainToolCardIcons[iconKey || ""] || MTconfidentiality;
}
