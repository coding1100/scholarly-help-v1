"use client";

import { useState, useEffect } from "react";

export default function OnlineClassAdmin() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    fetch('/api/admin/online-class')
      .then(res => res.json())
      .then(data => setContent(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/admin/online-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      // Show success message
      alert('Content saved successfully!');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Online Class Content</h1>
        <p className="mt-2 text-sm text-gray-600">Manage the content displayed on the online class page</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'hero', name: 'Hero Section', icon: '📄' },
            { id: 'academic', name: 'Academic Content', icon: '🎓' },
            { id: 'whyScholarly', name: 'Why Scholarly', icon: '⭐' },
            { id: 'excellenceProof', name: 'Excellence Proof', icon: '🏆' },
            { id: 'subjects', name: 'Subjects', icon: '📚' },
            { id: 'faq', name: 'FAQ', icon: '❓' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-100 text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        {activeTab === 'hero' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Hero Section</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                <input
                  type="text"
                  value={content.btnText || ''}
                  onChange={(e) => updateContent('btnText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Take my online class"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
                <input
                  type="text"
                  value={content.heroContent?.mainHeading || ''}
                  onChange={(e) => updateContent('heroContent.mainHeading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter main heading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={content.heroContent?.description || ''}
                  onChange={(e) => updateContent('heroContent.description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter hero description"
                />
              </div>
            </div>
          </div>
        )}

        {/* Academic Content */}
        {activeTab === 'academic' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Academic Content</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
                <input
                  type="text"
                  value={content.academic?.mainheading || ''}
                  onChange={(e) => updateContent('academic.mainheading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Description</label>
                <textarea
                  rows={3}
                  value={content.academic?.mainDescription || ''}
                  onChange={(e) => updateContent('academic.mainDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Why Scholarly */}
        {activeTab === 'whyScholarly' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Scholarly Section</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
                <input
                  type="text"
                  value={content.whyScholarly?.mainHeading || ''}
                  onChange={(e) => updateContent('whyScholarly.mainHeading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Description</label>
                <textarea
                  rows={3}
                  value={content.whyScholarly?.mainDescription || ''}
                  onChange={(e) => updateContent('whyScholarly.mainDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Excellence Proof */}
        {activeTab === 'excellenceProof' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Excellence Proof Section</h2>
            <p className="text-sm text-gray-600">Excellence proof images are managed through the excellenceProofContent array in the data file.</p>
          </div>
        )}

        {/* Subjects */}
        {activeTab === 'subjects' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subjects Section</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading</label>
              <input
                type="text"
                value={content.subjects?.mainHeading || ''}
                onChange={(e) => updateContent('subjects.mainHeading', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">FAQ Section</h2>
            <p className="text-sm text-gray-600">FAQ content is managed through the JSON structure. Edit the faqContent array in the data file for detailed FAQ management.</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
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
    </div>
  );
}