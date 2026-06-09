"use client";

import { useAdminConfirm } from "@/app/components/Admin/AdminConfirmProvider";
import { useState, useEffect } from "react";
import AdminPageHeader from "@/app/components/Admin/AdminPageHeader";
import AdminButton from "@/app/components/Admin/AdminButton";

interface Page {
  id?: number;
  category: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  status: string;
}

export default function PagesAdmin() {
  const { confirmDelete } = useAdminConfirm();

  const [pages, setPages] = useState<Page[]>([]);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const res = await fetch('/api/admin/pages');
    const data = await res.json();
    setPages(data);
  };

  const handleSave = async (page: Page) => {
    setLoading(true);
    await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page),
    });
    setLoading(false);
    setEditingPage(null);
    fetchPages();
  };

  const handleDelete = async (page: Page) => {
    if (
      !(await confirmDelete({
        variant: "delete",
        message: `Are you sure you want to delete "${page.title}"? This action cannot be undone.`,
      }))
    ) {
      return;
    }
    await fetch(`/api/admin/pages?id=${page.id}`, { method: "DELETE" });
    fetchPages();
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader title="Manage Pages" />

      <AdminButton type="button" variant="primary" className="mb-4" onClick={() => setEditingPage({ category: '', title: '', slug: '', content: '', meta_title: '', meta_description: '', status: 'published' })}>Add New Page</AdminButton>

      <div className="space-y-4">
        {pages.map((page) => (
          <div key={page.id} className="border p-4 rounded">
            <h3 className="text-lg font-semibold">{page.title}</h3>
            <p>Category: {page.category}, Slug: {page.slug}</p>
            <AdminButton type="button" variant="edit" onClick={() => setEditingPage(page)} className="mr-2">Edit</AdminButton>
            <AdminButton type="button" variant="deleteSm" onClick={() => void handleDelete(page)}>Delete</AdminButton>
          </div>
        ))}
      </div>

      {editingPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded max-w-lg w-full">
            <h2 className="text-xl mb-4">{editingPage.id ? 'Edit Page' : 'Add Page'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(editingPage); }}>
              <input
                type="text"
                placeholder="Category"
                value={editingPage.category}
                onChange={(e) => setEditingPage({ ...editingPage, category: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Title"
                value={editingPage.title}
                onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Slug"
                value={editingPage.slug}
                onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
                required
              />
              <textarea
                placeholder="Content (HTML)"
                value={editingPage.content}
                onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
                rows={4}
              />
              <input
                type="text"
                placeholder="Meta Title"
                value={editingPage.meta_title}
                onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Meta Description"
                value={editingPage.meta_description}
                onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
              />
              <select
                value={editingPage.status}
                onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <AdminButton type="submit" variant="primary" disabled={loading} loading={loading}>{loading ? "Saving..." : "Save"}</AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setEditingPage(null)} className="ml-2">Cancel</AdminButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}