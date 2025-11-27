"use client";

import useBreakpoint from "@/app/(pages)/hooks/useMediabreakpoint";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import Inbox from "./newComponents/Inbox";
import SideBar from "./newComponents/SideBar";

export type SidebarType = {
  flag: boolean;
  isOpen: string;
};

function Exercise() {
  const { isMobile } = useBreakpoint();
  const [openSidebar, setOpenSidebar] = useState<SidebarType>({
    flag: isMobile,
    isOpen: "open",
  });

  useEffect(() => {
    if (isMobile) {
      setOpenSidebar({ flag: true, isOpen: "open" });
    } else {
      setOpenSidebar({ flag: false, isOpen: "open" });
    }
  }, [isMobile]);

  console.log(openSidebar.flag, openSidebar.isOpen);

  return (
    <div className="relative">
      <div
        className={`${
          !openSidebar.flag &&
          `${openSidebar.isOpen === "open" && "grid grid-cols-11"}`
        } w-full fixed`}
      >
        <div
          className={`${
            openSidebar.flag
              ? "w-[300px] z-20 absolute"
              : `${openSidebar.isOpen === "close" ? "hidden" : "col-span-3"}`
          } `}
        >
          <SideBar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
        </div>
        <div
          className={`${
            openSidebar.flag
              ? "w-full"
              : `${
                  openSidebar.isOpen === "close"
                    ? " w-full"
                    : " col-span-8 px-7"
                }`
          } py-[34px]`}
        >
          <div className="flex w-full">
            <IoIosArrowForward
              className={`${
                !openSidebar.flag &&
                `z-10 text-lg text-primary-400 ${
                  openSidebar.isOpen === "open" && "hidden"
                }`
              }`}
              onClick={() => setOpenSidebar({ flag: true, isOpen: "open" })}
            />
            <div className="w-full">
              <Inbox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Exercise), { ssr: false });
