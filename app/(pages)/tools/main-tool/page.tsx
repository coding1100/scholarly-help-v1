"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { toast } from "react-hot-toast";
import MainToolLayout from "@/app/components/AiTools/MainTool/MainToolLayout";
import EditorContainer from "@/app/components/AiTools/MainTool/EditorContainer";
import MainDocEditer from "@/app/components/AiTools/MainTool/MainDocEditer";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ProductSchema from "@/app/components/ProductSchema";

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
    </MainToolLayout>
  );
};

const Page = () => {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="AI Document Writer - Scholarly Help"
        metaDescription="Write, edit, and refine academic documents with Scholarly Help's AI-powered writing tool."
        pageUrl={`${baseUrl}/tools/main-tool`}
      />
      <ClientPage />
    </Suspense>
  );
};

export default Page;
