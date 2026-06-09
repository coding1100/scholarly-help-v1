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


export default function SuccessStoriesAndReviewsAdmin() {
  const { confirmDelete } = useAdminConfirm();
  const { showSuccess } = useAdminSuccess();
  const pageApiUrl = useAdminPageApiUrl("/api/admin/success-stories-and-reviews");

  const [pageData, setPageData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(false);

  // Load page data on mount
  useEffect(() => {
    const loadPage = async () => {
      setPageLoading(true);
      try {
        const res = await fetch(pageApiUrl);
        if (!res.ok) {
          console.error('Failed to fetch page:', res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.error) {
          console.error('API error:', data.error);
          throw new Error(data.error);
        }

        setPageData(data && Object.keys(data).length > 0 ? {
          ...data,
          pageType: data.id || data.pageType || 'success-stories-and-reviews'
        } : {
          id: 'success-stories-and-reviews',
          pageType: 'success-stories-and-reviews',
          status: 'published',
          meta: { title: '', description: '', canonicalUrl: '' },
          heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
          featuredStories: { heading: '', stories: [] },
          whyScholalrySlider: { mainHeading: '', description: '', ctaButton: { text: '' } },
          successLookLike: { mainHeading: '', description: '' },
          academicPartners: { mainHeading: '', description: '', defaultCard: [], performances: [], ctaButton: { text: '' } },
          faq: []
        });
      } catch (error) {
        console.error('Error fetching page:', error);
        setPageData({
          id: 'success-stories-and-reviews',
          pageType: 'success-stories-and-reviews',
          status: 'published',
          meta: { title: '', description: '', canonicalUrl: '' },
          heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
          featuredStories: { heading: '', stories: [] },
          whyScholalrySlider: { mainHeading: '', description: '', ctaButton: { text: '' } },
          successLookLike: { mainHeading: '', description: '' },
          academicPartners: { mainHeading: '', description: '', defaultCard: [], performances: [], ctaButton: { text: '' } },
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
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
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
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
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
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
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
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
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
              <input
                type="text"
                value={pageData.heroSection?.subHeading || ''}
                onChange={(e) => updatePageData('heroSection.subHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
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

        {/* Featured Stories Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Stories</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading</label>
              <input
                type="text"
                value={pageData.featuredStories?.heading || ''}
                onChange={(e) => updatePageData('featuredStories.heading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Stories</label>
              {(pageData.featuredStories?.stories || []).map((story: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Story {index + 1}</span>
                    <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem('featuredStories.stories', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Title</label>
                      <input
                        type="text"
                        value={story.title || ''}
                        onChange={(e) => updateArrayItem('featuredStories.stories', index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={story.name || ''}
                        onChange={(e) => updateArrayItem('featuredStories.stories', index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Designation</label>
                      <input
                        type="text"
                        value={story.designation || ''}
                        onChange={(e) => updateArrayItem('featuredStories.stories', index, 'designation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={story.description || ''}
                        onChange={(e) => updateArrayItem('featuredStories.stories', index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('featuredStories.stories', { title: '', name: '', designation: '', description: '' })}>Add Story</AdminButton>
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

        {/* Success Look Like Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Success Look Like</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.successLookLike?.mainHeading || ''}
                onChange={(e) => updatePageData('successLookLike.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283c88] focus:border-[#283c88]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.successLookLike?.description || ''}
                onChange={(e) => updatePageData('successLookLike.description', e.target.value)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Performances / Stats (number, title, subtitle)</label>
              {(pageData.academicPartners?.performances || []).map((perf: { number?: string; title?: string; subtitle?: string }, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Stat {index + 1}</span>
                    <AdminButton type="button" variant="removeLink" onClick={() => removeArrayItem('academicPartners.performances', index)}>Remove</AdminButton>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={perf.number || ''}
                      onChange={(e) => updateArrayItem('academicPartners.performances', index, 'number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Number (e.g. 15K+, 24/7)"
                    />
                    <input
                      type="text"
                      value={perf.title || ''}
                      onChange={(e) => updateArrayItem('academicPartners.performances', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Title (e.g. Happy)"
                    />
                    <input
                      type="text"
                      value={perf.subtitle || ''}
                      onChange={(e) => updateArrayItem('academicPartners.performances', index, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Subtitle (e.g. Students)"
                    />
                  </div>
                </div>
              ))}
              <AdminButton type="button" variant="add" onClick={() => addArrayItem('academicPartners.performances', { number: '', title: '', subtitle: '' })}>Add Performance</AdminButton>
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
      <AdminPageHeader title="Edit Success Stories & Reviews Page" />
      {renderPageForm()}
    </div>
  );
}

