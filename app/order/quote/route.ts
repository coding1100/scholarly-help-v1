import { NextRequest } from "next/server";
import { handleOrderQuotePost } from "@/app/server/orderQuote/handler";

export const runtime = "nodejs";

// Keeps the base URL exactly: POST /order/quote
export async function POST(request: NextRequest) {
  return handleOrderQuotePost(request);
}

