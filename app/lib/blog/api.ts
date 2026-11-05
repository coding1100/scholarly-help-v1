import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { getBlogCollections, type BlogCollections } from "./db";
import { ValidationError } from "./validate";

/** Runs a blog API handler with a DB handle and uniform error responses. */
export async function withBlogDb(
  handler: (c: BlogCollections) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const c = await getBlogCollections();
    if (!c) return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    return await handler(c);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json({ error: "That slug is already in use" }, { status: 409 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.error("Blog API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });
