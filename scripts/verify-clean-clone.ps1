param([string]$SourceRepository = '', [string]$EvidenceFile = 'clean-clone.json')
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$qaRoot = Split-Path -Parent $PSScriptRoot
if (!$SourceRepository) { $SourceRepository = $qaRoot }
$qaClone = Join-Path $env:TEMP ('qa-automation-verify-' + [guid]::NewGuid().ToString('N'))
if (Test-Path -LiteralPath $qaClone) { throw 'Verification requires a new clone directory.' }
$qaSteps = [System.Collections.Generic.List[object]]::new()
function Invoke-QaStep([string[]]$Command) {
  Write-Host ('$ ' + ($Command -join ' '))
  $qaStarted = Get-Date
  & $Command[0] $Command[1..($Command.Length - 1)]
  $qaExit = $LASTEXITCODE
  $qaSteps.Add(@{ command = $Command -join ' '; exitCode = $qaExit; durationSeconds = ((Get-Date) - $qaStarted).TotalSeconds })
  if ($qaExit -ne 0) { throw "Failed: $($Command -join ' ')" }
}
Invoke-QaStep @('git', 'clone', '--no-hardlinks', $SourceRepository, $qaClone)
Push-Location -LiteralPath $qaClone
try {
  $qaRevision = (& git rev-parse HEAD).Trim()
  $qaStartedClean = !(Test-Path node_modules) -and !(Test-Path .next) -and !(Test-Path data/qa-platform.json) -and !(Test-Path .env)
  Invoke-QaStep @('npm.cmd', 'ci')
  Invoke-QaStep @('npx.cmd', 'playwright', 'install', 'chromium')
  Invoke-QaStep @('npm.cmd', 'test')
  Invoke-QaStep @('npm.cmd', 'run', 'build')
  New-Item -ItemType Directory -Force reports | Out-Null
  $qaServer = Start-Process -FilePath $env:ComSpec -ArgumentList '/d /s /c "npm.cmd run serve:test"' -WorkingDirectory $qaClone -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $qaClone 'reports/server-output.txt') -RedirectStandardError (Join-Path $qaClone 'reports/server-error.txt')
  try {
    $qaHome = $null
    for ($qaAttempt = 0; $qaAttempt -lt 60; $qaAttempt++) {
      try { $qaHome = Invoke-WebRequest 'http://127.0.0.1:43187'; break } catch { Start-Sleep -Milliseconds 500 }
    }
    if (!$qaHome -or $qaHome.StatusCode -ne 200) { throw 'Clean clone did not start.' }
    $qaDefectsPage = Invoke-WebRequest 'http://127.0.0.1:43187/defects'
    $qaScan = Invoke-RestMethod -Uri 'http://127.0.0.1:43187/api/smoke-test' -Method Post -ContentType 'application/json' -Body '{"websiteUrl":"http://127.0.0.1:43187"}'
    if ($qaScan.scanRun.status -ne 'completed' -or $qaScan.pageScan.metrics.browserFallbackReason) { throw 'Clean clone must run real Chromium.' }
    $qaEvidenceStatuses = @($qaScan.evidence | ForEach-Object { (Invoke-WebRequest ('http://127.0.0.1:43187' + $_.filePath)).StatusCode })
    if ($qaEvidenceStatuses.Count -ne 3 -or ($qaEvidenceStatuses | Where-Object { $_ -ne 200 })) { throw 'Scan evidence could not be retrieved.' }
    $qaDemo = @{ homeStatus = $qaHome.StatusCode; defectsPageStatus = $qaDefectsPage.StatusCode; scanStatus = $qaScan.scanRun.status; targetStatus = $qaScan.pageScan.httpStatus; browserFallback = [bool]$qaScan.pageScan.metrics.browserFallbackReason; evidenceStatuses = $qaEvidenceStatuses }
    $qaSteps.Add(@{ command = 'npm.cmd run serve:test + real HTTP/browser demo verification'; exitCode = 0 })
  } finally {
    if ($qaServer -and !(Get-Process -Id $qaServer.Id -ErrorAction SilentlyContinue).HasExited) {
      & taskkill.exe /PID $qaServer.Id /T /F | Out-Null
    }
  }
  Invoke-QaStep @('npm.cmd', 'run', 'lint')
  Invoke-QaStep @('npm.cmd', 'run', 'typecheck')
  Invoke-QaStep @('npm.cmd', 'run', 'test:api')
  Invoke-QaStep @('npm.cmd', 'run', 'test:e2e')
  Invoke-QaStep @('npm.cmd', 'run', 'test:cypress')
  $qaUnit = Get-Content reports/unit/results.json -Raw | ConvertFrom-Json
  $qaNewman = Get-Content reports/newman/results.json -Raw | ConvertFrom-Json
  $qaPlaywright = Get-Content reports/playwright-results.json -Raw | ConvertFrom-Json
  $qaCypress = @(Get-ChildItem reports/cypress/raw -Filter '*.json' | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json })
  $qaSnapshot = @{ recordedAt = (Get-Date).ToUniversalTime().ToString('o'); source = $SourceRepository; revision = $qaRevision; environment = @{ os = 'Windows'; node = (& node --version); cloneDirectory = $qaClone }; startedWithoutDependenciesBuildDataOrEnv = $qaStartedClean; commands = @($qaSteps); demo = $qaDemo; totals = @{ unit = $qaUnit.numPassedTests; newmanRequests = $qaNewman.run.stats.requests.total; newmanAssertions = $qaNewman.run.stats.assertions.total; playwright = $qaPlaywright.stats.expected; cypress = ($qaCypress.stats.passes | Measure-Object -Sum).Sum }; failures = $qaUnit.numFailedTests + $qaNewman.run.failures.Count + $qaPlaywright.stats.unexpected + $qaPlaywright.stats.skipped + ($qaCypress.stats.failures | Measure-Object -Sum).Sum }
  $qaSnapshot | ConvertTo-Json -Depth 10 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $qaRoot ('docs/results/' + $EvidenceFile))
  if ($qaSnapshot.failures -ne 0) { throw 'Clean clone contains failures.' }
  Write-Host ('Clean-clone verification passed: ' + $qaRevision)
} finally { Pop-Location }
