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
