type BlogMediaEnv = Record<string, string | undefined>;

function backendConfig(env: BlogMediaEnv = process.env) {
  const apiBase = String(
    env.AUTH_API_BASE_URL || env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_NGROX_URL || "",
  ).replace(/\/$/, "");
  const internalApiKey = env.ADMIN_INTERNAL_API_KEY?.trim();
  if (!apiBase || !internalApiKey) {
    throw new Error("Blog media backend is not configured");
  }
  return { apiBase, internalApiKey };
}

async function backendJson(path: string, init: RequestInit = {}) {
  const { apiBase, internalApiKey } = backendConfig();
  const headers = new Headers(init.headers);
  headers.set("x-internal-api-key", internalApiKey);
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Blog media backend request failed");
  }
  return payload?.data ?? payload;
}

let namespaceRequest: Promise<string> | null = null;

/** Non-secret account/folder identity used to scope migration image reuse records. */
export function blogMediaAssetNamespace(): Promise<string> {
  if (!namespaceRequest) {
    namespaceRequest = backendJson("/admin/blog/media/config")
      .then((data) => {
        if (!data?.namespace) throw new Error("Blog media backend returned no namespace");
        return String(data.namespace);
      })
      .catch((error) => {
        namespaceRequest = null;
        throw error;
      });
  }
  return namespaceRequest;
}

export async function uploadBlogImage(
  source: Buffer | string,
  options: { contentType?: string; fileName?: string; publicId?: string } = {},
): Promise<{ url: string; width: number; height: number }> {
  let bytes: Buffer;
  let contentType = options.contentType;
  let fileName = options.fileName;

  if (typeof source === "string") {
    const response = await fetch(source, { headers: { "User-Agent": "ScholarlyHelp-blog-migration/1.0" } });
    if (!response.ok) throw new Error(`Unable to fetch blog image (${response.status})`);
    bytes = Buffer.from(await response.arrayBuffer());
    contentType ||= response.headers.get("content-type")?.split(";")[0] || "application/octet-stream";
    fileName ||= new URL(source).pathname.split("/").pop() || "blog-image";
  } else {
    bytes = source;
  }

  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(bytes)], { type: contentType || "application/octet-stream" }),
    fileName || "blog-image",
  );
  if (options.publicId) form.append("publicId", options.publicId);
  const data = await backendJson("/admin/blog/media/upload", { method: "POST", body: form });
  if (!data?.url) throw new Error("Blog media backend returned no image URL");
  return { url: String(data.url), width: Number(data.width || 0), height: Number(data.height || 0) };
}
