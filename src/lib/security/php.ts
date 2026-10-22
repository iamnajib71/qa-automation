export const phpAdvisory = {
  checkedAt: "2026-10-22",
  cves: ["CVE-2026-109618", "CVE-2026-109619"],
  source: "https://www.php.net/archive/2026.php#2026-10-21-5",
  advisories: ["https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w", "https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp"],
  fixed: { "8.2": "8.2.35", "8.3": "8.3.36", "8.4": "8.4.27", "8.5": "8.5.12" } as Record<string, string>,
};

export function assessPhpVersion(input: string, evidence: "runtime" | "header" | "package" = "runtime") {
  const match = input.trim().match(/^(?:PHP[ /])?(\d+)\.(\d+)\.(\d+)([-+~].*)?$/i);
  if (!match) return { status: "inconclusive", title: "Runtime version needed", version: input,
    detail: "Supply the complete version from the web-serving PHP runtime or its package inventory. A site URL alone cannot establish patch status.", fixedVersion: null };
  const branch = `${match[1]}.${match[2]}`;
  const version = `${branch}.${match[3]}`;
  const fixedVersion = phpAdvisory.fixed[branch];
  if (!fixedVersion) return { status: "inconclusive", title: "Check the vendor support branch", version,
    detail: "This advisory covers upstream PHP 8.2–8.5 fixes. PHP 8.1 and older need a supported upgrade or a confirmed vendor backport; unlisted newer branches need their vendor advisory.", fixedVersion: null };
  if (evidence === "header") return { status: "inconclusive", title: "Header is a hint, not patch evidence", version, fixedVersion,
    detail: "A reverse proxy can hide, alter or cache this header. Verify the actual serving runtime and package security changelog before classifying exposure." };
  if (evidence === "package" || match[4]) return { status: "inconclusive", title: "Verify vendor backport status", version, fixedVersion,
    detail: "Distribution packages can contain backported fixes with an older upstream version number. Confirm both CVEs in the vendor security advisory and installed package changelog." };
  const fixed = Number(match[3]) >= Number(fixedVersion.split(".")[2]);
  return { status: fixed ? "upstream-fixed" : "needs-update", title: fixed ? "Version includes the upstream fixes" : "Below the upstream fixed release",
    version, fixedVersion, detail: fixed ? "This version meets the upstream release threshold for both CVEs. Verify every serving worker was restarted; this is not an exploit or compromise assessment."
      : `Update this branch to ${fixedVersion} or a later supported release, restart all serving workers, then verify the effective web runtime again. Vendor backports require separate evidence.` };
}

export function inspectPhpRuntime(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Paste the runtime helper's JSON object.");
  const data = input as Record<string, unknown>;
  if (typeof data.php_version !== "string" || typeof data.sapi !== "string") throw new Error("Runtime JSON needs php_version and sapi fields.");
  const notes = [data.sapi === "cli" ? "CLI evidence does not establish the PHP version serving web requests. Verify PHP-FPM, Apache or the actual serving container separately."
    : `Reported serving interface: ${data.sapi}. Confirm this evidence came from the application you are assessing.`];
  if (String(data.session_upload_progress_enabled) === "1") notes.push("Session upload progress is enabled. The stale-state advisory includes confirmed session-related paths; updating remains the complete fix.");
  else notes.push("Session upload progress is not reported as enabled. This does not rule out other stale-state paths.");
  if (data.memory_limit && String(data.memory_limit) !== "-1") notes.push(`A finite PHP memory limit (${String(data.memory_limit)}) is configured. Memory-exhaustion handling is relevant to CVE-2026-109618; apply the update rather than interpreting this setting as an exploit result.`);
  if (data.fatal_error_backtraces === true || data.fatal_error_backtraces === "1") notes.push("Fatal error backtraces are enabled. Review the PHP 8.5 advisory path and apply the full update.");
  return { version: data.php_version, sapi: data.sapi, notes };
}
