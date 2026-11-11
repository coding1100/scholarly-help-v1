import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const append = vi.fn();
const update = vi.fn();
const get = vi.fn();
const valuesGet = vi.fn();

vi.mock("googleapis", () => ({
  google: {
    auth: { JWT: vi.fn() },
    sheets: () => ({ spreadsheets: { get, values: { append, update, get: valuesGet } } }),
  },
}));

import { POST as cgpaLpSheet } from "./cgpa-lp-sheet/route";
import { POST as smsTracking } from "./sms-tracking/route";
import { POST as tmcLpLandingSheet } from "./tmc-lp-landing-sheet/route";
import { POST as tmcLpSheet } from "./tmc-lp-sheet/route";
import { POST as toolsSheet } from "./toolssheet/route";

const FORMULA = '=IMAGE("https://attacker.example/x.png")';
const LITERAL = `'${FORMULA}`;

function post(body: unknown) {
  return new NextRequest("http://localhost/api/x", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function sentRow(mock: typeof append) {
  expect(mock).toHaveBeenCalledTimes(1);
  const request = mock.mock.calls[0][0];
  expect(request.valueInputOption).toBe("USER_ENTERED");
  return request.requestBody.values[0];
}

beforeEach(() => {
  vi.stubEnv("GOOGLE_CLIENT_TOOL_EMAIL", "tool@example.iam.gserviceaccount.com");
  vi.stubEnv("GOOGLE_PRIVATE_TOOL_KEY", "key");
  vi.stubEnv("GOOGLE_SHEET_TOOL_ID", "sheet-id");
  for (const mock of [append, update, get, valuesGet]) mock.mockReset();
  append.mockResolvedValue({});
  update.mockResolvedValue({});
  get.mockResolvedValue({ data: { sheets: [{ properties: { title: "Tools" } }] } });
  valuesGet.mockResolvedValue({ data: { values: [] } });
});

describe("Google Sheets routes write visitor text as literal text", () => {
  it("toolssheet (append)", async () => {
    const response = await toolsSheet(
      post({ email: FORMULA, userId: FORMULA, fbc: FORMULA, toolUsed: [FORMULA, "Paraphraser Tool"], device: FORMULA, source: FORMULA, phoneNumber: FORMULA, qualified: FORMULA, timestamp: FORMULA }),
    );
    expect(response.status).toBe(200);
    expect(sentRow(append)).toEqual([LITERAL, LITERAL, LITERAL, LITERAL, LITERAL, LITERAL, `${LITERAL}, Paraphraser Tool`, LITERAL, LITERAL]);
  });

  it("toolssheet (update of an existing fbc row)", async () => {
    valuesGet.mockResolvedValue({ data: { values: [["fbc"], [FORMULA]] } });
    await toolsSheet(post({ email: FORMULA, fbc: FORMULA, toolUsed: "Paraphraser Tool", device: "desktop", source: "meta" }));
    expect(append).not.toHaveBeenCalled();
    expect(sentRow(update)).toEqual([expect.any(String), LITERAL, "", LITERAL, "", "", "Paraphraser Tool", "desktop", "meta"]);
  });

  it("sms-tracking", async () => {
    await smsTracking(post({ fbclid: FORMULA, userId: FORMULA, landingPage: FORMULA }));
    expect(sentRow(append)).toEqual([expect.any(String), LITERAL, "", "", "", "Yes", LITERAL, "", LITERAL]);
  });

  it("tmc-lp-landing-sheet", async () => {
    await tmcLpLandingSheet(
      post({ email: FORMULA, phone: "+1 (555) 123-4567", instructions: FORMULA, formType: "full-form", fbclid: FORMULA, gclid: FORMULA, landingPage: "/take-my-class-2/" }),
    );
    expect(sentRow(append)).toEqual([expect.any(String), "/take-my-class-2/", "full-form", LITERAL, "'+1 (555) 123-4567", LITERAL, LITERAL, LITERAL]);
  });

  it("tmc-lp-sheet", async () => {
    await tmcLpSheet(post({ email: "lead@example.com", fbc: FORMULA, landingPage: "/take-my-class/" }));
    expect(sentRow(append)).toEqual([expect.any(String), "lead@example.com", LITERAL, "/take-my-class/"]);
  });

  it("cgpa-lp-sheet", async () => {
    await cgpaLpSheet(post({ email: "lead@example.com", fbc: FORMULA, device: FORMULA }));
    expect(sentRow(append)).toEqual(expect.arrayContaining([LITERAL]));
    expect(sentRow(append)).not.toContain(FORMULA);
  });
});
