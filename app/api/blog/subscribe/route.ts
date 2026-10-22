import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { withBlogDb } from "@/app/lib/blog/api";
import { clientIpHash, EMAIL_RE, looksAutomated } from "@/app/lib/blog/spam";

export const dynamic = "force-dynamic";

// POST { email, website (honeypot), startedAt } -> newsletter sign-up
export async function POST(request: NextRequest) {
  return withBlogDb(async (c) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (looksAutomated(body, 1)) return NextResponse.json({ ok: true });

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    const ipHash = clientIpHash(request);
    const recent = await c.subscribers.countDocuments({
      ipHash,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    });
    if (recent >= 5) {
      return NextResponse.json({ error: "Too many sign-ups. Please try again later." }, { status: 429 });
    }
    // Re-subscribing an existing email is a silent success.
    await c.subscribers.updateOne(
      { email },
      { $setOnInsert: { _id: randomUUID(), email, ipHash, createdAt: new Date().toISOString() } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  });
}
