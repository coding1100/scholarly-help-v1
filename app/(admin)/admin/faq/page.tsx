"use client";

import { useState, useEffect } from "react";
import { useAdminSuccess } from "@/app/components/Admin/AdminSuccessProvider";
import { useAdminPageApiUrl } from "@/app/components/Admin/AdminDuplicateEditorContext";
import {
  AdminDuplicateDeleteButton,
  AdminDuplicateMetaPanel,
} from "@/app/components/Admin/AdminDuplicateLandingControls";
import AdminPageHeader from "@/app/components/Admin/AdminPageHeader";
import AdminButton from "@/app/components/Admin/AdminButton";

export default function FaqAdmin() {
  const { showSuccess } = useAdminSuccess();
  const pageApiUrl = useAdminPageApiUrl("/api/admin/faq");
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(pageApiUrl)
      .then(res => res.json())
      .then(data => setContent(data));
  }, [pageApiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(pageApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      // Show success message
      showSuccess();
    } catch (error) {
      alert('Error saving content');
    } finally {
      setLoading(false);
    }
  };

  const updateContent = (path: string, value: any) => {
    const keys = path.split('.');
    setContent((prev: any) => {
      const newContent = { ...prev };
      let current = newContent;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newContent;
    });
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader title="Edit FAQ Content" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <AdminDuplicateMetaPanel pageData={content} updatePageData={updateContent} />
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">FAQ Items</h2>
          {content.faqContent?.map((item: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">FAQ {index + 1}</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={item.question || ''}
                    onChange={(e) => updateContent(`faqContent.${index}.question`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    rows={4}
                    value={item.answer || ''}
                    onChange={(e) => updateContent(`faqContent.${index}.answer`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex flex-wrap justify-end gap-4">
          <AdminDuplicateDeleteButton disabled={loading} />
          <AdminButton type="submit" variant="primaryLg" disabled={loading} loading={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}