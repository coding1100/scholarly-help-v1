import { v2 as cloudinary } from "cloudinary";
import { ensureCloudinaryConfigured } from "@/app/server/orderQuote/deps";

/** Blog images live in their own folder; local dev sets BLOG_CLOUDINARY_FOLDER to keep test uploads separate. */
export function blogImageFolder(): string {
  return process.env.BLOG_CLOUDINARY_FOLDER || "scholarlyhelp/blog";
}

export async function uploadBlogImage(
  source: Buffer | string,
  options: { publicId?: string } = {},
): Promise<{ url: string; width: number; height: number }> {
  ensureCloudinaryConfigured();
  const uploadOptions = {
    folder: blogImageFolder(),
    resource_type: "image" as const,
    ...(options.publicId ? { public_id: options.publicId, overwrite: false, unique_filename: false } : {}),
  };
  const result =
    typeof source === "string"
      ? await cloudinary.uploader.upload(source, uploadOptions)
      : await new Promise<{ secure_url: string; width: number; height: number }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, res) => {
            if (error || !res) return reject(error);
            resolve(res);
          });
          stream.end(source);
        });
  return { url: result.secure_url, width: result.width, height: result.height };
}
