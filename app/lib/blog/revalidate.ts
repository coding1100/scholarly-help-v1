import { revalidatePath } from "next/cache";

/**
 * Refreshes every cached blog page after an admin change. Posts link to each
 * other (related, recent, archives), so the whole /blog tree is revalidated.
 */
export function revalidateBlog() {
  try {
    revalidatePath("/blog", "layout");
    revalidatePath("/blog-sitemap.xml");
  } catch (error) {
    console.error("Blog revalidation failed:", error);
  }
}
