export function downloadReport(name: string, value: unknown, type = "application/json") {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function escapeXml(text: string) {
  return text.replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}
