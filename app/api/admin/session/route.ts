import { NextResponse } from "next/server";

// Signature/expiry validation is enforced by middleware before this route.
export async function GET() {
  return NextResponse.json({ authenticated: true });
}
