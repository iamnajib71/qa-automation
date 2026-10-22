import { lookup } from "node:dns/promises";
import { isIP, BlockList } from "node:net";
import https from "node:https";
import http from "node:http";

export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && [0, 168].includes(b)) ||
      (a === 198 && [18, 19, 51].includes(b)) || (a === 203 && b === 0));
  }
  if (isIP(address) !== 6) return false;
  // Permit global unicast only; exclude mapped IPv4, local, multicast and documentation ranges.
  const global = new BlockList();
  global.addSubnet("2000::", 3, "ipv6");
  const excluded = new BlockList();
  excluded.addSubnet("2001::", 23, "ipv6");
  excluded.addSubnet("2001:db8::", 32, "ipv6");
  excluded.addSubnet("2002::", 16, "ipv6");
  excluded.addSubnet("3fff::", 20, "ipv6");
  return global.check(address, "ipv6") && !excluded.check(address, "ipv6");
}

export type HttpResult = { status: number; headers: Record<string, string>; text: string; elapsedMs: number };

export async function boundedRequest(url: URL, method: string, headers: Record<string, string>, body?: string): Promise<HttpResult> {
  if (url.username || url.password || url.hash) throw new Error("Remove credentials and fragments from the URL. Use the authentication field.");
  const localOrigin = !process.env.VERCEL ? process.env.API_TEST_LOCAL_ORIGIN : undefined;
  const local = localOrigin === url.origin && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if ((!local && url.protocol !== "https:") || (local && !["https:", "http:"].includes(url.protocol))) {
    throw new Error("Use a public HTTPS endpoint. Local targets require an explicit local-server configuration.");
  }
  if (!local && url.port && url.port !== "443") throw new Error("Hosted checks use HTTPS port 443.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await Promise.race([
    lookup(hostname, { all: true }),
    new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error("DNS lookup timed out.")), 3000); timer.unref(); })
  ]);
  if (!addresses.length || (!local && addresses.some(item => !isPublicAddress(item.address)))) throw new Error("Private, reserved and metadata network addresses are blocked.");
  const address = addresses[0];
  const started = performance.now();
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const request = transport.request(url, {
      method, headers: { Accept: "application/json", "User-Agent": "QA-Portal-API-Check/1.0", ...headers },
      // Pin the validated address; a second DNS lookup must not bypass the address check.
      lookup: (_host, _options, callback) => callback(null, address.address, address.family),
      agent: false, family: address.family,
    }, response => {
      let length = 0;
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => {
        length += chunk.length;
        if (length > 512 * 1024) { response.destroy(new Error("Response exceeded the 512 KiB limit.")); return; }
        chunks.push(chunk);
      });
      response.on("error", reject);
      response.on("end", () => resolve({ status: response.statusCode || 0,
        headers: { "content-type": String(response.headers["content-type"] || ""), "x-powered-by": String(response.headers["x-powered-by"] || "") },
        text: Buffer.concat(chunks).toString("utf8"), elapsedMs: Math.round(performance.now() - started) }));
    });
    const deadline = setTimeout(() => request.destroy(new Error("Request timed out after 8 seconds.")), 8000);
    request.on("close", () => clearTimeout(deadline));
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}
