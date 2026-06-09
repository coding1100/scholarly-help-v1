"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Toaster, toast } from "react-hot-toast";
import MainToolLayout from "@/app/components/AiTools/MainTool/MainToolLayout";
import EditorContainer from "@/app/components/AiTools/MainTool/EditorContainer";
import MainDocEditer from "@/app/components/AiTools/MainTool/MainDocEditer";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";

const ClientPage = () => {
  const searchParams = useSearchParams();
  const [showEditor, setShowEditor] = useState(false);
  const [flag, setFlag] = useState(false);
  const [outlineResponse, setOutlineResponse] = useState<string[]>([]);
  const documentId = searchParams.get("doc");

  const handleStartWriting = () => {
    toast.loading("Generating document...", { duration: 1500 });

    setTimeout(() => {
      setShowEditor(true);
      toast.success("Document ready!", { duration: 1000 });
    }, 2000);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("start") === "1") {
      setShowEditor(true);
    }
  }, []);

  useEffect(() => {
    if (documentId) {
      setShowEditor(true);
    }
  }, [documentId]);

  return (
    <MainToolLayout flag={flag} setFlag={setFlag} tourEditorActive={showEditor}>
      {showEditor ? (
        <EditorContainer outlineResponse={outlineResponse} documentId={documentId} />
      ) : (
        <MainDocEditer
          onStartWriting={handleStartWriting}
          setOutlineResponse={setOutlineResponse}
        />
      )}
      <Toaster />
    </MainToolLayout>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ClientPage />
    </Suspense>
  );
};

export default Page;
