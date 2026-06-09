"use client";
import React, { useEffect, useState } from "react";
import DocumentsSidebar from "./DocumentsSidebar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import MTSidebar from "../MTSidebar";
import MTHeader from "./MTHeader";
import FooterBar from "./FooterBar";
import SettingsSidePanel from "./PopupModal/SettingsSidePanel";
import PromptModal from "../PromptModal";
import { appendQueryString } from "@/app/utils/url";
import AcademicAssistantPanel, {
  type AssistantPanel,
} from "./AcademicAssistantPanel";
import MainToolProductTour from "./MainToolProductTour";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
export interface TitleContextValue {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}

export const TitleContext = React.createContext<TitleContextValue>({
  title: "",
  setTitle: () => {},
});

export interface WordCountContextValue {
  wordCount: number;
  setWordCount: React.Dispatch<React.SetStateAction<number>>;
}

export const WordCountContext = React.createContext<WordCountContextValue>({
  wordCount: 0,
  setWordCount: () => {},
});

export interface EditorContextValue {
  editor: any | null;
  setEditor: React.Dispatch<React.SetStateAction<any | null>>;
}

export const EditorContext = React.createContext<EditorContextValue>({
  editor: null,
  setEditor: () => {},
});

export interface EditorPreferencesValue {
  autoComplete: boolean;
  setAutoComplete: React.Dispatch<React.SetStateAction<boolean>>;
  showAutocompleteButtons: boolean;
  setShowAutocompleteButtons: React.Dispatch<React.SetStateAction<boolean>>;
  citationStyle: string;
  setCitationStyle: React.Dispatch<React.SetStateAction<string>>;
}

export const EditorPreferencesContext =
  React.createContext<EditorPreferencesValue>({
    autoComplete: true,
    setAutoComplete: () => {},
    showAutocompleteButtons: true,
    setShowAutocompleteButtons: () => {},
    citationStyle: "APA 7th edition",
    setCitationStyle: () => {},
  });

interface MainToolLayoutProps {
  children: React.ReactNode;
  setFlag: (value: boolean) => void;
  flag: boolean;
  /** Used for the first-time product tour on workspace editor routes. */
  tourEditorActive?: boolean;
}

const MainToolLayout: React.FC<MainToolLayoutProps> = ({
  children,
  setFlag,
  flag,
  tourEditorActive = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [editor, setEditor] = useState<any | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<AssistantPanel | null>(null);
  const [isPromptModalOpen, setPromptModalOpen] = useState(false);
  const [autoComplete, setAutoComplete] = useState(true);
  const [showAutocompleteButtons, setShowAutocompleteButtons] = useState(true);
  const [citationStyle, setCitationStyle] = useState("APA 7th edition");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("doc");
  const currentQs =
    typeof window !== "undefined" ? window.location.search.slice(1) : "";
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [tourRestartNonce, setTourRestartNonce] = useState(0);

  const normalizedPath = pathname?.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
  const isAcademicResearchRoute =
    normalizedPath === "/tools/academic-research-assistant";
  const isStudyWorkspaceRoute = normalizedPath === "/tools/main-tool";
  const hasProductTour = isAcademicResearchRoute || isStudyWorkspaceRoute;

  const handleStartTour = () => setTourRestartNonce((n) => n + 1);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!t) {
      const signInBase = currentQs ? `/sign-in?${currentQs}` : "/sign-in";
      const signInHref = appendQueryString(
        signInBase,
        `returnUrl=${encodeURIComponent(pathname || "/tools/main-tool")}`,
      );
      router.push(signInHref);
    } else {
      setToken(t);
    }
    setChecked(true);
  }, [currentQs, router, pathname]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const togglePanel = (panel: AssistantPanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  if (!checked) {
    return (
      <ToolsApiLoader
        show
        respectToolsSidebar={false}
        respectToolHeader={false}
      />
    );
  }

  if (!token) return null;

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      <WordCountContext.Provider value={{ wordCount, setWordCount }}>
        <EditorContext.Provider value={{ editor, setEditor }}>
          <EditorPreferencesContext.Provider
            value={{
              autoComplete,
              setAutoComplete,
              showAutocompleteButtons,
              setShowAutocompleteButtons,
              citationStyle,
              setCitationStyle,
            }}
          >
            <div
              className={`flex h-[100dvh] overflow-hidden ${
                settingsOpen
                  ? "mr-[360px] md:mr-[420px] transition-[margin] duration-300"
                  : "transition-[margin] duration-300"
              }`}
            >
              {/* {sidebarOpen && <MTSidebar onToggle={() => setSidebarOpen(false)} />} */}
              {sidebarOpen && (
                <MTSidebar
                  onToggle={() => setSidebarOpen(false)}
                  setFlag={setFlag}
                  flag={flag}
                  activePanel={activePanel}
                  onPanelToggle={togglePanel}
                  onNewDocument={() => setPromptModalOpen(true)}
                  onStartTour={hasProductTour ? handleStartTour : undefined}
                />
              )}
              {isAcademicResearchRoute && activePanel === "documents" && (
                <div className="hidden lg:block h-full w-[18rem] xl:w-[22rem] border-r bg-white">
                  <div className="h-full w-full overflow-auto">
                    <DocumentsSidebar
                      onNew={() => setPromptModalOpen(true)}
                      onSelect={(id) =>
                        router.push(`${pathname || "/tools/academic-research-assistant"}?doc=${id}`)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              {isAcademicResearchRoute &&
                activePanel &&
                activePanel !== "documents" && (
                <AcademicAssistantPanel
                  activePanel={activePanel}
                  onClose={() => setActivePanel(null)}
                />
              )}
              <div
                className="flex min-h-0 min-w-0 flex-1 flex-col"
                data-tour="ara-main-workspace"
              >
                {/* <MTHeader /> */}
                <MTHeader
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={toggleSidebar}
                  onToggleSettings={() => setSettingsOpen((prev) => !prev)}
                  onOpenReview={() => setActivePanel("review")}
                  documentId={documentId}
                />
                <main className="min-h-0 flex-1 overflow-auto bg-white text-black">
                  {children}
                </main>
                <FooterBar />
              </div>
            </div>
            <SettingsSidePanel
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
            <PromptModal
              isOpen={isPromptModalOpen}
              onClose={() => setPromptModalOpen(false)}
              onStartWriting={() => {
                setPromptModalOpen(false);
                router.push(
                  `${pathname || "/tools/academic-research-assistant"}?start=1`,
                );
              }}
            />
            {hasProductTour && (
              <MainToolProductTour
                tourEditorActive={tourEditorActive}
                restartNonce={tourRestartNonce}
              />
            )}
          </EditorPreferencesContext.Provider>
        </EditorContext.Provider>
      </WordCountContext.Provider>
    </TitleContext.Provider>
  );
};

export default MainToolLayout;
