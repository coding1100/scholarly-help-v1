import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let ipCounter = 0;
const uniqueIp = () => `198.51.100.${(ipCounter += 1)}`;

function login(ip: string, password: string, username = "admin") {
  return new NextRequest("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": ip },
    body: JSON.stringify({ username, password }),
  });
}

describe("POST /api/admin/login brute-force protection", () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_PASSWORD", "correct-horse-battery");
    vi.stubEnv("JWT_SECRET", "test-secret");
    vi.resetModules();
    ({ POST } = await import("./route"));
  });

  it("refuses an IP after 5 failed attempts, even with the right password", async () => {
    const ip = uniqueIp();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await POST(login(ip, "wrong"))).status).toBe(401);
    }
    const blocked = await POST(login(ip, "correct-horse-battery"));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(blocked.headers.get("set-cookie")).toBeNull();
  });

  it("does not affect other IPs", async () => {
    const attacker = uniqueIp();
    for (let attempt = 0; attempt < 6; attempt += 1) await POST(login(attacker, "wrong"));
    expect((await POST(login(uniqueIp(), "correct-horse-battery"))).status).toBe(200);
  });

  it("clears the count after a successful login", async () => {
    const ip = uniqueIp();
    for (let attempt = 0; attempt < 4; attempt += 1) await POST(login(ip, "wrong"));
    expect((await POST(login(ip, "correct-horse-battery"))).status).toBe(200);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      expect((await POST(login(ip, "wrong"))).status).toBe(401);
    }
  });

  it("lets the IP try again after the 15-minute window", async () => {
    vi.useFakeTimers();
    try {
      const ip = uniqueIp();
      for (let attempt = 0; attempt < 5; attempt += 1) await POST(login(ip, "wrong"));
      expect((await POST(login(ip, "correct-horse-battery"))).status).toBe(429);
      vi.advanceTimersByTime(15 * 60 * 1000 + 1000);
      expect((await POST(login(ip, "correct-horse-battery"))).status).toBe(200);
    } finally {
      vi.useRealTimers();
    }
  });

  it("still logs in normally with the right password", async () => {
    const response = await POST(login(uniqueIp(), "correct-horse-battery"));
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("sh_admin_session=");
  });
});
