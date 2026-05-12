import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
/** Default sub-account from product settings; override with `GHL_LOCATION_ID`. */
const DEFAULT_LOCATION_ID = "PrmJ3qseVQyutkMwBUm7";

/** Long-text custom field value limit (stay under typical GHL caps). */
const MAX_CUSTOM_FIELD_VALUE_CHARS = 24_000;
/** Contact note body limit (conservative). */
const MAX_NOTE_BODY_CHARS = 100_000;
/** Reject snapshot payloads larger than this serialized size. */
const MAX_SNAPSHOT_JSON_CHARS = 450_000;

/** Official scope ↔ endpoint mapping (Private Integration must include these when used). */
const GHL_SCOPES_DOC =
  "https://marketplace.gohighlevel.com/docs/Authorization/Scopes/index.html";

type CgpaGhlBody = {
  email?: string;
  cgpa?: string;
  /** Full calculator state + computed totals from the client. */
  snapshot?: unknown;
};

let cachedCgpaField: { id: string; key: string } | null = null;
let cachedSnapshotField: { id: string; key: string } | null = null;

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

function pickCgpaField(
  rows: CustomFieldRow[],
): { id: string; key: string } | null {
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

function pickSnapshotField(
  rows: CustomFieldRow[],
  excludeFieldId: string,
): { id: string; key: string } | null {
  const flat = flattenCustomFieldRows(rows);
  for (const f of flat) {
    const id = (f.id || "").trim();
    if (!id || id === excludeFieldId) continue;
    const fkRaw = (f.fieldKey || f.key || "").trim();
    const fk = fkRaw.toLowerCase();
    const name = (f.name || "").trim().toLowerCase();
    const combined = `${name} ${fk}`;
    const matches =
      combined.includes("snapshot") ||
      combined.includes("submission") ||
      (combined.includes("calculator") &&
        (combined.includes("cgpa") || combined.includes("gpa"))) ||
      (combined.includes("cgpa") &&
        (combined.includes("data") ||
          combined.includes("json") ||
          combined.includes("detail") ||
          combined.includes("export"))) ||
      fk.includes("cgpa_tool") ||
      fk.includes("gpa_calculator");
    if (matches) {
      const key = fkRaw || "cgpa_calculator_snapshot";
      return { id, key };
    }
  }
  return null;
}

function truncateForStorage(
  text: string,
  max: number,
): { text: string; truncated: boolean } {
  if (text.length <= max) return { text, truncated: false };
  const marker = "\n\n[truncated]";
  const cut = Math.max(0, max - marker.length);
  return { text: text.slice(0, cut) + marker, truncated: true };
}

function extractContactIdFromUpsert(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.contactId === "string" && o.contactId.trim()) {
    return o.contactId.trim();
  }
  const c = o.contact;
  if (c && typeof c === "object") {
    const id = (c as Record<string, unknown>).id;
    if (typeof id === "string" && id.trim()) return id.trim();
  }
  return null;
}

