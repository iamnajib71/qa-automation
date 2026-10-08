$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
Clear-Host
Write-Host 'QA PORTAL | NAZMUL HASSAN'
Write-Host 'Real Next.js app + local JSON | synthetic test data only'
Write-Host ''
Start-Sleep -Seconds 3
Write-Host '$ GET /api/defects'
$list = Invoke-WebRequest -Uri 'http://127.0.0.1:43187/api/defects'
Write-Host "HTTP $($list.StatusCode) | JSON defect list"
Start-Sleep -Seconds 3
Write-Host '$ POST /api/defects (synthetic fixture)'
$body = @{ title='Synthetic recorded demo defect'; description='Fictional demo data'; severity='high'; priority='high'; status='open' } | ConvertTo-Json
$created = Invoke-WebRequest -Uri 'http://127.0.0.1:43187/api/defects' -Method Post -ContentType 'application/json' -Body $body
$defect = ($created.Content | ConvertFrom-Json).defect
Write-Host "HTTP $($created.StatusCode) | $($defect.title) | status=$($defect.status)"
Start-Sleep -Seconds 4
Write-Host '$ PATCH /api/defects/:id (retest)'
$updated = Invoke-WebRequest -Uri "http://127.0.0.1:43187/api/defects/$($defect.id)" -Method Patch -ContentType 'application/json' -Body '{"status":"retest"}'
Write-Host "HTTP $($updated.StatusCode) | status=$(($updated.Content | ConvertFrom-Json).defect.status)"
Start-Sleep -Seconds 4
Write-Host '$ DELETE /api/defects/:id'
$deleted = Invoke-WebRequest -Uri "http://127.0.0.1:43187/api/defects/$($defect.id)" -Method Delete
Write-Host "HTTP $($deleted.StatusCode) | deleted"
Start-Sleep -Seconds 3
Write-Host '$ POST /api/smoke-test (this portal)'
$scan = Invoke-RestMethod -Uri 'http://127.0.0.1:43187/api/smoke-test' -Method Post -ContentType 'application/json' -Body '{"websiteUrl":"http://127.0.0.1:43187"}'
if ($scan.pageScan.metrics.browserFallbackReason) { throw 'Demo must use a real browser scan.' }
Write-Host "Scan $($scan.scanRun.status) | target HTTP $($scan.pageScan.httpStatus)"
Write-Host "Evidence: $($scan.evidence.kind -join ', ')"
Start-Sleep -Seconds 4
Write-Host '$ npm test'
npm.cmd test
if ($LASTEXITCODE -ne 0) { throw 'Unit suite failed.' }
Start-Sleep -Seconds 4
Write-Host 'Inspect the browser reports and full test evidence in the README.'
Start-Sleep -Seconds 3
