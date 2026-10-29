import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
/** Default sub-account from product settings; override with `GHL_LOCATION_ID`. */
const DEFAULT_LOCATION_ID = "PrmJ3qseVQyutkMwBUm7";

/** Official scope ↔ endpoint mapping (Private Integration must include these when used). */
const GHL_SCOPES_DOC =
  "https://marketplace.gohighlevel.com/docs/Authorization/Scopes/index.html";

type CgpaGhlBody = {
  email?: string;
  cgpa?: string;
};

let cachedCgpaField: { id: string; key: string } | null = null;

function isPlausibleEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCgpaDisplay(value: string) {
  // Matches client `formatGpaMaybe` for finite numbers (e.g. "3.45").
  return /^\d+\.\d{2}$/.test(value.trim());
}

type CustomFieldRow = {
  id?: string;
  fieldKey?: string;
  key?: string;
  name?: string;
};

function flattenCustomFieldRows(rows: CustomFieldRow[]): CustomFieldRow[] {
  const out: CustomFieldRow[] = [];
  for (const f of rows) {
    const nested = (f as Record<string, unknown>).customFields;
    if (Array.isArray(nested)) {
      out.push(...flattenCustomFieldRows(nested as CustomFieldRow[]));
    } else {
      out.push(f);
    }
  }
  return out;
}

function pickCgpaField(rows: CustomFieldRow[]): { id: string; key: string } | null {
  const flat = flattenCustomFieldRows(rows);
  for (const f of flat) {
    const id = (f.id || "").trim();
    if (!id) continue;
    const fkRaw = (f.fieldKey || f.key || "").trim();
    const fk = fkRaw.toLowerCase();
    const name = (f.name || "").trim().toLowerCase();
    const nameNorm = name.replace(/\s+/g, "");
    const fkTail = fk.includes(".") ? fk.split(".").pop() || fk : fk;
    const matches =
      fk === "cgpa" ||
      fkTail === "cgpa" ||
      fk.endsWith("_cgpa") ||
      name === "cgpa" ||
      nameNorm === "cgpa";
    if (matches) {
      const key = fkRaw || "cgpa";
      return { id, key };
    }
  }
  return null;
}

function extractCustomFieldRows(data: unknown): CustomFieldRow[] {
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.customFields)) return o.customFields as CustomFieldRow[];
  if (Array.isArray(o.data)) return o.data as CustomFieldRow[];
  if (Array.isArray(o.fields)) return o.fields as CustomFieldRow[];
  if (Array.isArray(data)) return data as CustomFieldRow[];
  return [];
}

async function fetchLocationCustomFields(
  token: string,
  locationId: string,
  model: "contact" | "all" | undefined,
): Promise<{
  ok: boolean;
  status: number;
  bodySnippet: string;
  rows: CustomFieldRow[];
  unauthorized: boolean;
}> {
  const url = new URL(
    `${GHL_API}/locations/${encodeURIComponent(locationId)}/customFields`,
  );
  if (model) url.searchParams.set("model", model);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      Version: GHL_VERSION,
    },
  });

  const raw = await res.text();
  let parsed: unknown = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    parsed = {};
  }

  const rows = extractCustomFieldRows(parsed);
  const unauthorized = res.status === 401 || res.status === 403;
  return {
    ok: res.ok,
    status: res.status,
    bodySnippet: raw.slice(0, 280),
    rows,
    unauthorized,
  };
}

async function resolveCgpaCustomField(
  token: string,
  locationId: string,
): Promise<
  | { ok: true; field: { id: string; key: string } }
  | {
      ok: false;
      message: string;
      code?: "GHL_CUSTOM_FIELDS_UNAUTHORIZED" | "GHL_CGPA_FIELD_NOT_FOUND";
    }
