import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { ReadableStream } from "node:stream/web";
import { Response } from "undici";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createPublicUrlFetch,
  isPublicAddress,
  NonPublicAddressError,
  nonPublicAddressCause,
  readBodyWithLimit,
  ResponseTooLargeError,
} from "./publicUrlFetch";

describe("isPublicAddress", () => {
  it.each(["8.8.8.8", "1.1.1.1", "142.250.80.46", "2606:4700:4700::1111"])("allows the public address %s", (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  it.each([
    "127.0.0.1", "127.8.9.10", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1",
    "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1", "255.255.255.255",
    "::1", "::", "fe80::1", "fc00::1", "fd12:3456::1", "::ffff:127.0.0.1", "::ffff:7f00:1",
    "::ffff:169.254.169.254", "64:ff9b::a9fe:a9fe", "2002:7f00:1::",
  ])("blocks the non-public address %s", (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it.each(["", "localhost", "example.com"])("rejects %j, which is not an IP address", (value) => {
    expect(isPublicAddress(value)).toBe(false);
  });
});

describe("createPublicUrlFetch", () => {
  let server: Server;
  let base: string;
  let hits = 0;

  beforeAll(async () => {
    server = createServer((request, response) => {
      hits += 1;
      if (request.url === "/hop") return response.writeHead(302, { location: "/final" }).end();
      if (request.url === "/to-ipv6-loopback") {
        const { port } = server.address() as AddressInfo;
        return response.writeHead(302, { location: `http://[::1]:${port}/final` }).end();
      }
      if (request.url === "/to-metadata") {
        return response.writeHead(307, { location: "http://169.254.169.254/latest/meta-data/" }).end();
      }
      if (request.url === "/loop") return response.writeHead(302, { location: "/loop" }).end();
      response.writeHead(200, { "content-type": "text/plain" }).end("internal secret");
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  describe("with the default public-only rule", () => {
    const fetchPublicUrl = createPublicUrlFetch();

    it.each([
      () => `${base}/final`,
      () => base.replace("127.0.0.1", "[::1]"),
      () => base.replace("127.0.0.1", "localhost"),
      () => base.replace("127.0.0.1", "2130706433"),
      () => base.replace("127.0.0.1", "0x7f.1"),
      () => base.replace("127.0.0.1", "[::ffff:127.0.0.1]"),
      () => "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
    ])("refuses an internal target without sending a request (case %#)", async (target) => {
      const before = hits;
      const error = await fetchPublicUrl(target()).catch((caught: unknown) => caught);
      expect(nonPublicAddressCause(error)).toBeInstanceOf(NonPublicAddressError);
      expect(hits).toBe(before);
    });

    it.each(["file:///etc/passwd", "ftp://example.com/x", "gopher://127.0.0.1:6379/_INFO"])(
      "refuses the non-http URL %s",
      async (target) => {
        await expect(fetchPublicUrl(target)).rejects.toThrow("Only http/https URLs are supported");
      },
    );
  });

  describe("redirects (loopback 127.0.0.1 treated as public so a local server can stand in)", () => {
    const fetchPublicUrl = createPublicUrlFetch({ isAllowed: (address) => address === "127.0.0.1" });

    it("follows a redirect to an allowed address and returns the final page", async () => {
      const { response, url } = await fetchPublicUrl(`${base}/hop`);
      expect(response.status).toBe(200);
      expect(url.pathname).toBe("/final");
      expect(await response.text()).toBe("internal secret");
    });

    it("refuses a redirect to a blocked IP literal", async () => {
      const error = await fetchPublicUrl(`${base}/to-ipv6-loopback`).catch((caught: unknown) => caught);
      expect(nonPublicAddressCause(error)).toBeInstanceOf(NonPublicAddressError);
    });

    it("refuses a redirect to the cloud metadata address", async () => {
      const error = await fetchPublicUrl(`${base}/to-metadata`).catch((caught: unknown) => caught);
      expect(nonPublicAddressCause(error)).toBeInstanceOf(NonPublicAddressError);
    });

    it("stops after the redirect limit", async () => {
      await expect(fetchPublicUrl(`${base}/loop`)).rejects.toThrow("Too many redirects");
    });
  });
});

describe("readBodyWithLimit", () => {
  it("returns a body within the limit", async () => {
    expect((await readBodyWithLimit(new Response("hello"), 10)).toString()).toBe("hello");
  });

  it("rejects a declared length over the limit before reading", async () => {
    const response = new Response("x".repeat(20), { headers: { "content-length": "20" } });
    await expect(readBodyWithLimit(response, 10)).rejects.toBeInstanceOf(ResponseTooLargeError);
  });

  it("rejects a streamed body that grows past the limit", async () => {
    const stream = new ReadableStream({
      start(controller) {
        for (let index = 0; index < 5; index += 1) controller.enqueue(new TextEncoder().encode("12345"));
        controller.close();
      },
    });
    await expect(readBodyWithLimit(new Response(stream), 12)).rejects.toBeInstanceOf(ResponseTooLargeError);
  });
});
