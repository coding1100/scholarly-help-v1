import { v2 as cloudinary } from "cloudinary";

type BlogCloudinaryEnv = Record<string, string | undefined>;

/**
 * Blog media intentionally uses separate credentials from the application's
 * existing CLOUDINARY_* integration (order quotes and backend uploads).
 */
export function blogCloudinaryCredentials(env: BlogCloudinaryEnv = process.env) {
  const values = {
    cloud_name: env.BLOG_CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: env.BLOG_CLOUDINARY_API_KEY?.trim(),
    api_secret: env.BLOG_CLOUDINARY_API_SECRET?.trim(),
  };
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(`Missing blog Cloudinary credentials: ${missing.join(", ")}`);
  }
  return values as { cloud_name: string; api_key: string; api_secret: string };
}

/** Blog images live in their own folder; local dev sets BLOG_CLOUDINARY_FOLDER to keep test uploads separate. */
export function blogImageFolder(env: BlogCloudinaryEnv = process.env): string {
  return env.BLOG_CLOUDINARY_FOLDER?.trim() || "scholarlyhelp/blog";
}

export async function uploadBlogImage(
  source: Buffer | string,
  options: { publicId?: string } = {},
): Promise<{ url: string; width: number; height: number }> {
  const uploadOptions = {
    // Per-request credentials avoid mutating Cloudinary's global config, which
    // is also used by the existing order-quote uploader in this process.
    ...blogCloudinaryCredentials(),
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
