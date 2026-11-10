import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const insertOne = vi.fn();
const verifyUserAccessToken = vi.fn();

vi.mock("@/app/lib/mongodb", () => ({
  getMongoDatabase: async () => ({
    collection: () => ({ insertOne, createIndex: async () => "ok" }),
  }),
}));

vi.mock("@/app/lib/server/userAccessToken", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/app/lib/server/userAccessToken")>()),
  verifyUserAccessToken: (token: string) => verifyUserAccessToken(token),
}));

const geoLookup = vi.fn();
vi.stubGlobal("fetch", geoLookup);

let ipCounter = 0;

function track(body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return new NextRequest("http://localhost/api/tool-usage/track", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-real-ip": `198.51.100.${ipCounter}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function storedEvent() {
  expect(insertOne).toHaveBeenCalledTimes(1);
  return insertOne.mock.calls[0][0];
}

describe("POST /api/tool-usage/track", () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.resetModules();
    insertOne.mockReset();
    verifyUserAccessToken.mockReset().mockResolvedValue(null);
    geoLookup.mockReset().mockImplementation(async () =>
      new Response(JSON.stringify({ country_name: "Finland", region: "Uusimaa", city: "Helsinki" })),
    );
    ({ POST } = await import("./route"));
  });

  it("rejects a toolName that is not a known tool", async () => {
    const response = await POST(track({ toolName: "(select 198766*667891)" }));
    expect(response.status).toBe(400);
    expect(insertOne).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON without a server error", async () => {
    const response = await POST(track("not json"));
    expect(response.status).toBe(400);
  });

  it("records a known tool as a guest event", async () => {
    const response = await POST(
      track({ toolName: "Paraphraser Tool", anonymousId: "0f1e2d3c-aaaa-bbbb-cccc-111122223333" }),
    );
    expect(response.status).toBe(200);
    expect(await storedEvent()).toMatchObject({
      toolName: "Paraphraser Tool",
      userType: "guest",
      userKey: "anon:0f1e2d3c-aaaa-bbbb-cccc-111122223333",
    });
  });

  it("ignores identity fields in the body when there is no valid token", async () => {
    await POST(
      track(
        {
          toolName: "Paraphraser Tool",
          userId: "victim-user-id",
          userEmail: "victim@example.com",
          userName: "Victim",
        },
        { authorization: "Bearer forged" },
      ),
    );
    expect(verifyUserAccessToken).toHaveBeenCalledWith("forged");
    const event = await storedEvent();
    expect(event.userType).toBe("guest");
    expect(event.userId).toBeUndefined();
    expect(event.userEmail).toBeUndefined();
    expect(event.userName).toBeUndefined();
  });

  it("does not count a guest_ id in userId as a registered user", async () => {
    await POST(track({ toolName: "Paraphraser Tool", userId: "guest_e0875l8tuztmw9yracs" }));
    const event = await storedEvent();
    expect(event.userType).toBe("guest");
    expect(event.userId).toBeUndefined();
  });

  it("takes a registered identity from the verified token", async () => {
    verifyUserAccessToken.mockResolvedValue({
      userId: "real-user-123",
      email: "real@example.com",
      name: "Real User",
    });
    await POST(
      track(
        { toolName: "Essay Grader", userId: "someone-else", anonymousId: "0f1e2d3c-aaaa-bbbb-cccc-111122223333" },
        { authorization: "Bearer good-token" },
      ),
    );
    expect(await storedEvent()).toMatchObject({
      userType: "registered",
      userKey: "user:real-user-123",
      userId: "real-user-123",
      userEmail: "real@example.com",
      userName: "Real User",
      anonymousId: undefined,
    });
  });

  it("drops an anonymousId that is not in the client's id format", async () => {
    await POST(track({ toolName: "Essay Grader", anonymousId: '=HYPERLINK("http://evil","x")' }));
    const event = await storedEvent();
    expect(event.anonymousId).toBeUndefined();
    expect(event.userKey).toBe("unknown");
  });

  it("drops an action that is not a plain identifier", async () => {
    await POST(track({ toolName: "AI Tutor", action: "../../etc/shells" }));
    expect((await storedEvent()).action).toBe("generate");
  });

  it("ignores client-sent geo headers and uses the server-side lookup", async () => {
    await POST(
      track(
        { toolName: "Summarizer Tool" },
        { "x-country": "Spoofland", "x-city": "Fake City", "cf-ipcountry": "XX", "x-vercel-ip-city": "Nowhere" },
      ),
    );
    expect(await storedEvent()).toMatchObject({
      country: "Finland",
      region: "Uusimaa",
      city: "Helsinki",
    });
  });

  it("rate limits a single client after 120 events in the window", async () => {
    const statuses: number[] = [];
    for (let index = 0; index < 125; index += 1) {
      const request = track({ toolName: "Main Tool" }, { "x-real-ip": "203.0.113.50" });
      statuses.push((await POST(request)).status);
    }
    expect(statuses.filter((status) => status === 200)).toHaveLength(120);
    expect(statuses.slice(120)).toEqual([429, 429, 429, 429, 429]);

    const otherClient = await POST(track({ toolName: "Main Tool" }, { "x-real-ip": "203.0.113.51" }));
    expect(otherClient.status).toBe(200);
  });
});
