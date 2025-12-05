"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import { BiChevronsLeft } from "react-icons/bi";
import { usePathname, useRouter } from "next/navigation";
import axiosInstance from "@/app/axios";
import toast from "react-hot-toast";
import { FiTool } from "react-icons/fi";
import AccountPopover from "./AccountPopover";
import UsageAndPricing from "./UsageAndPricing";
import PromptModal from "./PromptModal";

interface SidebarProps {
  onToggle?: () => void;
  setFlag: (value: boolean) => void;
  flag: boolean;
  documentsOpen?: boolean;
  onToggleDocuments?: () => void;
}

const MTSidebar = ({
  onToggle,
  setFlag,
  flag,
  documentsOpen,
  onToggleDocuments,
}: SidebarProps) => {
  const currentRoute = usePathname();
  const router = useRouter();
  const tools = [
    { name: "Paraphraser Tool", href: "/tools/paraphraser-tool/" },
    { name: "Summarizer Tool", href: "/tools/summarizer-tool/" },
    { name: "Thesis Generator Tool", href: "/tools/thesis-generator-tool/" },
    { name: "Essay Outline Tool", href: "/tools/essay-outline-tool/" },
    { name: "Syllabus Importer", href: "/tools/syllabus-importer" },
  ];
  const [showTools, setShowTools] = useState(false);
  const [userName, setUserName] = useState("User");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  console.log("Access Token is here", accessToken);
  const isVerifying = useRef(false);
  const [userToggled, setUserToggled] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [isPromptModalOpen, setPromptModalOpen] = useState(false);
  // Documents panel is controlled by parent layout

  const handleLogout = () => {
    console.log("🔄 Starting logout - clearing localStorage...");
    // Clear all auth-related localStorage items
    localStorage.removeItem("access_token");
    localStorage.removeItem("provider");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("package_type");
    localStorage.removeItem("totalTokens");
    localStorage.removeItem("provider");
    localStorage.removeItem("profile_image");
    localStorage.removeItem("authState");
    localStorage.removeItem("user_password");
    localStorage.removeItem("authToken");
    localStorage.removeItem("localUserId");
    console.log("✅ Logout complete - localStorage cleared");
    router.push("/");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("user_name");
      const image = localStorage.getItem("profile_image");
      console.log("🔄 Sidebar useEffect - localStorage values:", {
        user_name: name,
        profile_image: image,
        access_token: localStorage.getItem("access_token") ? "✅" : "❌",
        user_id: localStorage.getItem("user_id"),
        provider: localStorage.getItem("provider"),
      });
      if (name) {
        setUserName(name);
        console.log("✅ Set user name in sidebar:", name);
      } else {
        console.log("❌ No user name found in localStorage");
      }
      if (image) setProfileImage(image);
    }
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (!accessToken || isVerifying.current) return;

      isVerifying.current = true;
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/verify-token`
        );
        console.log("Token verification response:", response);
      } catch (error) {
        console.error("❌ Token verification failed:", error);
        toast.error("Session expired. Please sign in again.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_email");
        localStorage.removeItem("package_type");
        localStorage.removeItem("totalTokens");
        localStorage.removeItem("provider");
        localStorage.removeItem("profile_image");

        if (currentRoute.includes("tools") || currentRoute === "/pricing/") {
          router.push("/sign-in");
        } else {
          router.push("/");
        }
      }
    };

    verifyToken();
  }, []);
  useEffect(() => {
    if (!userToggled) {
      if (currentRoute.startsWith("/tools/")) {
        setShowTools(true);
      } else {
        setShowTools(false);
      }
    }
  }, [currentRoute, userToggled]);

  const handleToolsToggle = () => {
    setUserToggled(true); // mark that user toggled manually
    setShowTools((prev) => !prev);
  };

  return (
    <aside
      className={
        "relative flex h-[100vh] w-60 flex-col space-y-2 border-r bg-gray-100 p-4 font-sans"
      }
    >
      {/* 1. User Profile Section */}
      <div className="relative">
        <div
          className="flex items-center w-full gap-2 cursor-pointer hover:bg-gray-300 rounded-md"
          // ref={profileRef}
          onClick={() => setShowPopover((prev) => !prev)}
        >
          {/* <div className="flex items-center gap-2"> */}
          {profileImage ? (
            <Image
              src={profileImage}
              alt="User Profile"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center bg-indigo-200 text-indigo-700 font-bold rounded-full text-sm uppercase">
              {userName.charAt(0)}
            </div>
          )}
          <span className="text-md font-semibold text-gray-800">
            {userName}
          </span>
          {/* </div> */}

          <span className="text-gray-500 hover:text-gray-800">
            <HiOutlineChevronUpDown className="h-4 w-4" />
          </span>
          <button
            onClick={onToggle}
            className="text-gray-500 block lg:hidden hover:text-gray-800"
          >
            <BiChevronsLeft className="h-5 w-5" />
          </button>
        </div>
        {showPopover && (
          <div className="absolute left-0 mt-2 z-50">
            <AccountPopover setFlag={setFlag} flag={flag} />
          </div>
        )}
      </div>

      {/* 2. New Button */}

      {/* {currentRoute === "/tools/main-tool/" ? (
        <button
          className="flex  cursor-pointer items-center gap-3 px-3 py-1 text-sm transition-colors bg-white hover:bg-white "
          onClick={() => setPromptModalOpen(true)}
        >
          <HiMiniPlusCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">New</span>
        </button>
      ) : (
        <Link
          href="/tools/main-tool/"
          className="px-3 py-1 text-sm font-semibold transition-colors bg-white hover:bg-white"
        >
          Main Tool
        </Link>
      )}
      <button
        className="flex cursor-pointer items-center gap-3 px-3 py-1 text-sm transition-colors bg-white hover:bg-white "
        onClick={onToggleDocuments}
      >
        <span className="text-sm font-semibold">Documents</span>
      </button> */}
      <div>
        <button
          className="flex w-full cursor-pointer items-center gap-3 px-3 py-1 text-sm transition-colors bg-white hover:bg-white "
          onClick={() => setShowTools((prev) => !prev)}
        >
          <FiTool className="h-5 w-5" />
          <span className="text-sm font-semibold">Tools</span>
        </button>
        {/* {showTools && ( */}
        <div className="mt-2 flex flex-col gap-1 pl-8">
          {tools.map((tool, index) => (
            <Link
              key={index}
              href={tool.href}
              className={` py-1 px-2 text-sm ${
                currentRoute === tool.href
                  ? "font-semibold "
                  : " hover:bg-gray-200"
              }`}
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-16  lg:bottom-4 left-0 w-full px-4">
        <UsageAndPricing setFlag={setFlag} flag={flag} />
      </div>
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        onStartWriting={() => {
          toast.loading("Generating document...", { duration: 1500 });
          setTimeout(() => {
            toast.success("Document ready!", { duration: 1000 });
            // router.push("/writely-ai?start=1");
            router.push("/tools/main-tool?start=1");
          }, 2000);
        }}
      />
    </aside>
  );
};

export default MTSidebar;
