"use client";

import React, { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoNormal from "@/app/assets/Images/logo.png";
import { BiChevronsRight } from "react-icons/bi";
import MTSidebar from "./MTSidebar";
import ToolHeader from "./ToolHeader";

interface ToolsLayoutProps {
  children: ReactNode;
  setFlag: (value: boolean) => void;
  flag: boolean;
}

const ToolsLayout: React.FC<ToolsLayoutProps> = ({
  children,
  setFlag,
  flag,
}) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // useEffect(() => {
  //   const t = localStorage.getItem("access_token");
  //   if (!t) {
  //     router.push("/sign-in");
  //   } else {
  //     setToken(t);
  //   }
  //   setChecked(true);
  // }, [router]);

  // if (!checked) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center">Loading...</div>
  //   );
  // }

  // if (!token) return null;

  return (
    <div className="h-screen w-full flex flex-col relative">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-10 left-2 z-50 p-0.5 bg-white border rounded-md"
        onClick={() => setSidebarOpen(true)}
      >
        <BiChevronsRight className="h-5 w-5 text-gray-700" />
      </button>

      <div className="flex flex-1 h-full">
        {/* Desktop Sidebar */}
        <div className="w-60 flex-shrink-0 bg-white hidden lg:block">
          {/* <div className="py-3 sm:px-10 px-7 flex justify-between xl:container w-full flex-wrap sm:flex-nowrap bg-gray-50 border">
            <div className="flex items-center ">
              <Link href="/">
                <Image
                  src={LogoSmall}
                  alt="logo"
                  className="sm:hidden block max-w-[30px] min-w-[30px]"
                />
                <Image
                  src={LogoNormal}
                  alt=""
                  className="sm:block hidden max-w-[142px] min-w-[142px]"
                />
              </Link>
            </div>
          </div> */}
          <MTSidebar setFlag={setFlag} flag={flag} />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-40"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="fixed top-0 left-0 z-50 w-60 h-full">
              <div className="flex items-center justify-center bg-gray-50 border p-2 lg:p-0">
                <Link href="/">
                  <Image
                    src={LogoNormal}
                    alt=""
                    className="block lg:hidden max-w-[142px] min-w-[142px]"
                  />
                </Link>
              </div>
              <MTSidebar
                setFlag={setFlag}
                flag={flag}
                onToggle={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Tool content */}
        <div className="flex-1  h-screen">
          {/* {children} */}
          <ToolHeader />
          {React.cloneElement(children as React.ReactElement, { token })}
        </div>
      </div>
    </div>
  );
};

export default ToolsLayout;
