import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionRole } from "@/app/lib/server/adminSession";
import { getMongoDatabase } from "@/app/lib/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAuthApiBaseUrl(): string {
  return String(
    process.env.AUTH_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_NGROX_URL ||
      "",
  ).replace(/\/$/, "");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  // Deleting a user is destructive and out of scope for report_admin, a
  // reporting-only role — only a full admin session may do this.
  const role = getAdminSessionRole(request);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = params.userId;
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const apiBase = getAuthApiBaseUrl();
  const internalApiKey = process.env.ADMIN_INTERNAL_API_KEY;
  if (!apiBase || !internalApiKey) {
    return NextResponse.json(
      { error: "Admin user deletion is not configured" },
      { status: 503 },
    );
  }

  const confirmActiveSubscription =
    request.nextUrl.searchParams.get("confirmActiveSubscription") === "true";

  try {
    const backendUrl = new URL(`${apiBase}/admin/users/${encodeURIComponent(userId)}`);
    if (confirmActiveSubscription) {
      backendUrl.searchParams.set("confirmActiveSubscription", "true");
    }

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: { "x-internal-api-key": internalApiKey },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}) as any);

    if (response.status === 409 && payload?.code === "ACTIVE_SUBSCRIPTION") {
      return NextResponse.json(
        {
          error: "ACTIVE_SUBSCRIPTION",
          message:
            payload?.message ||
            "This user has an active subscription. Confirm to delete anyway.",
        },
        { status: 409 },
      );
    }

    if (response.status === 404) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!response.ok) {
      console.error("Admin user deletion failed:", response.status, payload);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 502 });
    }

    // The backend has no knowledge of tool_usage_events — it's written
    // directly by this frontend (see /api/tool-usage/track) into its own
    // Mongo connection, not one of the backend's Mongoose collections. A
    // successful backend delete leaves these rows behind unless purged here,
    // which is why a deleted user kept reappearing in the admin report.
    // Best-effort: never fail the delete response over this cleanup step.
    try {
      const db = await getMongoDatabase(process.env.TOOL_USAGE_DATABASE_NAME || "scholarly_help");
      await db?.collection("tool_usage_events").deleteMany({ userId });
    } catch (error) {
      console.error("Failed to purge tool_usage_events for deleted user:", error);
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Admin user deletion request failed:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 502 });
  }
}
