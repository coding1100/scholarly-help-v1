"use client";
// import TopHeader from "./TopHeader";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ParagraphEditor from "./ParagraphEditor";
import { TitleContext } from "./MainToolLayout";
import { getAcademicErrorMessage, getDocument } from "./academicResearchApi";
import ToolsApiLoader from "@/app/components/AiTools/ToolsApiLoader";
// import FloatingToolbar from "./FloatingToolbar";

interface EditorContainerProps {
  outlineResponse: string[];
  documentId?: string | null;
}

const EditorContainer: React.FC<EditorContainerProps> = ({
  outlineResponse,
  documentId,
}) => {
  const { setTitle } = useContext(TitleContext);
  const [initialContent, setInitialContent] = useState<string | undefined>();
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    if (!documentId || documentId === "undefined" || documentId === "null") {
      return;
    }

    let cancelled = false;
    setLoadingDocument(true);

    getDocument(documentId)
      .then((document) => {
        if (cancelled) return;
        setTitle(document.title || "Untitled");
        setInitialContent(document.content || "<h1>Main Heading</h1><p></p>");
      })
      .catch((error) => {
        toast.error(
          getAcademicErrorMessage(error, "Could not load this document."),
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingDocument(false);
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, setTitle]);

  return (
    <div
      data-tour="ara-editor"
      className="relative min-h-screen flex flex-col"
    >
      {/* <TopHeader /> */}
      <div className="flex-1 flex justify-center items-start pt-8">
        <div className="relative w-full max-w-3xl p-6 border-none">
          <ToolsApiLoader show={loadingDocument} contained />
          <ParagraphEditor
            outlineResponse={outlineResponse}
            documentId={documentId}
            initialContent={initialContent}
          />
        </div>
      </div>
      {/* <FloatingToolbar /> */}
    </div>
  );
};

export default EditorContainer;
