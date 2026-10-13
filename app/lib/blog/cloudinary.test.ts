import { describe, expect, it } from "vitest";
import { blogCloudinaryAssetNamespace, blogCloudinaryCredentials, blogImageFolder } from "./cloudinary";

describe("blog Cloudinary configuration", () => {
  it("uses the dedicated blog credentials", () => {
    expect(
      blogCloudinaryCredentials({
        BLOG_CLOUDINARY_CLOUD_NAME: "blog-cloud",
        BLOG_CLOUDINARY_API_KEY: "blog-key",
        BLOG_CLOUDINARY_API_SECRET: "blog-secret",
        CLOUDINARY_CLOUD_NAME: "shared-cloud",
        CLOUDINARY_API_KEY: "shared-key",
        CLOUDINARY_API_SECRET: "shared-secret",
      }),
    ).toEqual({ cloud_name: "blog-cloud", api_key: "blog-key", api_secret: "blog-secret" });
  });

  it("does not fall back to the application's shared credentials", () => {
    expect(() =>
      blogCloudinaryCredentials({
        CLOUDINARY_CLOUD_NAME: "shared-cloud",
        CLOUDINARY_API_KEY: "shared-key",
        CLOUDINARY_API_SECRET: "shared-secret",
      }),
    ).toThrow(/Missing blog Cloudinary credentials/);
  });

  it("reports an incomplete blog credential set", () => {
    expect(() =>
      blogCloudinaryCredentials({
        BLOG_CLOUDINARY_CLOUD_NAME: "blog-cloud",
        BLOG_CLOUDINARY_API_KEY: "blog-key",
      }),
    ).toThrow(/api_secret/);
  });

  it("uses separate development and production folders", () => {
    expect(blogImageFolder({ BLOG_CLOUDINARY_FOLDER: "scholarlyhelp/blog-dev" })).toBe("scholarlyhelp/blog-dev");
    expect(blogImageFolder({})).toBe("scholarlyhelp/blog");
  });

  it("separates migration reuse records by account and folder", () => {
    expect(
      blogCloudinaryAssetNamespace({
        BLOG_CLOUDINARY_CLOUD_NAME: "dedicated-blog-cloud",
        BLOG_CLOUDINARY_API_KEY: "key",
        BLOG_CLOUDINARY_API_SECRET: "secret",
        BLOG_CLOUDINARY_FOLDER: "scholarlyhelp/blog-dev",
      }),
    ).toBe("dedicated-blog-cloud|scholarlyhelp/blog-dev");
  });
});
