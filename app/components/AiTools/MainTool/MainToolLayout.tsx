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

interface MainToolLayoutProps {
  children: React.ReactNode;
  setFlag: (value: boolean) => void;
  flag: boolean;
}

const MainToolLayout: React.FC<MainToolLayoutProps> = ({
  children,
  setFlag,
  flag,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(0);
  const [editor, setEditor] = useState<any | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [isPromptModalOpen, setPromptModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!t) {
      const currentQs = searchParams?.toString();
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
  }, [router, pathname, searchParams]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  if (!checked) {
    return (
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    );
  }

  if (!token) return null;

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      <WordCountContext.Provider value={{ wordCount, setWordCount }}>
        <EditorContext.Provider value={{ editor, setEditor }}>
          <div
            className={`flex h-screen ${
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
                documentsOpen={documentsOpen}
                onToggleDocuments={() => setDocumentsOpen((prev) => !prev)}
              />
            )}
            {/* Right-side documents/settings panel next to sidebar */}
            {documentsOpen && (
              <div className="hidden lg:block h-screen w-[18rem] xl:w-[22rem] border-r bg-white">
                <div className="h-full w-full overflow-auto">
                  <DocumentsSidebar
                    onNew={() => setPromptModalOpen(true)}
                    // onSelect={(id) => router.push(`/writely-ai?doc=${id}`)}
                    onSelect={(id) => router.push(`/tools/main-tool?doc=${id}`)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col flex-1">
              {/* <MTHeader /> */}
              <MTHeader
                sidebarOpen={sidebarOpen}
                onToggleSidebar={toggleSidebar}
                onToggleSettings={() => setSettingsOpen((prev) => !prev)}
              />
              <main className="flex-1 overflow-auto bg-white text-black">
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
              // router.push("/writely-ai?start=1");
              router.push("/tools/main-tool?start=1");
            }}
          />
        </EditorContext.Provider>
      </WordCountContext.Provider>
    </TitleContext.Provider>
  );
};

export default MainToolLayout;