async function postContactNote(
  token: string,
  contactId: string,
  title: string,
  body: string,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(
    `${GHL_API}/contacts/${encodeURIComponent(contactId)}/notes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Version: GHL_VERSION,
      },
      body: JSON.stringify({ title, body }),
    },
  );
  return { ok: res.ok, status: res.status };
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

/**
 * Optional long-text custom field for JSON snapshot. Set `GHL_CGPA_SNAPSHOT_CUSTOM_FIELD_ID`
 * to skip auto-detection (same pattern as CGPA field). If not configured and not auto-found,
 * the route stores the snapshot as a **Contact Note** after upsert (requires `contacts.write`).
 */
async function resolveSnapshotCustomField(
  token: string,
  locationId: string,
  excludeFieldId: string,
): Promise<{ ok: true; field: { id: string; key: string } } | { ok: false }> {
  const fromEnv = process.env.GHL_CGPA_SNAPSHOT_CUSTOM_FIELD_ID?.trim();
  if (fromEnv) {
    const key =
      (
        process.env.GHL_CGPA_SNAPSHOT_FIELD_KEY || "cgpa_calculator_snapshot"
      ).trim() || "cgpa_calculator_snapshot";
    return { ok: true, field: { id: fromEnv, key } };
  }

  if (cachedSnapshotField) return { ok: true, field: cachedSnapshotField };

  const attempts: Array<"contact" | "all" | undefined> = [
    "contact",
    "all",
    undefined,
  ];
  for (const model of attempts) {
    const r = await fetchLocationCustomFields(token, locationId, model);
    if (!r.ok) continue;
    const found = pickSnapshotField(r.rows, excludeFieldId);
    if (found) {
      cachedSnapshotField = found;
      return { ok: true, field: found };
    }
  }
  return { ok: false };
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

    console.log("[/api/cgpa-ghl] payload:", body);

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

    let snapshotJson: string | null = null;
    if (body.snapshot !== undefined && body.snapshot !== null) {
      if (typeof body.snapshot !== "object" || Array.isArray(body.snapshot)) {
        return NextResponse.json(
          { success: false, message: "snapshot must be a JSON object" },
          { status: 400 },
        );
      }
      try {
        snapshotJson = JSON.stringify(body.snapshot);
      } catch {
        return NextResponse.json(
          { success: false, message: "snapshot could not be serialized" },
          { status: 400 },
        );
      }
      if (snapshotJson.length > MAX_SNAPSHOT_JSON_CHARS) {
        return NextResponse.json(
          { success: false, message: "snapshot payload is too large" },
          { status: 400 },
        );
      }
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

    const customFields: Array<{
      id: string;
      key: string;
      field_value: string;
    }> = [
      {
        id: field.id,
        key: field.key,
        field_value: cgpa,
      },
    ];

    let snapshotResolved:
      | { ok: true; field: { id: string; key: string } }
      | {
          ok: false;
        } = { ok: false };
    let snapshotForCustomField: { text: string; truncated: boolean } | null =
      null;

    if (snapshotJson) {
      snapshotResolved = await resolveSnapshotCustomField(
        token,
        locationId,
        field.id,
      );
      if (snapshotResolved.ok) {
        snapshotForCustomField = truncateForStorage(
          snapshotJson,
          MAX_CUSTOM_FIELD_VALUE_CHARS,
        );
        customFields.push({
          id: snapshotResolved.field.id,
          key: snapshotResolved.field.key,
          field_value: snapshotForCustomField.text,
        });
      }
    }

    const upsertPayload = {
      locationId,
      email,
      source: "CGPA Calculator",
      customFields,
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
    let ghlJson: unknown = {};
    try {
      ghlJson = ghlRaw ? JSON.parse(ghlRaw) : {};
    } catch {
      ghlJson = {};
    }

    const ghlErrorMessage =
      ghlJson &&
      typeof ghlJson === "object" &&
      typeof (ghlJson as { message?: unknown }).message === "string"
        ? (ghlJson as { message: string }).message
        : undefined;

    if (!ghlRes.ok) {
      console.error("GHL upsert failed:", ghlRes.status, ghlRaw.slice(0, 800));
      return NextResponse.json(
        {
          success: false,
          message: ghlErrorMessage || "GoHighLevel request failed",
        },
        { status: 502 },
      );
    }

    const contactId = extractContactIdFromUpsert(ghlJson);

    if (snapshotJson) {
      const needNote =
        !snapshotResolved.ok || Boolean(snapshotForCustomField?.truncated);
      if (needNote) {
        if (contactId) {
          const noteBody = truncateForStorage(
            snapshotJson,
            MAX_NOTE_BODY_CHARS,
          ).text;
          const noteRes = await postContactNote(
            token,
            contactId,
            "CGPA Calculator — full submission",
            noteBody,
          );
          if (!noteRes.ok) {
            console.error(
              "GHL create note failed:",
              noteRes.status,
              "snapshotCustomField:",
              snapshotResolved.ok,
            );
          }
        } else {
          console.warn(
            "cgpa-ghl: snapshot not saved as note (no contact id in upsert response)",
          );
        }
      }
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
