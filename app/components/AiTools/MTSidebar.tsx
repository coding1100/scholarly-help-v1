"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import {
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { BiChevronsLeft } from "react-icons/bi";
import { usePathname, useRouter } from "next/navigation";
import axiosInstance from "@/app/axios";
import toast from "react-hot-toast";
import { FiTool, FiPlus } from "react-icons/fi";
import AccountPopover from "./AccountPopover";
import UsageAndPricing from "./UsageAndPricing";
import PromptModal from "./PromptModal";
import StudySessionsNav from "./Dashboard/StudySessionsNav";
import axios from "axios";
import {
  createDocument,
  getAcademicErrorMessage,
} from "./MainTool/academicResearchApi";
import { outlineToHtml } from "./MainTool/outlineGeneration";
import { appendQueryString } from "@/app/utils/url";
import { getAccessToken } from "@/app/lib/authSession";
import { clearAuthSession } from "@/app/utils/auth";
import { isGuest, stashGuestMigrationId } from "@/app/lib/client/guestStudyLimits";
import { upsertFbclidToolContext } from "@/app/utils/fbclidTracking";
import { __TOOLS_SHEET_EVENT_NAME__ } from "@/app/utils/toolsSheetClient";
import type { AssistantPanel } from "./MainTool/AcademicAssistantPanel";

interface SidebarProps {
  onToggle?: () => void;
  setFlag: (value: boolean) => void;
  flag: boolean;
  activePanel?: AssistantPanel | null;
  onPanelToggle?: (panel: AssistantPanel) => void;
  onNewDocument?: () => void;
  onStartTour?: () => void;
}

