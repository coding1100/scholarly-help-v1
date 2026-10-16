import { FC, ReactNode } from "react";
import DoneForYouCard from "@/app/components/AiTools/DoneForYouCard";

/**
 * The embedded tool card in a landing hero with the Done-for-you card beside
 * it. On xl screens the card sits in a 320px column and stretches to the
 * tool's height; below xl it hides itself and shows as a sticky bottom bar,
 * so the tool takes the full width.
 */
const HeroToolWithCard: FC<{
  /** Anchor id for the tool (used by "try it free" CTAs). */
  toolId: string;
  children: ReactNode;
}> = ({ toolId, children }) => (
  <div className="mx-auto mt-10 grid max-w-[1280px] grid-cols-1 gap-6 text-left xl:grid-cols-[minmax(0,1fr)_320px]">
    <div id={toolId} className="min-w-0 scroll-mt-24">
      {children}
    </div>
    <DoneForYouCard placement={`${toolId.replace(/-/g, "_")}_landing`} />
  </div>
);

export default HeroToolWithCard;
