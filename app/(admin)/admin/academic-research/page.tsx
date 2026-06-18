"use client";

import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useAdminSuccess } from "@/app/components/Admin/AdminSuccessProvider";
import { useAdminPageApiUrl } from "@/app/components/Admin/AdminDuplicateEditorContext";
import { AdminDuplicateMetaPanel } from "@/app/components/Admin/AdminDuplicateLandingControls";
import { useState, useEffect } from "react";
import AdminPageHeader from "@/app/components/Admin/AdminPageHeader";
import AdminButton from "@/app/components/Admin/AdminButton";
import { mergeAcademicResearchContent } from "@/app/components/MainToolLanding/mergeAcademicResearchContent";
import { PICK_TAB_SLUGS } from "@/app/components/MainToolLanding/pickTabUtils";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]";

export default function AcademicResearchAdmin() {
  const { confirmDelete } = useAdminConfirm();
  const { showSuccess } = useAdminSuccess();
  const pageApiUrl = useAdminPageApiUrl("/api/admin/academic-research");

  const [pageData, setPageData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      setPageLoading(true);
      try {
        const res = await fetch(pageApiUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setPageData(
          mergeAcademicResearchContent(
            data && Object.keys(data).length > 0 ? data : null,
          ),
        );
      } catch (error) {
        console.error("Error fetching page:", error);
        setPageData(mergeAcademicResearchContent(null));
      } finally {
        setPageLoading(false);
      }
    };
    loadPage();
  }, [pageApiUrl]);

  const updatePageData = (path: string, value: unknown) => {
    const keys = path.split(".");
    setPageData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (path: string, item: unknown) => {
    const keys = path.split(".");
    setPageData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      if (!Array.isArray(current[keys[keys.length - 1]])) {
        current[keys[keys.length - 1]] = [];
      }
      current[keys[keys.length - 1]].push(item);
      return newData;
    });
  };

  const updateArrayItem = (
    path: string,
    index: number,
    field: string,
    value: unknown,
  ) => {
    const keys = path.split(".");
    setPageData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      current[index][field] = value;
      return newData;
    });
  };

  const removeArrayItem = async (path: string, index: number) => {
    if (
      !(await confirmDelete({
        variant: "remove",
        message: "Are you sure you want to remove this item?",
      }))
    ) {
      return;
    }

    const keys = path.split(".");
    setPageData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      current.splice(index, 1);
      return newData;
    });
  };

  const handlePageSave = async () => {
    if (!pageData) return;
    setPageLoading(true);
    try {
      const response = await fetch(pageApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      const result = await response.json();
      if (result.success) {
        showSuccess();
      } else {
        alert(`Error: ${result.error || "Failed to save"}`);
      }
    } catch (error) {
      console.error("Error saving page:", error);
      alert(
        `Error saving page: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setPageLoading(false);
    }
  };

  if (pageLoading && !pageData) {
    return <div className="p-8">Loading...</div>;
  }

  if (!pageData) return null;

  return (
    <div className="p-6">
      <AdminPageHeader title="Academic Research Landing" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePageSave();
        }}
        className="space-y-8"
      >
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO & Meta</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text"
                value={pageData.meta?.title || ""}
                onChange={(e) => updatePageData("meta.title", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                rows={3}
                value={pageData.meta?.description || ""}
                onChange={(e) => updatePageData("meta.description", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
              <input
                type="text"
                value={pageData.meta?.canonicalUrl || ""}
                onChange={(e) => updatePageData("meta.canonicalUrl", e.target.value)}
                className={inputClass}
              />
            </div>
            <AdminDuplicateMetaPanel pageData={pageData} updatePageData={updatePageData} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Hero Section</h2>
          <div className="grid grid-cols-1 gap-4">
            <input className={inputClass} placeholder="Badge text" value={pageData.heroSection?.badgeText || ""} onChange={(e) => updatePageData("heroSection.badgeText", e.target.value)} />
            <input className={inputClass} placeholder="Heading prefix" value={pageData.heroSection?.headingPrefix || ""} onChange={(e) => updatePageData("heroSection.headingPrefix", e.target.value)} />
            <input className={inputClass} placeholder="Highlight word" value={pageData.heroSection?.highlightWord || ""} onChange={(e) => updatePageData("heroSection.highlightWord", e.target.value)} />
            <input className={inputClass} placeholder="Heading suffix" value={pageData.heroSection?.headingSuffix || ""} onChange={(e) => updatePageData("heroSection.headingSuffix", e.target.value)} />
            <textarea rows={3} className={inputClass} placeholder="Description (HTML allowed)" value={pageData.heroSection?.description || ""} onChange={(e) => updatePageData("heroSection.description", e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className={inputClass} placeholder="Button 1 text" value={pageData.heroSection?.btn1 || ""} onChange={(e) => updatePageData("heroSection.btn1", e.target.value)} />
              <input className={inputClass} placeholder="Button 1 URL" value={pageData.heroSection?.btn1Url || ""} onChange={(e) => updatePageData("heroSection.btn1Url", e.target.value)} />
              <input className={inputClass} placeholder="Button 2 text" value={pageData.heroSection?.btn2 || ""} onChange={(e) => updatePageData("heroSection.btn2", e.target.value)} />
              <input className={inputClass} placeholder="Button 2 URL" value={pageData.heroSection?.btn2Url || ""} onChange={(e) => updatePageData("heroSection.btn2Url", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specs (comma-separated)</label>
              <textarea
                rows={2}
                className={inputClass}
                value={(pageData.heroSection?.specs || []).join(", ")}
                onChange={(e) =>
                  updatePageData(
                    "heroSection.specs",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Universities Section</h2>
          <input className={inputClass} value={pageData.helpSection?.title || ""} onChange={(e) => updatePageData("helpSection.title", e.target.value)} />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pick Tools Section</h2>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <input className={inputClass} value={pageData.pickSection?.heading || ""} onChange={(e) => updatePageData("pickSection.heading", e.target.value)} />
            <textarea rows={2} className={inputClass} value={pageData.pickSection?.description || ""} onChange={(e) => updatePageData("pickSection.description", e.target.value)} />
            <input className={inputClass} value={pageData.pickSection?.showAllButtonText || ""} onChange={(e) => updatePageData("pickSection.showAllButtonText", e.target.value)} />
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Tabs (comma-separated)"
              value={(pageData.pickSection?.tabs || []).join(", ")}
              onChange={(e) =>
                updatePageData(
                  "pickSection.tabs",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
          </div>
          <h3 className="font-medium mb-3">All Tools Grid</h3>
          {(pageData.pickSection?.tools || []).map((tool: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Tool {index + 1}</span>
                <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem("pickSection.tools", index)}>Remove</AdminButton>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <select className={inputClass} value={tool.iconKey || "tmIcon1"} onChange={(e) => updateArrayItem("pickSection.tools", index, "iconKey", e.target.value)}>
                  <option value="tmIcon1">Icon 1</option>
                  <option value="tmIcon2">Icon 2</option>
                  <option value="tmIcon3">Icon 3</option>
                  <option value="tmIcon4">Icon 4</option>
                </select>
                <input className={inputClass} placeholder="Tag (POPULAR/FREE)" value={tool.tag || ""} onChange={(e) => updateArrayItem("pickSection.tools", index, "tag", e.target.value)} />
                <input className={inputClass} placeholder="Heading" value={tool.heading || ""} onChange={(e) => updateArrayItem("pickSection.tools", index, "heading", e.target.value)} />
                <textarea rows={2} className={inputClass} placeholder="Description" value={tool.description || ""} onChange={(e) => updateArrayItem("pickSection.tools", index, "description", e.target.value)} />
                <input className={inputClass} placeholder="Button text" value={tool.buttonText || ""} onChange={(e) => updateArrayItem("pickSection.tools", index, "buttonText", e.target.value)} />
                <input className={inputClass} placeholder="Link" value={tool.link || ""} onChange={(e) => updateArrayItem("pickSection.tools", index, "link", e.target.value)} />
              </div>
            </div>
          ))}
          <AdminButton type="button" variant="add" onClick={() => addArrayItem("pickSection.tools", { iconKey: "tmIcon1", tag: "POPULAR", heading: "", description: "", buttonText: "", link: "" })}>Add Tool</AdminButton>

          {Object.entries(PICK_TAB_SLUGS).map(([tabLabel, tabSlug]) => (
            <div key={tabSlug} className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-medium mb-3">{tabLabel} Tab Grid</h3>
              {(pageData.pickSection?.tabTools?.[tabSlug] || []).map((tool: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Tool {index + 1}</span>
                    <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem(`pickSection.tabTools.${tabSlug}`, index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <select className={inputClass} value={tool.iconKey || "tmIcon1"} onChange={(e) => updateArrayItem(`pickSection.tabTools.${tabSlug}`, index, "iconKey", e.target.value)}>
                      <option value="tmIcon1">Icon 1</option>
                      <option value="tmIcon2">Icon 2</option>
                      <option value="tmIcon3">Icon 3</option>
                      <option value="tmIcon4">Icon 4</option>
                    </select>
                    <input className={inputClass} placeholder="Tag (POPULAR/FREE)" value={tool.tag || ""} onChange={(e) => updateArrayItem(`pickSection.tabTools.${tabSlug}`, index, "tag", e.target.value)} />
                    <input className={inputClass} placeholder="Heading" value={tool.heading || ""} onChange={(e) => updateArrayItem(`pickSection.tabTools.${tabSlug}`, index, "heading", e.target.value)} />
                    <textarea rows={2} className={inputClass} placeholder="Description" value={tool.description || ""} onChange={(e) => updateArrayItem(`pickSection.tabTools.${tabSlug}`, index, "description", e.target.value)} />
                    <input className={inputClass} placeholder="Button text" value={tool.buttonText || ""} onChange={(e) => updateArrayItem(`pickSection.tabTools.${tabSlug}`, index, "buttonText", e.target.value)} />
                    <input className={inputClass} placeholder="Link" value={tool.link || ""} onChange={(e) => updateArrayItem(`pickSection.tabTools.${tabSlug}`, index, "link", e.target.value)} />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem(`pickSection.tabTools.${tabSlug}`, { iconKey: "tmIcon1", tag: "POPULAR", heading: "", description: "", buttonText: "", link: "" })}>Add Tool</AdminButton>
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Section</h2>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <input className={inputClass} value={pageData.dashboardSection?.badge || ""} onChange={(e) => updatePageData("dashboardSection.badge", e.target.value)} />
            <input className={inputClass} value={pageData.dashboardSection?.headingLine1 || ""} onChange={(e) => updatePageData("dashboardSection.headingLine1", e.target.value)} />
            <input className={inputClass} value={pageData.dashboardSection?.headingLine2 || ""} onChange={(e) => updatePageData("dashboardSection.headingLine2", e.target.value)} />
            <textarea rows={3} className={inputClass} value={pageData.dashboardSection?.description || ""} onChange={(e) => updatePageData("dashboardSection.description", e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className={inputClass} placeholder="CTA button" value={pageData.dashboardSection?.ctaButton || ""} onChange={(e) => updatePageData("dashboardSection.ctaButton", e.target.value)} />
              <input className={inputClass} placeholder="CTA URL" value={pageData.dashboardSection?.ctaButtonUrl || ""} onChange={(e) => updatePageData("dashboardSection.ctaButtonUrl", e.target.value)} />
            </div>
          </div>
          <h3 className="font-medium mb-3">Features</h3>
          {(pageData.dashboardSection?.features || []).map((feature: any, index: number) => (
            <div key={index} className="mb-3 p-3 border rounded-md grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Title" value={feature.title || ""} onChange={(e) => updateArrayItem("dashboardSection.features", index, "title", e.target.value)} />
              <input className={inputClass} placeholder="Description" value={feature.description || ""} onChange={(e) => updateArrayItem("dashboardSection.features", index, "description", e.target.value)} />
            </div>
          ))}
          <h3 className="font-medium mb-3 mt-6">Stats</h3>
          {(pageData.dashboardSection?.stats || []).map((stat: any, index: number) => (
            <div key={index} className="mb-3 p-3 border rounded-md grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className={inputClass} placeholder="Value" value={stat.value || ""} onChange={(e) => updateArrayItem("dashboardSection.stats", index, "value", e.target.value)} />
              <input className={inputClass} placeholder="Label" value={stat.label || ""} onChange={(e) => updateArrayItem("dashboardSection.stats", index, "label", e.target.value)} />
            </div>
          ))}
          <h3 className="font-medium mb-3 mt-6">History Items</h3>
          {(pageData.dashboardSection?.history || []).map((item: any, index: number) => (
            <div key={index} className="mb-3 p-3 border rounded-md grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className={inputClass} placeholder="Title" value={item.title || ""} onChange={(e) => updateArrayItem("dashboardSection.history", index, "title", e.target.value)} />
              <input className={inputClass} placeholder="Time" value={item.time || ""} onChange={(e) => updateArrayItem("dashboardSection.history", index, "time", e.target.value)} />
              <input className={inputClass} placeholder="Action" value={item.action || ""} onChange={(e) => updateArrayItem("dashboardSection.history", index, "action", e.target.value)} />
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Tools Section</h2>
          <input className={`${inputClass} mb-4`} value={pageData.whySection?.heading || ""} onChange={(e) => updatePageData("whySection.heading", e.target.value)} />
          {(pageData.whySection?.items || []).map((item: any, index: number) => (
            <div key={index} className="mb-3 p-3 border rounded-md grid grid-cols-1 gap-3">
              <input className={inputClass} placeholder="Heading" value={item.heading || ""} onChange={(e) => updateArrayItem("whySection.items", index, "heading", e.target.value)} />
              <textarea rows={2} className={inputClass} placeholder="Description" value={item.description || ""} onChange={(e) => updateArrayItem("whySection.items", index, "description", e.target.value)} />
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Trust Cards Section</h2>
          {(pageData.cardsSection?.cards || []).map((card: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="grid grid-cols-1 gap-3">
                <select className={inputClass} value={card.iconKey || "MTconfidentiality"} onChange={(e) => updateArrayItem("cardsSection.cards", index, "iconKey", e.target.value)}>
                  <option value="MTconfidentiality">Confidentiality</option>
                  <option value="MTstudents">Students</option>
                  <option value="MTtutors">Tutors</option>
                  <option value="MTcourse">Courses</option>
                </select>
                <input className={inputClass} placeholder="Heading" value={card.heading || ""} onChange={(e) => updateArrayItem("cardsSection.cards", index, "heading", e.target.value)} />
                <textarea rows={2} className={inputClass} placeholder="Description" value={card.description || ""} onChange={(e) => updateArrayItem("cardsSection.cards", index, "description", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">FAQ Section</h2>
          {(pageData.faq || []).map((item: any, index: number) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">FAQ {index + 1}</span>
                <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem("faq", index)}>Remove</AdminButton>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <input className={inputClass} placeholder="Question" value={item.question || ""} onChange={(e) => updateArrayItem("faq", index, "question", e.target.value)} />
                <textarea rows={3} className={inputClass} placeholder="Answer" value={item.answer || ""} onChange={(e) => updateArrayItem("faq", index, "answer", e.target.value)} />
              </div>
            </div>
          ))}
          <AdminButton type="button" variant="add" onClick={() => addArrayItem("faq", { question: "", answer: "" })}>Add FAQ</AdminButton>
        </div>

        <div className="flex justify-end">
          <AdminButton type="submit" variant="primaryLg" disabled={pageLoading} loading={pageLoading}>
            {pageLoading ? "Saving..." : "Save Changes"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