const MTSidebar = ({
  onToggle,
  setFlag,
  flag,
  activePanel,
  onPanelToggle,
  onNewDocument,
  onStartTour,
}: SidebarProps) => {
  const currentRoute = usePathname();
  const router = useRouter();
  const currentQs =
    typeof window !== "undefined" ? window.location.search.slice(1) : "";
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(currentQs) : null;
  // Normalize route by removing trailing slash for consistent comparison
  const normalizedRoute = currentRoute?.endsWith("/")
    ? currentRoute.slice(0, -1)
    : currentRoute;
  const tools = [
    { name: "Explore Tools", href: "/tools/dashboard" },
    // { name: "Academic Research Assistant", href: "/tools/academic-research-assistant" },
    // { name: "Paraphraser Tool", href: "/tools/paraphraser-tool" },
    // { name: "Summarizer Tool", href: "/tools/summarizer-tool" },
    // { name: "Humanizer Tool", href: "/tools/humanizer-tool" },
    // { name: "Thesis Generator Tool", href: "/tools/thesis-generator-tool" },
    // { name: "Essay Outline Tool", href: "/tools/essay-outline-tool" },
    // { name: "Essay Title Generator", href: "/tools/essay-title" },
    // { name: "Research Question Generator", href: "/tools/research-question" },
    // { name: "Math Solver", href: "/tools/math-solver" },
    // { name: "Citation Tool", href: "/tools/citation-tool" },
    // { name: "Tutor Tool", href: "/tools/tutor" },
    // { name: "Micro Learning", href: "/tools/micro-learning" },
    // { name: "Exam Prep", href: "/tools/exam-prep" },
    // { name: "Language Practice", href: "/tools/language-practice" },
    // { name: "CGPA Calculator", href: "/tools/cgpa-calculator" },

    // { name: "Syllabus Importer", href: "/tools/syllabus-importer" },
  ];
  const [showTools, setShowTools] = useState(false);
  const [userName, setUserName] = useState("User");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // Guests (no auth token) are shown as "Guest" with sign-in / sign-up actions.
  // Defaults to false during SSR so the markup is stable until we read storage.
  const [guest, setGuest] = useState(false);
  const accessToken =
    typeof window !== "undefined" ? getAccessToken() : null;
  const isVerifying = useRef(false);
  const [userToggled, setUserToggled] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [isPromptModalOpen, setPromptModalOpen] = useState(false);
  // Outline from the sidebar "New document" modal — captured via ref because the
  // modal sets state then calls onStartWriting() in the same tick.
  const pendingOutlineRef = useRef<string[]>([]);

  const persistOutlineAndOpen = React.useCallback(
    async (sections: string[]) => {
      const target = appendQueryString(
        "/tools/academic-research-assistant",
        "",
      );
      try {
        const content = sections.length
          ? outlineToHtml(sections)
          : "<h1>Untitled</h1><p></p>";
        const doc = await createDocument({
          title: (sections[0] || "Untitled").slice(0, 120),
          content,
        });
        const id = doc.id || doc._id;
        pendingOutlineRef.current = [];
        if (id) {
          router.push(`${target}?doc=${id}`);
          return;
        }
        router.push(`${target}?start=1`);
      } catch (error) {
        toast.error(
          getAcademicErrorMessage(error, "Could not create the document."),
        );
        router.push(`${target}?start=1`);
      }
    },
    [router],
  );
  // Documents panel is controlled by parent layout
  const isAssistantRoute =
    normalizedRoute === "/tools/academic-research-assistant";
  const isStudyWorkspaceRoute = normalizedRoute === "/tools/main-tool";
  const showHowToUse = (isAssistantRoute || isStudyWorkspaceRoute) && !!onStartTour;
  const assistantActions = [
    {
      name: "Documents",
      panel: "documents" as AssistantPanel,
      icon: <HiOutlineDocumentText className="h-4 w-4" />,
    },
    {
      name: "Library",
      panel: "library" as AssistantPanel,
      icon: <HiOutlineBookOpen className="h-4 w-4" />,
    },
    {
      name: "AI Chat",
      panel: "chat" as AssistantPanel,
      icon: <HiOutlineChatBubbleLeftRight className="h-4 w-4" />,
    },
    // {
    //   name: "Review",
    //   panel: "review" as AssistantPanel,
    //   icon: <HiOutlineSparkles className="h-4 w-4" />,
    // },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("user_name");
      const image = localStorage.getItem("profile_image");
      if (name) setUserName(name);
      if (image) setProfileImage(image);
      setGuest(isGuest());
    }
  }, []);

  // Display label: real name when known, otherwise "Guest" for logged-out
  // visitors (falls back to "User" only in the brief pre-hydration window).
  const displayName = guest ? "Guest" : userName;
  const authQs = searchParams?.toString() || "";
  // Carry a returnUrl back to the current workspace URL so that, after auth, the
  // user lands here and the page's migration effect runs (claims the guest's
  // stashed work onto the new account). Without a returnUrl the user would be
  // sent to the default tools page and the migration would still fire, but
  // returning here keeps them on their session.
  const authReturnUrl =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : currentRoute || "/tools/study-workspace";
  const buildAuthHref = (base: string) => {
    const params = new URLSearchParams(authQs);
    params.set("returnUrl", authReturnUrl);
    return `${base}?${params.toString()}`;
  };
  const signInHref = buildAuthHref("/sign-in");
  const signUpHref = buildAuthHref("/sign-up");

  // Before leaving for auth, remember the current guest id so the workspace can
  // migrate that guest's sessions/queries onto the new account on return.
  const handleAuthNavigate = () => {
    stashGuestMigrationId();
  };

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
  const toolsSheetDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
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
        nextTools = Array.isArray(prev)
          ? prev.filter((t) => typeof t === "string")
          : [];
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
        email:
          state.user_email || localStorage.getItem("user_email") || undefined,
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

      const detail = (evt as CustomEvent).detail as
        | { toolName?: string }
        | undefined;
      const toolFromEvent = detail?.toolName;

      const toolsKey = `sh_toolssheet_tools_${fbclid}`;
      let toolsList: string[] = [];
      try {
        const prevRaw = window.localStorage.getItem(toolsKey);
        const prev = prevRaw ? (JSON.parse(prevRaw) as unknown) : [];
        toolsList = Array.isArray(prev)
          ? prev.filter((t) => typeof t === "string")
          : [];
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
        // Backend wraps responses as { success, message, data }
        const responseData = response?.data?.data ?? response?.data;
        const user = responseData?.user;
        const resolvedEmail = String(user?.email || user?.user_email || "")
          .trim()
          .toLowerCase();
        if (resolvedEmail) {
          try {
            // Always update; user can sign in/out between sessions.
            localStorage.setItem("user_email", resolvedEmail);
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
        toast.error("Session expired. Please sign in again.");
        clearAuthSession();

        if (currentRoute.includes("tools") || currentRoute === "/pricing/") {
          const currentQs = searchParams?.toString();
          const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
          const returnTo = `${currentRoute}${currentQs ? `?${currentQs}` : ""}`;
          const signInHref = appendQueryString(
            signInBase,
            `returnUrl=${encodeURIComponent(returnTo)}`,
          );
          router.push(signInHref);
        } else {
          router.push("/");
        }
      }
    };

    verifyToken();
  }, [accessToken, normalizedRoute, router, currentQs]);
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
      data-tour="ara-sidebar"
      className={
        "relative flex h-full w-60 flex-col overflow-hidden border-r dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 font-sans text-black dark:text-gray-200 transition-colors duration-300"
      }
    >
      {/* 1. User Profile Section */}
      <div className="relative flex-shrink-0 mb-2">
        <div
          className={`flex items-center w-full gap-2 rounded-md transition-colors duration-300 ${
            guest
              ? ""
              : "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}
          // ref={profileRef}
          onClick={() => {
            if (guest) return;
            setShowPopover((prev) => !prev);
          }}
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
              {displayName.charAt(0)}
            </div>
          )}
          <span className="text-md font-semibold text-gray-800 dark:text-gray-200">
            {displayName}
          </span>
          {/* </div> */}

          {!guest && (
            <span className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              <HiOutlineChevronUpDown className="h-4 w-4" />
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="ml-auto text-gray-500 dark:text-gray-400 block lg:hidden hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <BiChevronsLeft className="h-5 w-5" />
          </button>
        </div>
        {!guest && showPopover && (
          <div className="absolute left-0 mt-2 z-50">
            <AccountPopover setFlag={setFlag} flag={flag} />
          </div>
        )}
      </div>

      <div className="mb-2 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-hide">
        {/* <button
          className="flex w-full items-center gap-3 px-3 py-1 text-sm transition-colors bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md"
          onClick={() => setShowTools((prev) => !prev)}
        >
          <FiTool className="h-5 w-5" />
          <span className="text-sm font-semibold">Tools</span>
        </button> */}
        {/* {showTools && ( */}
        <div className="mt-2 flex flex-col gap-1 pl-4">
          {tools.map((tool, index) => {
            const isAcademicAssistant =
              tool.href === "/tools/academic-research-assistant";
            const isActive = normalizedRoute === tool.href;

            return (
              <div key={index} className="w-full">
                <Link
                  href={appendQueryString(
                    tool.href,
                    searchParams?.toString() || "",
                  )}
                  className={`block w-full rounded-md px-2 py-1 text-left text-sm leading-5 transition-colors ${
                    isActive
                      ? "font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                      : " hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {tool.name}
                </Link>
                {isAcademicAssistant && isAssistantRoute && (
                  <div
                    data-tour="ara-assistant-panels"
                    className="mt-1 mb-2 ml-2 space-y-1 border-l border-gray-200 pl-3"
                  >
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() =>
                        onNewDocument
                          ? onNewDocument()
                          : setPromptModalOpen(true)
                      }
                    >
                      <FiPlus className="h-4 w-4" />
                      <span>New</span>
                    </button>
                    {assistantActions.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => onPanelToggle?.(item.panel)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                          activePanel === item.panel
                            ? "bg-primary-100 font-semibold text-primary-400"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    ))}
                    {/* <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200"
                      onClick={() => toast("Tutorials are coming soon.")}
                    >
                      <HiOutlineQuestionMarkCircle className="h-4 w-4" />
                      <span>Tutorials</span>
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200"
                      onClick={() =>
                        toast(
                          "Shortcut: Shift + ArrowRight accepts AI suggestions.",
                        )
                      }
                    >
                      <FiTool className="h-4 w-4" />
                      <span>Shortcuts</span>
                    </button> */}
                  </div>
                )}
              </div>
            );
          })}
          {/* Study Workspace: "+ New Study Session" and full "Recent Sessions"
              history. Self-contained and route-scoped — renders only on the
              workspace and stays hidden until the first session exists. */}
          <StudySessionsNav onNavigate={onToggle} />
          {showHowToUse && (
            <button
              type="button"
              className="mt-3 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={onStartTour}
            >
              <HiOutlineQuestionMarkCircle className="h-4 w-4" />
              <span>How to Use</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 mt-auto">
        {guest && (
          <div className="mb-3 rounded-lg border border-primary-300 bg-primary-100 p-3">
            <p className="text-xs font-medium text-gray-600">
              Optional: sign in or create an account to save your work across
              devices.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Link
                href={signInHref}
                onClick={handleAuthNavigate}
                className="flex-1 rounded-md border border-primary-300 bg-white px-3 py-1.5 text-center text-sm font-semibold text-primary-400 transition-colors hover:bg-primary-200"
              >
                Sign in
              </Link>
              <Link
                href={signUpHref}
                onClick={handleAuthNavigate}
                className="flex-1 rounded-md bg-primary-400 px-3 py-1.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-500"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
        {/* Token limit + See Pricing are not relevant to guests (no usage/account
            yet) — show only once signed in. */}
        {!guest && <UsageAndPricing setFlag={setFlag} flag={flag} />}
      </div>
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        setOutlineResponse={(value) => {
          pendingOutlineRef.current =
            typeof value === "function"
              ? (value as (prev: string[]) => string[])(
                  pendingOutlineRef.current,
                )
              : value;
        }}
        onStartWriting={() => {
          void persistOutlineAndOpen(pendingOutlineRef.current);
        }}
      />
    </aside>
  );
};

export default MTSidebar;
