"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import { BiChevronsLeft } from "react-icons/bi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/app/axios";
import toast from "react-hot-toast";
import { FiTool } from "react-icons/fi";
import AccountPopover from "./AccountPopover";
import UsageAndPricing from "./UsageAndPricing";
import PromptModal from "./PromptModal";
import axios from "axios";
import { appendQueryString } from "@/app/utils/url";
import { upsertFbclidToolContext } from "@/app/utils/fbclidTracking";
import { __TOOLS_SHEET_EVENT_NAME__ } from "@/app/utils/toolsSheetClient";

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
  const searchParams = useSearchParams();
  // Normalize route by removing trailing slash for consistent comparison
  const normalizedRoute = currentRoute?.endsWith("/")
    ? currentRoute.slice(0, -1)
    : currentRoute;
  const tools = [
    { name: "Dashboard", href: "/tools/dashboard" },
    { name: "Main Tool", href: "/tools/main-tool" },
    { name: "Paraphraser Tool", href: "/tools/paraphraser-tool" },
    { name: "Summarizer Tool", href: "/tools/summarizer-tool" },
    { name: "Humanizer Tool", href: "/tools/humanizer-tool" },
    { name: "Thesis Generator Tool", href: "/tools/thesis-generator-tool" },
    { name: "Essay Outline Tool", href: "/tools/essay-outline-tool" },
    { name: "Essay Title Generator", href: "/tools/essay-title" },
    { name: "Research Question Generator", href: "/tools/research-question" },
    { name: "Pythagoras Equation Solver", href: "/tools/pythagoras-solver" },
    { name: "Citation Tool", href: "/tools/citation-tool" },
    { name: "Tutor Tool", href: "/tools/tutor" },
    { name: "Micro Learning", href: "/tools/mirco-learning" },
    { name: "Exam Prep", href: "/tools/exam-prep" },
    { name: "Language Practice", href: "/tools/language-practice" },
    { name: "CGPA Calculator", href: "/tools/cgpa-calculator" },

    // { name: "Syllabus Importer", href: "/tools/syllabus-importer" },
  ];
  const [showTools, setShowTools] = useState(false);
  const [userName, setUserName] = useState("User");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
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
    const fbclid = searchParams?.get("fbclid");
    if (!fbclid) return;
    if (!normalizedRoute?.startsWith("/tools/")) return;

    const user_id =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    const user_email =
      typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
    const user_name =
      typeof window !== "undefined" ? localStorage.getItem("user_name") : null;

    const activeTool =
      tools.find((t) => t.href === normalizedRoute) ||
      tools.find((t) => normalizedRoute?.startsWith(t.href));

    upsertFbclidToolContext({
      fbclid,
      user_id: user_id || undefined,
      user_email: user_email || undefined,
      user_name: user_name || undefined,
      current_path: normalizedRoute,
      current_active_tool: activeTool?.name || "Tools",
    });
  }, [normalizedRoute, searchParams]);

  const toolsSheetPostingRef = useRef(false);
  const toolsSheetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toolsSheetNeedFlushRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readFbclidState = () => {
      try {
        const raw = window.localStorage.getItem("sh_fbclid_tracking_v1");
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};
        return parsed as {
          fbclid?: string;
          user_name?: string;
          user_id?: string;
          user_email?: string;
          current_active_tool?: string;
          tool_visits?: Array<{ tool_name: string; path: string }>;
        };
      } catch {
        return {};
      }
    };

    const getDeviceLabel = () => {
      const ua = navigator.userAgent || "";
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "Mobile";
      return "Desktop";
    };

    const getFbclid = () => {
      const urlFbclid = searchParams?.get("fbclid") || undefined;
      const state = readFbclidState();
      return (urlFbclid || state.fbclid || "").trim() || null;
    };

    const postToToolsSheet = async (opts: { keepalive?: boolean } = {}) => {
      const fbclid = getFbclid();
      if (!fbclid) return;

      const state = readFbclidState();
      const toolsKey = `sh_toolssheet_tools_${fbclid}`;
      let nextTools: string[] = [];
      try {
        const prevRaw = window.localStorage.getItem(toolsKey);
        const prev = prevRaw ? (JSON.parse(prevRaw) as unknown) : [];
        nextTools = Array.isArray(prev) ? prev.filter((t) => typeof t === "string") : [];
      } catch {
        nextTools = [];
      }

      if (nextTools.length === 0) return;
      if (toolsSheetPostingRef.current) {
        toolsSheetNeedFlushRef.current = true;
        return;
      }

      const payload = {
        timestamp: new Date().toISOString(),
        email: state.user_email || localStorage.getItem("user_email") || undefined,
        userId: state.user_id || localStorage.getItem("user_id") || undefined,
        fbc: fbclid,
        toolUsed: nextTools,
        device: getDeviceLabel(),
        source: "meta",
      };

      toolsSheetPostingRef.current = true;
      try {
        const res = await fetch("/api/toolssheet/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: opts.keepalive === true,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`toolssheet failed: ${res.status} ${text}`);
        }
      } catch (e) {
        console.error("ToolsSheet POST failed:", e);
      } finally {
        toolsSheetPostingRef.current = false;
        if (toolsSheetNeedFlushRef.current) {
          toolsSheetNeedFlushRef.current = false;
          void postToToolsSheet();
        }
      }
    };

    const schedulePost = (delayMs: number) => {
      if (toolsSheetDebounceRef.current) {
        clearTimeout(toolsSheetDebounceRef.current);
        toolsSheetDebounceRef.current = null;
      }
      toolsSheetDebounceRef.current = setTimeout(() => {
        toolsSheetDebounceRef.current = null;
        void postToToolsSheet();
      }, delayMs);
    };

    const onGenerate = (evt: Event) => {
      const urlFbclid = searchParams?.get("fbclid") || undefined;
      const state = readFbclidState();
      const fbclid = (urlFbclid || state.fbclid || "").trim();
      if (!fbclid) return;

      const detail = (evt as CustomEvent).detail as { toolName?: string } | undefined;
      const toolFromEvent = detail?.toolName;

      const toolsKey = `sh_toolssheet_tools_${fbclid}`;
      let toolsList: string[] = [];
      try {
        const prevRaw = window.localStorage.getItem(toolsKey);
        const prev = prevRaw ? (JSON.parse(prevRaw) as unknown) : [];
        toolsList = Array.isArray(prev) ? prev.filter((t) => typeof t === "string") : [];
      } catch {
        toolsList = [];
      }

      const visitedTools = Array.isArray(state.tool_visits)
        ? state.tool_visits.map((v) => v?.tool_name).filter(Boolean)
        : [];

      const merged = new Set<string>([...toolsList, ...visitedTools]);
      if (toolFromEvent) merged.add(toolFromEvent);
      const nextTools = Array.from(merged).filter(Boolean);

      try {
        window.localStorage.setItem(toolsKey, JSON.stringify(nextTools));
      } catch {
        // ignore
      }

      if (nextTools.length === 0) return;
      // Debounce: merge many tool clicks, then one request; server upserts by fbclid.
      schedulePost(800);
    };

    const onPageHide = () => {
      if (toolsSheetDebounceRef.current) {
        clearTimeout(toolsSheetDebounceRef.current);
        toolsSheetDebounceRef.current = null;
      }
      void postToToolsSheet({ keepalive: true });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") onPageHide();
    };

    window.addEventListener(__TOOLS_SHEET_EVENT_NAME__, onGenerate);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(__TOOLS_SHEET_EVENT_NAME__, onGenerate);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
      if (toolsSheetDebounceRef.current) {
        clearTimeout(toolsSheetDebounceRef.current);
        toolsSheetDebounceRef.current = null;
      }
    };
  }, [searchParams]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!accessToken || isVerifying.current) return;

      isVerifying.current = true;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NGROX_URL}/auth/verify-token`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        console.log("Token verification response:", response);
        const user = response?.data?.user;
        const resolvedEmail = String(user?.email || user?.user_email || "")
          .trim()
          .toLowerCase();
        if (resolvedEmail) {
          try {
            if (!localStorage.getItem("user_email")) {
              localStorage.setItem("user_email", resolvedEmail);
            }
          } catch {
            // ignore
          }

          // If we have fbclid tracking active, enrich it with the newly-known email.
          const fbclid = searchParams?.get("fbclid");
          if (fbclid && normalizedRoute?.startsWith("/tools/")) {
            const activeTool =
              tools.find((t) => t.href === normalizedRoute) ||
              tools.find((t) => normalizedRoute?.startsWith(t.href));
            upsertFbclidToolContext({
              fbclid,
              user_id: localStorage.getItem("user_id") || undefined,
              user_email: resolvedEmail,
              user_name: localStorage.getItem("user_name") || undefined,
              current_path: normalizedRoute,
              current_active_tool: activeTool?.name || "Tools",
            });
          }
        }
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
          const currentQs = searchParams?.toString();
          const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
          const signInHref = appendQueryString(
            signInBase,
            `returnUrl=${encodeURIComponent(currentRoute)}`,
          );
          router.push(signInHref);
        } else {
          router.push("/");
        }
      }
    };

    verifyToken();
  }, [accessToken, normalizedRoute, router, searchParams]);
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
        "relative flex h-screen w-60 flex-col border-r dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 font-sans text-black dark:text-gray-200 transition-colors duration-300"
      }
    >
      {/* 1. User Profile Section */}
      <div className="relative flex-shrink-0 mb-2">
        <div
          className="flex items-center w-full gap-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
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
            <div className="w-8 h-8 flex items-center justify-center bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200 font-bold rounded-full text-sm uppercase">
              {userName.charAt(0)}
            </div>
          )}
          <span className="text-md font-semibold text-gray-800 dark:text-gray-200">
            {userName}
          </span>
          {/* </div> */}

          <span className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            <HiOutlineChevronUpDown className="h-4 w-4" />
          </span>
          <button
            onClick={onToggle}
            className="text-gray-500 dark:text-gray-400 block lg:hidden hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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
      <div className="flex-shrink-0 mb-2">
        {/* <button
          className="flex w-full items-center gap-3 px-3 py-1 text-sm transition-colors bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
          onClick={() => setShowTools((prev) => !prev)}
        >
          <FiTool className="h-5 w-5" />
          <span className="text-sm font-semibold">Tools</span>
        </button> */}
        {/* {showTools && ( */}
        <div className="mt-2 flex flex-col gap-1 pl-8">
          {tools.map((tool, index) => (
            <Link
              key={index}
              href={appendQueryString(
                tool.href,
                searchParams?.toString() || "",
              )}
              className={` py-1 px-2 text-sm rounded-md transition-colors ${
                normalizedRoute === tool.href
                  ? "font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  : " hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer to push bottom content down */}
      <div className="flex-1"></div>

      <div className="flex-shrink-0 mt-auto">
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
