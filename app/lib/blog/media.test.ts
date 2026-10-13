import { afterEach, describe, expect, it, vi } from "vitest";

const env = {
  AUTH_API_BASE_URL: "https://api.example.test/v1",
  ADMIN_INTERNAL_API_KEY: "internal-key",
};
const originalEnv = {
  AUTH_API_BASE_URL: process.env.AUTH_API_BASE_URL,
  ADMIN_INTERNAL_API_KEY: process.env.ADMIN_INTERNAL_API_KEY,
};

describe("blog media backend client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("reads the account namespace from the protected backend endpoint", async () => {
    Object.assign(process.env, env);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: { namespace: "blog-cloud|scholarlyhelp/blog" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const { blogMediaAssetNamespace } = await import("./media");

    await expect(blogMediaAssetNamespace()).resolves.toBe("blog-cloud|scholarlyhelp/blog");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/v1/admin/blog/media/config",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const headers = fetchMock.mock.calls[0][1]?.headers as Headers;
    expect(headers.get("x-internal-api-key")).toBe("internal-key");
  });

  it("sends image bytes to the backend instead of Cloudinary", async () => {
    Object.assign(process.env, env);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ data: { url: "https://cdn.example/blog.png", width: 1200, height: 630 } }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const { uploadBlogImage } = await import("./media");

    await expect(
      uploadBlogImage(Buffer.from("image"), { contentType: "image/png", fileName: "blog.png" }),
    ).resolves.toEqual({ url: "https://cdn.example/blog.png", width: 1200, height: 630 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.example.test/v1/admin/blog/media/upload");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);
  });

  it("fails closed when the internal backend configuration is missing", async () => {
    delete process.env.AUTH_API_BASE_URL;
    delete process.env.ADMIN_INTERNAL_API_KEY;
    const { uploadBlogImage } = await import("./media");
    await expect(uploadBlogImage(Buffer.from("image"))).rejects.toThrow(
      "Blog media backend is not configured",
    );
  });
});
