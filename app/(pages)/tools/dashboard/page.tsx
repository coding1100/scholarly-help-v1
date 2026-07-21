import { Suspense } from "react";
import DashboardPageContent from "./DashboardPageContent";
import { ToolsSuspenseFallback } from "@/app/components/AiTools/ToolsApiLoader";
import ProductSchema from "@/app/components/ProductSchema";

export default function DashboardPage() {
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scholarlyhelp.com";
  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;

  return (
    <Suspense fallback={<ToolsSuspenseFallback />}>
      <ProductSchema
        productTitle="Tools Dashboard - Scholarly Help"
        metaDescription="Access all Scholarly Help academic tools from one dashboard, including AI writing, citation, detection, and study tools for students and researchers."
        pageUrl={`${baseUrl}/tools/dashboard`}
      />
      <DashboardPageContent />
    </Suspense>
  );
}
