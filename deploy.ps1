Set-Location "C:\Users\jimsl\quartz"

$accountId  = "54de0373e1d87ee72ac6ee81b926e091"
$projectName = "quartz"
$apiToken   = $env:CF_API_TOKEN

if (-not $apiToken) {
    Write-Host "ERROR: CF_API_TOKEN environment variable not set."
    Write-Host "Press any key to close..."
    [void][System.Console]::ReadKey($true)
    exit
}

$headers = @{ Authorization = "Bearer $apiToken" }
$uri = "https://api.cloudflare.com/client/v4/accounts/$accountId/pages/projects/$projectName/deployments?per_page=1"

# Capture the current top deployment ID BEFORE we push, as our baseline
$before = Invoke-RestMethod -Uri $uri -Headers $headers
$baselineId = $before.result[0].id

Write-Host "Publishing Quartz site..."
npx quartz sync --no-pull

Write-Host ""
Write-Host "Waiting for Cloudflare to build and deploy..."
Write-Host ""

while ($true) {
    $resp = Invoke-RestMethod -Uri $uri -Headers $headers
    $latest = $resp.result[0]
    $status = $latest.latest_stage.status

    if ($latest.id -ne $baselineId) {
        Write-Host "New deployment detected: $($latest.id) - stage status: $status"
        if ($status -eq "success") {
            Write-Host ""
            Write-Host "Deployed! Site is live."
            break
        }
        elseif ($status -eq "failure") {
            Write-Host ""
            Write-Host "Build failed - check the Cloudflare dashboard."
            break
        }
        # else still building - keep polling
    }
    else {
        Write-Host "Still waiting for new deployment to appear..."
    }

    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Press any key to close..."
[void][System.Console]::ReadKey($true)