"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

function resolveTakeMyClassAdminPage(pathname: string | null) {
  if (pathname?.includes("take-my-class-always-working-harder")) {
    return {
      pageId: "take-my-class-always-working-harder",
      pageLabel: "Take My Class (Always Working Harder)",
    };
  }
  if (pathname?.includes("take-my-class-protect-gpa")) {
    return {
      pageId: "take-my-class-protect-gpa",
      pageLabel: "Take My Class (Protect GPA)",
    };
  }
  if (pathname?.includes("take-my-class-still-doing")) {
    return {
      pageId: "take-my-class-still-doing",
      pageLabel: "Take My Class (Still Doing)",
    };
  }
  if (pathname?.includes("take-my-class-professor-does-not-care")) {
    return {
      pageId: "take-my-class-professor-does-not-care",
      pageLabel: "Take My Class (Professor Does Not Care)",
    };
  }
  if (pathname?.includes("take-my-class-3")) {
    return { pageId: "take-my-class-3", pageLabel: "Take My Class 3" };
  }
  return { pageId: "take-my-class", pageLabel: "Take My Class" };
}

export default function TakeMyClassAdmin() {
  const pathname = usePathname();
  const { pageId, pageLabel } = resolveTakeMyClassAdminPage(pathname);
  const [pageData, setPageData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(false);

  // Load page data on mount
  useEffect(() => {
    const loadTakeMyClassPage = async () => {
      setPageLoading(true);
      try {
        const res = await fetch(`/api/admin/${pageId}`);
        if (!res.ok) {
          console.error(`Failed to fetch ${pageId} page:`, res.status, res.statusText);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.error) {
          console.error('API error:', data.error);
          throw new Error(data.error);
        }

        setPageData(data && Object.keys(data).length > 0 ? {
          ...data,
          id: data.id || pageId,
          pageType: data.pageType || data.id || pageId
        } : {
          id: pageId,
          pageType: pageId,
          meta: { title: '', description: '', canonicalUrl: '' },
          heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
whySlider: { mainHeading: '', description: '', ctaButton: { text: '' }, sliderItems: [] },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
          description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
          guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
          processSection: { mainHeading: '', description: '', steps: [] },
          success: { mainHeading: '', description: '', ctaButton: { text: '' } },
          academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
          finalCta: { textBefore: '', highlightedText: '', textAfter: '', description: '', buttonText: '' },
          customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
          getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
          faq: { mainHeading: '', faqs: [] }
        });
      } catch (error) {
        console.error(`Error fetching ${pageId} page:`, error);
        setPageData({
          id: pageId,
          pageType: pageId,
          meta: { title: '', description: '', canonicalUrl: '' },
          heroSection: { mainHeading: '', subHeading: '', description: '', btn1: '', btn2: '', btn1Url: '', btn2Url: '' },
whySlider: { mainHeading: '', description: '', ctaButton: { text: '' }, sliderItems: [] },
            cardCarousel: { mainHeading: '', description: '', ctaButton: { text: '' }, cards: [] },
          description: { mainHeading: '', description: '', services: [], badges: [], ctaButton: { text: '' } },
          guaranteedBlock: { mainHeading: '', description: '', ctaButton: { text: '' } },
          processSection: { mainHeading: '', description: '', steps: [] },
          success: { mainHeading: '', description: '', ctaButton: { text: '' } },
          academicPartners: { mainHeading: '', description: '', cards: [], performances: [], ctaButton: { text: '' } },
          finalCta: { textBefore: '', highlightedText: '', textAfter: '', description: '', buttonText: '' },
          customerReviews: { mainHeading: '', trustpilotRating: '', reviews: [] },
          getQuote: { mainHeading: '', description: '', ctaButton: { text: '' } },
          faq: { mainHeading: '', faqs: [] }
        });
      } finally {
        setPageLoading(false);
      }
    };
    loadTakeMyClassPage();
  }, [pageId]);

  const updatePageData = (path: string, value: any) => {
    const keys = path.split('.');
    setPageData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues
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
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues
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
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length; i++) {
        current = current[keys[i]];
      }
      current[index][field] = value;
      return newData;
    });
  };

  const removeArrayItem = (path: string, index: number) => {
    const keys = path.split('.');
    setPageData((prev: any) => {
      const newData = { ...prev };
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
      const response = await fetch(`/api/admin/${pageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });
      const result = await response.json();
      if (result.success) {
        alert(`${pageLabel} page saved successfully!`);
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                rows={3}
                value={pageData.meta?.description || ''}
                onChange={(e) => updatePageData('meta.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
              <input
                type="text"
                value={pageData.meta?.canonicalUrl || ''}
                onChange={(e) => updatePageData('meta.canonicalUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Use &lt;br/&gt; for line breaks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Heading</label>
              <input
                type="text"
                value={pageData.heroSection?.subHeading || ''}
                onChange={(e) => updatePageData('heroSection.subHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={pageData.heroSection?.description || ''}
                onChange={(e) => updatePageData('heroSection.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 1 Text</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn1 || ''}
                  onChange={(e) => updatePageData('heroSection.btn1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Default: Take My Full Class"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 Text</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn2 || ''}
                  onChange={(e) => updatePageData('heroSection.btn2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Default: Pass My Exam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 1 URL</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn1Url || ''}
                  onChange={(e) => updatePageData('heroSection.btn1Url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., /contact-us or https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button 2 URL</label>
                <input
                  type="text"
                  value={pageData.heroSection?.btn2Url || ''}
                  onChange={(e) => updatePageData('heroSection.btn2Url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., /contact-us or https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Slider Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Slider Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.whySlider?.mainHeading || ''}
                onChange={(e) => updatePageData('whySlider.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.whySlider?.description || ''}
                onChange={(e) => updatePageData('whySlider.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.whySlider?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('whySlider.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Slider Items (cards in the scrolling rows)</label>
              {(pageData.whySlider?.sliderItems || []).map((item: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Item {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('whySlider.sliderItems', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={item.text || ''}
                      onChange={(e) => updateArrayItem('whySlider.sliderItems', index, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card text (e.g. Highly-Skilled Subject Experts)"
                    />
                    <input
                      type="text"
                      value={item.alt || ''}
                      onChange={(e) => updateArrayItem('whySlider.sliderItems', index, 'alt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Alt text for icon (optional)"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('whySlider.sliderItems', { text: '', alt: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Slider Item
              </button>
            </div>
          </div>
        </div>

        {/* Card Carousel Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Card Carousel Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.cardCarousel?.mainHeading || ''}
                onChange={(e) => updatePageData('cardCarousel.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.cardCarousel?.description || ''}
                onChange={(e) => updatePageData('cardCarousel.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.cardCarousel?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('cardCarousel.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Carousel Cards (slides)</label>
              {(pageData.cardCarousel?.cards || []).map((card: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Card {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('cardCarousel.cards', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateArrayItem('cardCarousel.cards', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card title"
                    />
                    <textarea
                      rows={2}
                      value={card.description || ''}
                      onChange={(e) => updateArrayItem('cardCarousel.cards', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card description"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('cardCarousel.cards', { id: Date.now(), title: '', description: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Carousel Card
              </button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Description Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.description?.mainHeading || ''}
                onChange={(e) => updatePageData('description.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={pageData.description?.description || ''}
                onChange={(e) => updatePageData('description.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Use &lt;br/&gt; for line breaks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.description?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('description.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Badges (comma-separated)</label>
              <input
                type="text"
                value={(pageData.description?.badges || []).join(', ')}
                onChange={(e) => updatePageData('description.badges', e.target.value.split(',').map((b: string) => b.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Badge 1, Badge 2, Badge 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Services</label>
              {(pageData.description?.services || []).map((service: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Service {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('description.services', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={service.title || ''}
                      onChange={(e) => updateArrayItem('description.services', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Service Title"
                    />
                    <textarea
                      rows={2}
                      value={service.description || ''}
                      onChange={(e) => updateArrayItem('description.services', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Service Description"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('description.services', { title: '', description: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Service
              </button>
            </div>
          </div>
        </div>

        {/* Guaranteed Block Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Guaranteed Block Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.guaranteedBlock?.mainHeading || ''}
                onChange={(e) => updatePageData('guaranteedBlock.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.guaranteedBlock?.description || ''}
                onChange={(e) => updatePageData('guaranteedBlock.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.guaranteedBlock?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('guaranteedBlock.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Process Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.processSection?.mainHeading || ''}
                onChange={(e) => updatePageData('processSection.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.processSection?.description || ''}
                onChange={(e) => updatePageData('processSection.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Process Steps</label>
              {(pageData.processSection?.steps || []).map((step: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Step {step.stepNumber || index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('processSection.steps', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="number"
                      value={step.stepNumber || index + 1}
                      onChange={(e) => updateArrayItem('processSection.steps', index, 'stepNumber', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Step Number"
                    />
                    <textarea
                      rows={2}
                      value={step.title || ''}
                      onChange={(e) => updateArrayItem('processSection.steps', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Step Title (use &lt;br/&gt; for line breaks)"
                    />
                    <textarea
                      rows={2}
                      value={step.description || ''}
                      onChange={(e) => updateArrayItem('processSection.steps', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Step Description"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('processSection.steps', { stepNumber: (pageData.processSection?.steps?.length || 0) + 1, title: '', description: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Step
              </button>
            </div>
          </div>
        </div>

        {/* Success Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Success Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.success?.mainHeading || ''}
                onChange={(e) => updatePageData('success.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.success?.description || ''}
                onChange={(e) => updatePageData('success.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.success?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('success.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Success Slides</label>
              {(pageData.success?.slides || []).map((slide: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Slide {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('success.slides', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={slide.image || ''}
                      onChange={(e) => updateArrayItem('success.slides', index, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Image Path (e.g., /images/proof-1.webp)"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('success.slides', { id: Date.now(), image: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Slide
              </button>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Final CTA Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading (before highlight)</label>
                <input
                  type="text"
                  value={pageData.finalCta?.textBefore || ''}
                  onChange={(e) => updatePageData('finalCta.textBefore', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Highlighted Text</label>
                <input
                  type="text"
                  value={pageData.finalCta?.highlightedText || ''}
                  onChange={(e) => updatePageData('finalCta.highlightedText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading (after highlight)</label>
                <input
                  type="text"
                  value={pageData.finalCta?.textAfter || ''}
                  onChange={(e) => updatePageData('finalCta.textAfter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.finalCta?.description || ''}
                onChange={(e) => updatePageData('finalCta.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={pageData.finalCta?.buttonText || ''}
                onChange={(e) => updatePageData('finalCta.buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Academic Partners Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Partners Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.academicPartners?.mainHeading || ''}
                onChange={(e) => updatePageData('academicPartners.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.academicPartners?.description || ''}
                onChange={(e) => updatePageData('academicPartners.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.academicPartners?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('academicPartners.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Partner Cards</label>
              {(pageData.academicPartners?.cards || []).map((card: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Card {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('academicPartners.cards', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={card.title || ''}
                      onChange={(e) => updateArrayItem('academicPartners.cards', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card Title"
                    />
                    <textarea
                      rows={2}
                      value={card.description || ''}
                      onChange={(e) => updateArrayItem('academicPartners.cards', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card Description"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('academicPartners.cards', { id: Date.now(), title: '', description: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Card
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Performances / Stats (number, title, subtitle)</label>
              {(pageData.academicPartners?.performances || []).map((perf: { number?: string; title?: string; subtitle?: string }, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Stat {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('academicPartners.performances', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
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
              <button
                type="button"
                onClick={() => addArrayItem('academicPartners.performances', { number: '', title: '', subtitle: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Performance
              </button>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.customerReviews?.mainHeading || ''}
                onChange={(e) => updatePageData('customerReviews.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="How Students Rate Us!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trustpilot Rating Text</label>
              <input
                type="text"
                value={pageData.customerReviews?.trustpilotRating || ''}
                onChange={(e) => updatePageData('customerReviews.trustpilotRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rated 4.6/5 Based on 1000+ Reviews"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Review Cards (card heading + description; leave empty to use default list)</label>
              {(pageData.customerReviews?.reviews || []).map((review: { title?: string; description?: string; image?: string }, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Review {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('customerReviews.reviews', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={review.title || ''}
                      onChange={(e) => updateArrayItem('customerReviews.reviews', index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card heading / title"
                    />
                    <textarea
                      rows={3}
                      value={review.description || ''}
                      onChange={(e) => updateArrayItem('customerReviews.reviews', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Card description"
                    />
                    <input
                      type="text"
                      value={review.image || ''}
                      onChange={(e) => updateArrayItem('customerReviews.reviews', index, 'image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Star image path (e.g. /images/fivestar.svg, optional)"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('customerReviews.reviews', { title: '', description: '', image: '/images/fivestar.svg' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add Review Card
              </button>
            </div>
          </div>
        </div>

        {/* Get Quote Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Get Quote Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.getQuote?.mainHeading || ''}
                onChange={(e) => updatePageData('getQuote.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={3}
                value={pageData.getQuote?.description || ''}
                onChange={(e) => updatePageData('getQuote.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
              <input
                type="text"
                value={pageData.getQuote?.ctaButton?.text || ''}
                onChange={(e) => updatePageData('getQuote.ctaButton.text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">FAQ Section</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={pageData.faq?.mainHeading || ''}
                onChange={(e) => updatePageData('faq.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">FAQ Items</label>
              {(pageData.faq?.faqs || []).map((faq: any, index: number) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">FAQ {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('faq.faqs', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => updateArrayItem('faq.faqs', index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Question"
                    />
                    <textarea
                      rows={3}
                      value={faq.answer || ''}
                      onChange={(e) => updateArrayItem('faq.faqs', index, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Answer"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('faq.faqs', { id: Date.now(), question: '', answer: '' })}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                + Add FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={pageLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#283c88] hover:bg-[#283c88] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pageLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage {pageLabel} Page Content</h1>
        <p className="mt-2 text-sm text-gray-600">Edit the {pageLabel} page content</p>
      </div>

      {pageLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!pageLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Editing:</strong> {pageLabel} Page
          </p>
        </div>
      )}

      {pageData && !pageLoading && renderPageForm()}
    </div>
  );
}

