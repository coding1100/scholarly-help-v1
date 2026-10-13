import { NextRequest, NextResponse } from "next/server";
import { uploadBlogImage } from "@/app/lib/blog/media";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// POST multipart/form-data { file } -> { url, width, height }
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP, GIF or AVIF images are allowed" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 8 MB or smaller" }, { status: 400 });
    }
    const image = await uploadBlogImage(Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      fileName: file.name,
    });
    return NextResponse.json(image);
  } catch (error) {
    console.error("Blog image upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
