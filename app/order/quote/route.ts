// Disabled: every quote form posts to the backend API's /order/quote
// (NEXT_PUBLIC_API_URL), so nothing calls this copy. It wrote visitor input
// into Google Sheets and a staff email unescaped, and accepted public file
// uploads to Cloudinary. To restore it, uncomment the handler below.
//
// import { NextRequest } from "next/server";
// import { handleOrderQuotePost } from "@/app/server/orderQuote/handler";
//
// export const runtime = "nodejs";
//
// // Keeps the base URL exactly: POST /order/quote
// export async function POST(request: NextRequest) {
//   return handleOrderQuotePost(request);
// }

export {};
