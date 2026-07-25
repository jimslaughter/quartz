Set-Location "C:\Users\jimsl\quartz"
Write-Host "Publishing Quartz site..."
npx quartz sync --no-pull

Write-Host ""
Write-Host "Waiting for Cloudflare to build and deploy..."
Write-Host ""

$projectName = "quartz"

while ($true) {
    $json = npx wrangler pages deployment list --project-name=$projectName --json 2>$null
    try {
        $status = ($json | ConvertFrom-Json)[0].latest_stage.status
    } catch {
        $status = "unknown"
    }

    Write-Host "Status: $status"

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

    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Press any key to close..."
[void][System.Console]::ReadKey($true)