# PHP patch diagnostics for developers

The portal's `/php-security` tool supports an evidence-first workflow for the published PHP2Shell advisories: [CVE-2026-109618](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) and [CVE-2026-109619](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp).

PHP's [21 October 2026 advisory](https://www.php.net/archive/2026.php#2026-10-21-5) identifies upstream fixes in 8.2.35, 8.3.36, 8.4.27 and 8.5.12. These are known published vulnerabilities, not new defects discovered by this portfolio.

1. Download the runtime helper from the screen and execute it in your own serving environment. It reports PHP version/SAPI and a small set of relevant limits/settings; it does not dump environment variables, customer data or phpinfo. CLI and PHP-FPM/Apache may use different installations. Any temporary web endpoint must remain private and be removed after collection.
2. Supply the full runtime version and select its evidence source. An older unmodified upstream version is flagged for update. A fixed upstream version meets the release threshold only. Headers, vendor-backported packages and unknown branches remain inconclusive until supported by vendor/runtime evidence.
3. Apply the official or distribution security update that fixes **both** CVEs. Do not infer that a distro package is vulnerable solely because its upstream-looking version number is lower; inspect the vendor advisory and changelog.
4. Restart every serving worker/pool/container, gather the effective runtime version again, reassess it, and run your application's functional and request-isolation regressions. Export before/after JSON reports with the package advisory and actual regression outcomes.

The tool does not overload a site, exploit memory corruption, attempt to read another request's memory, determine compromise, or automatically modify a server. It never interprets a normal successful request as proof that a site is safe. Its advisory data is a dated snapshot reviewed on 22 October 2026; it is not an automatically refreshed vulnerability feed.

The public GitHub helper is available at `public/tools/php-runtime-check.php.txt`; the `.txt` suffix ensures the portal serves source for download. Tests cover each upstream branch boundary and ensure header/package evidence cannot produce a false patched verdict.
