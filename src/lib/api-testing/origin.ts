export function acceptsOrigin(headers: Headers, requestUrl: string) {
  const origin = headers.get("origin");
  if (!origin) return true;
  try {
    const url = new URL(requestUrl);
    // Next can construct request.url with its bind hostname; Host is the browser-facing authority.
    const expected = `${url.protocol}//${headers.get("host") || url.host}`;
    return new URL(origin).origin === origin && origin === expected;
  } catch { return false; }
}