> {
  const fromEnv = process.env.GHL_CGPA_CUSTOM_FIELD_ID?.trim();
  if (fromEnv) {
    const key = (process.env.GHL_CGPA_FIELD_KEY || "cgpa").trim() || "cgpa";
    return { ok: true, field: { id: fromEnv, key } };
  }

  if (cachedCgpaField) return { ok: true, field: cachedCgpaField };

  /**
   * Listing fields requires scope **locations/customFields.readonly**
   * (`GET /locations/:locationId/customFields`). See HighLevel Scopes doc.
   * If your Private Integration only has **contacts.write**, set
   * `GHL_CGPA_CUSTOM_FIELD_ID` instead so we never call this endpoint.
   */
  const attempts: Array<"contact" | "all" | undefined> = [
    "contact",
    "all",
    undefined,
  ];
  let lastError = "";
  let listSucceededOnce = false;
  let everyFailureWasUnauthorized = true;

  for (const model of attempts) {
    const r = await fetchLocationCustomFields(token, locationId, model);
    if (!r.ok) {
      lastError = `Listing custom fields failed (HTTP ${r.status}). ${r.bodySnippet}`;
      console.error("GHL customFields list:", model ?? "(no model)", lastError);
      if (!r.unauthorized) everyFailureWasUnauthorized = false;
      continue;
    }

    listSucceededOnce = true;
    everyFailureWasUnauthorized = false;

    const found = pickCgpaField(r.rows);
    if (found) {
      cachedCgpaField = found;
      return { ok: true, field: found };
    }

    lastError = `No CGPA custom field in response (model=${model ?? "default"}, count=${r.rows.length}). Set GHL_CGPA_CUSTOM_FIELD_ID if your field uses an unexpected name/key.`;
  }

  if (!listSucceededOnce && everyFailureWasUnauthorized) {
    return {
      ok: false,
      code: "GHL_CUSTOM_FIELDS_UNAUTHORIZED",
      message: [
        "The token is not allowed to list location custom fields (HTTP 401/403).",
        "Per HighLevel, GET /locations/{locationId}/customFields requires scope: locations/customFields.readonly.",
        `Edit your Private Integration and add that scope, or see: ${GHL_SCOPES_DOC}`,
        "Alternatively, set env GHL_CGPA_CUSTOM_FIELD_ID to your CGPA field’s id (from GHL) so this route skips listing and typically only needs contacts.write for POST /contacts/upsert.",
      ].join(" "),
    };
  }

  return {
    ok: false,
    code: "GHL_CGPA_FIELD_NOT_FOUND",
    message: lastError,
  };
}

export async function POST(request: NextRequest) {
  try {
    const token = process.env.GHL_AUTHORIZATION_TOKEN?.trim();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "GHL is not configured on the server" },
        { status: 500 },
      );
    }

    const locationId = (
      process.env.GHL_LOCATION_ID || DEFAULT_LOCATION_ID
    ).trim();

    let body: CgpaGhlBody;
    try {
      body = (await request.json()) as CgpaGhlBody;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const email = (body.email || "").trim();
    const cgpa = (body.cgpa || "").trim();

    if (!email || !isPlausibleEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 },
      );
    }

    if (!cgpa || !isValidCgpaDisplay(cgpa)) {
      return NextResponse.json(
        { success: false, message: "Valid CGPA value is required" },
        { status: 400 },
      );
    }

    const resolved = await resolveCgpaCustomField(token, locationId);
    if (!resolved.ok) {
      const status =
        resolved.code === "GHL_CUSTOM_FIELDS_UNAUTHORIZED" ? 403 : 500;
      return NextResponse.json(
        {
          success: false,
          code: resolved.code,
          message: `Could not resolve GHL CGPA custom field. ${resolved.message}`,
          scopesDocumentationUrl: GHL_SCOPES_DOC,
        },
        { status },
      );
    }
    const field = resolved.field;

    const upsertPayload = {
      locationId,
      email,
      source: "CGPA Calculator",
      customFields: [
        {
          id: field.id,
          key: field.key,
          field_value: cgpa,
        },
      ],
    };

    const ghlRes = await fetch(`${GHL_API}/contacts/upsert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Version: GHL_VERSION,
      },
      body: JSON.stringify(upsertPayload),
    });

    const ghlRaw = await ghlRes.text();
    let ghlJson: { message?: string } = {};
    try {
      ghlJson = ghlRaw ? JSON.parse(ghlRaw) : {};
    } catch {
      ghlJson = {};
    }

    if (!ghlRes.ok) {
      console.error("GHL upsert failed:", ghlRes.status, ghlRaw.slice(0, 800));
      return NextResponse.json(
        {
          success: false,
          message:
            typeof ghlJson.message === "string"
              ? ghlJson.message
              : "GoHighLevel request failed",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, message: "Synced to GHL" });
  } catch (e) {
    console.error("cgpa-ghl route error:", e);
    return NextResponse.json(
      { success: false, message: "Unexpected server error" },
      { status: 500 },
    );
  }
}
