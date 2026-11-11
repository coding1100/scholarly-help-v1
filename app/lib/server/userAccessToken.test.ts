import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bearerToken, verifyUserAccessToken } from "./userAccessToken";

const fetchMock = vi.fn();

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe("verifyUserAccessToken", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("AUTH_API_BASE_URL", "https://api.example.test/");
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the user from the backend's { success, data } envelope", async () => {
    respond(200, {
      success: true,
      message: "Success",
      data: { valid: true, user: { user_id: "u-1", email: " Ada@Example.com ", name: "Ada" } },
    });
    await expect(verifyUserAccessToken("token-1")).resolves.toEqual({
      userId: "u-1",
      email: "ada@example.com",
      name: "Ada",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.test/auth/verify-token",
      expect.objectContaining({ headers: { Authorization: "Bearer token-1" } }),
    );
  });

  it("returns null when the backend rejects the token", async () => {
    respond(401, { success: false, message: "Invalid or expired token" });
    await expect(verifyUserAccessToken("bad")).resolves.toBeNull();
  });

  it("returns null when the token is not marked valid", async () => {
    respond(200, { success: true, data: { valid: false, user: { user_id: "u-1" } } });
    await expect(verifyUserAccessToken("token")).resolves.toBeNull();
  });

  it("returns null when the backend is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("connect ECONNREFUSED"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(verifyUserAccessToken("token")).resolves.toBeNull();
  });
});

describe("bearerToken", () => {
  it("extracts a bearer token and ignores other schemes", () => {
    const withBearer = new Request("http://x", { headers: { authorization: "Bearer abc" } });
    const withBasic = new Request("http://x", { headers: { authorization: "Basic abc" } });
    expect(bearerToken(withBearer)).toBe("abc");
    expect(bearerToken(withBasic)).toBeNull();
    expect(bearerToken(new Request("http://x"))).toBeNull();
  });
});
