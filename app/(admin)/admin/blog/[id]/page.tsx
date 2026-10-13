"use client";

import { use } from "react";
import PostEditor from "@/app/components/Admin/Blog/PostEditor";

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PostEditor key={id} postId={id} />;
}
