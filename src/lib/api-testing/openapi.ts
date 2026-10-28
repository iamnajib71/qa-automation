type JsonObject = Record<string, unknown>;
function object(value: unknown): JsonObject { return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {}; }

function inlineSchema(value: unknown, doc: JsonObject, references: string[] = [], depth = 0): unknown {
  if (depth > 12) throw new Error("Schema nesting exceeds import limit.");
  if (Array.isArray(value)) return value.map(item => inlineSchema(item, doc, references, depth + 1));
  if (!value || typeof value !== "object") return value;
  const schema = object(value);
  if (typeof schema.$ref === "string") {
    const ref = schema.$ref;
    if (!ref.startsWith("#/") || references.includes(ref)) throw new Error("External or recursive schemas need a manual inline case.");
    let target: unknown = doc;
    for (const part of ref.slice(2).split("/")) {
      const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
      if (!Object.prototype.hasOwnProperty.call(object(target), key)) throw new Error("Unresolved local schema reference.");
      target = object(target)[key];
    }
    const resolved = inlineSchema(target, doc, [...references, ref], depth + 1);
    return schema.nullable || schema["x-nullable"] ? { anyOf: [resolved, { type: "null" }] } : resolved;
  }
  const result = Object.fromEntries(Object.entries(schema).filter(([key]) => !["x-nullable", "nullable"].includes(key)).map(([key, item]) => [key, inlineSchema(item, doc, references, depth + 1)]));
  return schema.nullable || schema["x-nullable"] ? { anyOf: [result, { type: "null" }] } : result;
}

export function importOpenApi(input: unknown) {
  const doc = object(input);
  if (doc.swagger !== "2.0" && !String(doc.openapi || "").startsWith("3.0.")) throw new Error("Import a Swagger 2.0 or OpenAPI 3.0 JSON document.");
  const cases: JsonObject[] = [];
  let skipped = 0;
  for (const [path, value] of Object.entries(object(doc.paths))) {
    const operation = object(object(value).get);
    if (!Object.keys(operation).length) continue;
    if (path.includes("{") || !path.startsWith("/") || path.startsWith("//")) { skipped++; continue; }
    const responses = object(operation.responses);
    const success = Object.keys(responses).find(status => /^2\d\d$/.test(status));
    if (!success) { skipped++; continue; }
    let response = object(responses[success]);
    if (typeof response.$ref === "string") {
      if (!response.$ref.startsWith("#/responses/")) { skipped++; continue; }
      response = object(object(doc.responses)[response.$ref.slice(12)]);
    }
    const schema = doc.swagger ? object(response.schema) : object(object(object(response.content)["application/json"]).schema);
    let responseSchema: unknown;
    try { responseSchema = Object.keys(schema).length ? inlineSchema(schema, doc) : undefined; }
    catch { skipped++; continue; }
    cases.push({ name: String(operation.summary || operation.operationId || `GET ${path}`).slice(0, 100), method: "GET", path,
      expectedStatus: Number(success), authenticated: !(Array.isArray(operation.security) && !operation.security.length),
      ...(responseSchema ? { responseSchema } : {}) });
  }
  const servers = Array.isArray(doc.servers) ? doc.servers : [];
  const server = typeof object(servers[0]).url === "string" ? String(object(servers[0]).url) : "";
  const baseUrl = /^https:\/\//.test(server) ? server : doc.host ? `https://${doc.host}${doc.basePath || ""}` : "";
  return { baseUrl, cases: cases.slice(0, 3), skipped, available: cases.length };
}

export function validateSchemaBudget(schema: unknown) {
  let nodes = 0;
  const forbidden = new Set(["pattern", "patternProperties", "uniqueItems", "$id", "$schema", "$dynamicRef", "$recursiveRef", "$async"]);
  function visit(value: unknown, depth: number) {
    if (++nodes > 600 || depth > 14) throw new Error("Schema exceeds the hosted validation complexity limit.");
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (forbidden.has(key)) throw new Error(`Schema keyword ${key} is not supported by the bounded hosted validator.`);
      if (key === "$ref") {
        // For imported contracts, shared schemas must be copied inline for hosted validation.
        // Recursive and external references can be expensive and are never resolved remotely.
        throw new Error("Inline response schemas before running: hosted validation does not resolve $ref references.");
      }
      visit(child, depth + 1);
    }
  }
  visit(schema, 0);
}
