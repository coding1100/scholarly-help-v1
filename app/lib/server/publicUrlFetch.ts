import { lookup as dnsLookup, type LookupAddress, type LookupOptions } from "node:dns";
import { BlockList, isIP } from "node:net";
import { Agent, fetch, type RequestInit, type Response } from "undici";

// Ranges a server-side fetch of a visitor's URL must never reach: this host,
// private networks, cloud metadata (169.254.169.254), carrier-grade NAT,
// documentation/benchmark ranges, multicast and reserved space.
// IPv4-mapped IPv6 addresses (::ffff:a.b.c.d) are matched against the IPv4 rules.
const NON_PUBLIC = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) {
  NON_PUBLIC.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 128], ["::1", 128], ["64:ff9b::", 96], ["100::", 64], ["2001::", 32],
  ["2001:db8::", 32], ["2002::", 16], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
] as const) {
  NON_PUBLIC.addSubnet(network, prefix, "ipv6");
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return !NON_PUBLIC.check(address, "ipv4");
  if (family === 6) return !NON_PUBLIC.check(address, "ipv6");
  return false;
}

/** Thrown when a URL, a redirect or a DNS answer leads to a non-public address. */
export class NonPublicAddressError extends Error {
  constructor(readonly host: string) {
    super(`${host} resolves to a private or internal network address`);
    this.name = "NonPublicAddressError";
  }
}

/** Thrown when a response body is larger than the caller allows. */
export class ResponseTooLargeError extends Error {
  constructor(readonly maxBytes: number) {
    super(`Response is larger than ${maxBytes} bytes`);
    this.name = "ResponseTooLargeError";
  }
}

type AddressCheck = (address: string) => boolean;
type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | LookupAddress[],
  family?: number,
) => void;

/**
 * A DNS lookup for outgoing connections that refuses the connection when any
 * resolved address is not public. It runs at connect time, so a hostname that
 * changes its DNS answer after an earlier check still cannot reach inside.
 */
export function createPublicOnlyLookup(isAllowed: AddressCheck) {
  return (hostname: string, options: LookupOptions, callback: LookupCallback) => {
    dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
      if (error) return callback(error, []);
      const list = addresses as LookupAddress[];
      if (!list.length || list.some(({ address }) => !isAllowed(address))) {
        return callback(new NonPublicAddressError(hostname), []);
      }
      if (options.all) return callback(null, list);
      return callback(null, list[0].address, list[0].family);
    });
  };
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * Builds a fetch for URLs supplied by visitors. Only http(s) URLs whose host
 * resolves exclusively to public addresses are fetched; every redirect hop is
 * checked the same way. `isAllowed` exists so tests can treat loopback as public.
 */
export function createPublicUrlFetch({
  isAllowed = isPublicAddress,
  maxRedirects = 5,
}: { isAllowed?: AddressCheck; maxRedirects?: number } = {}) {
  const dispatcher = new Agent({ connect: { lookup: createPublicOnlyLookup(isAllowed) } });

  return async function fetchPublicUrl(
    input: string | URL,
    init: Omit<RequestInit, "redirect" | "dispatcher"> = {},
  ): Promise<{ response: Response; url: URL }> {
    let url = new URL(input);
    for (let hop = 0; ; hop += 1) {
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new TypeError("Only http/https URLs are supported");
      }
      // An IP literal is connected to directly, without the lookup above.
      const literal = url.hostname.replace(/^\[|\]$/g, "");
      if (isIP(literal) && !isAllowed(literal)) throw new NonPublicAddressError(url.hostname);

      const response = await fetch(url, { ...init, redirect: "manual", dispatcher });
      const location = response.headers.get("location");
      if (!REDIRECT_STATUSES.has(response.status) || !location) return { response, url };
      await response.body?.cancel();
      if (hop >= maxRedirects) throw new TypeError(`Too many redirects from ${url.hostname}`);
      url = new URL(location, url);
    }
  };
}

/** Reads a response body, aborting once it exceeds `maxBytes`. */
export async function readBodyWithLimit(response: Response, maxBytes: number): Promise<Buffer> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    await response.body?.cancel();
    throw new ResponseTooLargeError(maxBytes);
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of response.body ?? []) {
    total += chunk.byteLength;
    if (total > maxBytes) {
      await response.body?.cancel().catch(() => {});
      throw new ResponseTooLargeError(maxBytes);
    }
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** Unwraps the error a failed connection is reported with by fetch. */
export function nonPublicAddressCause(error: unknown): NonPublicAddressError | null {
  for (let current = error; current instanceof Error; current = current.cause) {
    if (current instanceof NonPublicAddressError) return current;
  }
  return null;
}
