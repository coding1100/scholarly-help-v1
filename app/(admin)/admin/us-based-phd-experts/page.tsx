"use client";

import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useAdminSuccess } from "@/app/components/Admin/AdminSuccessProvider";
import { useAdminPageApiUrl } from "@/app/components/Admin/AdminDuplicateEditorContext";
import {
  AdminDuplicateDeleteButton,
  AdminDuplicateMetaPanel,
} from "@/app/components/Admin/AdminDuplicateLandingControls";
import { useState, useEffect } from "react";
import AdminPageHeader from "@/app/components/Admin/AdminPageHeader";
import AdminButton from "@/app/components/Admin/AdminButton";


export default function UsBasedPhdExpertsAdmin() {
  const { confirmDelete } = useAdminConfirm();
  const { showSuccess } = useAdminSuccess();
  const pageApiUrl = useAdminPageApiUrl("/api/admin/us-based-phd-experts");

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

        setPageData(data && Object.keys(data).length > 0 ? {
          ...data,
          pageType: data.id || data.pageType || 'us-based-phd-experts'
        } : {
          id: 'us-based-phd-experts',
          pageType: 'us-based-phd-experts',
          status: 'published',
          meta: { title: '', description: '', canonicalUrl: '' },
          heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
          supportContent: { mainHeading: '', description: '' },
          expertContent: { mainHeading: '', description: '' },
          chooseExpertSection: { mainHeading: '', description: '', steps: [] },
          whyScholalrySlider: { mainHeading: '', description: '', ctaButton: { text: '' } },
          academicPartners: { mainHeading: '', description: '', defaultCard: [], ctaButton: { text: '' } },
          faq: []
        });
      } catch (error) {
        console.error('Error fetching page:', error);
        setPageData({
          id: 'us-based-phd-experts',
          pageType: 'us-based-phd-experts',
          status: 'published',
          meta: { title: '', description: '', canonicalUrl: '' },
          heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
          supportContent: { mainHeading: '', description: '' },
          expertContent: { mainHeading: '', description: '' },
          chooseExpertSection: { mainHeading: '', description: '', steps: [] },
          whyScholalrySlider: { mainHeading: '', description: '', ctaButton: { text: '' } },
          academicPartners: { mainHeading: '', description: '', defaultCard: [], ctaButton: { text: '' } },
          faq: []
        });
      } finally {
        setPageLoading(false);
      }
    };
    loadPage();
  }, [pageApiUrl]);

  const updatePageData = (path: string, value: any) => {
    const keys = path.split('.');
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

  const addArrayItem = (path: string, item: any) => {
    const keys = path.split('.');
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

  const updateArrayItem = (path: string, index: number, field: string, value: any) => {
    const keys = path.split('.');
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
    )
      return;

    const keys = path.split('.');
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });
      const result = await response.json();
      if (result.success) {
        showSuccess();
      } else {
        alert(`Error: ${result.error || 'Failed to save'}`);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert(`Error saving page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPageLoading(false);
    }
  };

  const renderPageForm = () => {
    if (!pageData) return null;

    return (
      <form onSubmit={(e) => { e.preventDefault(); handlePageSave(); }} className="space-y-8">
        {/* Meta Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO & Meta</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text"
                value={pageData.meta?.title || ''}
                onChange={(e) => updatePageData('meta.title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                rows={3}
                value={pageData.meta?.description || ''}
                onChange={(e) => updatePageData('meta.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
              <input
                type="text"
                value={pageData.meta?.canonicalUrl || ''}
                onChange={(e) => updatePageData('meta.canonicalUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <AdminDuplicateMetaPanel pageData={pageData} updatePageData={updatePageData} />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Hero Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <textarea
                rows={3}
                value={pageData.heroSection?.mainHeading || ''}
                onChange={(e) => updatePageData('heroSection.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
                placeholder="Use &lt;br/&gt; for line breaks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Heading</label>
              <textarea
                rows={2}
                value={pageData.heroSection?.subHeading || ''}
                onChange={(e) => updatePageData('heroSection.subHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
                placeholder="Use &lt;br/&gt; for line breaks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={pageData.heroSection?.description || ''}
                onChange={(e) => updatePageData('heroSection.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 1 Text</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn1 || ''}
                  onChange={(e) => updatePageData('heroSection.btn1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
                  placeholder="Default: Take My Full Class"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 Text</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn2 || ''}
                  onChange={(e) => updatePageData('heroSection.btn2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
                  placeholder="Default: Pass My Exam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 1 URL</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn1Url || ''}
                  onChange={(e) => updatePageData('heroSection.btn1Url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
                  placeholder="e.g., /contact-us or https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 URL</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn2Url || ''}
                  onChange={(e) => updatePageData('heroSection.btn2Url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
                  placeholder="e.g., /contact-us or https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Support Content */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Support Content</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.supportContent?.mainHeading || ''}
                onChange={(e) => updatePageData('supportContent.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={pageData.supportContent?.description || ''}
                onChange={(e) => updatePageData('supportContent.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
          </div>
        </div>

        {/* Expert Content */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Expert Content</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.expertContent?.mainHeading || ''}
                onChange={(e) => updatePageData('expertContent.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.expertContent?.description || ''}
                onChange={(e) => updatePageData('expertContent.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
          </div>
        </div>

        {/* Choose Expert Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Expert Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.chooseExpertSection?.mainHeading || ''}
                onChange={(e) => updatePageData('chooseExpertSection.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.chooseExpertSection?.description || ''}
                onChange={(e) => updatePageData('chooseExpertSection.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Steps</label>
              {(pageData.chooseExpertSection?.steps || []).map((step: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Step {index + 1}</span>
                    <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem('chooseExpertSection.steps', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Title (Sub Heading)</label>
                      <input
                        type="text"
                        value={step.title || ''}
                        onChange={(e) => updateArrayItem('chooseExpertSection.steps', index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Description (Sub Description)</label>
                      <textarea
                        rows={3}
                        value={step.description || ''}
                        onChange={(e) => updateArrayItem('chooseExpertSection.steps', index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('chooseExpertSection.steps', { title: '', description: '' })}>Add Step</AdminButton>
            </div>
          </div>
        </div>

        {/* Why Scholarly Slider */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Scholarly Slider</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.whyScholalrySlider?.mainHeading || pageData.whyScholarlySlider?.mainHeading || ''}
                onChange={(e) => updatePageData('whyScholalrySlider.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.whyScholalrySlider?.description || pageData.whyScholarlySlider?.description || ''}
                onChange={(e) => updatePageData('whyScholalrySlider.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.whyScholalrySlider?.ctaButton?.text || pageData.whyScholarlySlider?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('whyScholalrySlider.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
          </div>
        </div>

        {/* Academic Partners */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Partners</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.academicPartners?.mainHeading || ''}
                onChange={(e) => updatePageData('academicPartners.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.academicPartners?.description || ''}
                onChange={(e) => updatePageData('academicPartners.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.academicPartners?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('academicPartners.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Cards</label>
              {(pageData.academicPartners?.defaultCard || []).map((card: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Card {index + 1}</span>
                    <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem('academicPartners.defaultCard', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">ID</label>
                      <input
                        type="number"
                        value={card.id || ''}
                        onChange={(e) => updateArrayItem('academicPartners.defaultCard', index, 'id', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        value={card.title || ''}
                        onChange={(e) => updateArrayItem('academicPartners.defaultCard', index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={card.description || ''}
                        onChange={(e) => updateArrayItem('academicPartners.defaultCard', index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('academicPartners.defaultCard', { id: 0, title: '', description: '' })}>Add Card</AdminButton>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">FAQ Section</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">FAQs</label>
            {(pageData.faq || []).map((faq: any, index: number) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">FAQ {index + 1}</span>
                  <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem('faq', index)}>Remove</AdminButton>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Question</label>
                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => updateArrayItem('faq', index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Answer</label>
                    <textarea
                      rows={3}
                      value={faq.answer || ''}
                      onChange={(e) => updateArrayItem('faq', index, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <AdminButton type="button" variant="add" onClick={() => addArrayItem('faq', { id: (pageData.faq?.length || 0) + 1, question: '', answer: '' })}>Add FAQ</AdminButton>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-wrap justify-end gap-4">
          <AdminDuplicateDeleteButton disabled={pageLoading} />
          <AdminButton type="submit" variant="primaryLg" disabled={pageLoading} loading={pageLoading}>{pageLoading ? "Saving..." : "Save Page"}</AdminButton>
        </div>
      </form>
    );
  };

  if (pageLoading && !pageData) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <AdminPageHeader title="Edit US-Based PhD Experts Page" />
      {renderPageForm()}
    </div>
  );
}

