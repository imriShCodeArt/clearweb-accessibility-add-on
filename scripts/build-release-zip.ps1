# Builds a WordPress-ready plugin ZIP (forward-slash paths for Linux hosting).
#
# Usage (any of these from the plugin folder):
#   npm run zip
#   create-zip.bat
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-release-zip.ps1
#
# Options:
#   -SkipBuild   Skip npm run build (use existing build/ output)
#   -SkipI18n    Skip regenerating languages/*.l10n.php from *.po

param(
    [switch]$SkipBuild,
    [switch]$SkipI18n
)

$ErrorActionPreference = 'Stop'
$root  = Split-Path $PSScriptRoot -Parent
$slug  = 'clearweb-accessibility-add-on'
$dist  = Join-Path $root 'dist'
$stage = Join-Path $dist $slug
$zip   = Join-Path (Split-Path $root -Parent) "$slug.zip"

Write-Host "Clearweb Accessibility Add-on - release ZIP"
Write-Host "Plugin root: $root"
Write-Host ""

if (-not $SkipI18n) {
    $po = Join-Path $root 'languages\clearweb-accessibility-add-on-he_IL.po'
    if ((Test-Path $po) -and (Get-Command wp -ErrorAction SilentlyContinue)) {
        Write-Host "Regenerating Hebrew l10n.php..."
        Push-Location $root
        try {
            wp i18n make-php $po languages/ 2>&1 | Out-Host
            if ($LASTEXITCODE -ne 0) { throw "wp i18n make-php failed." }
        } finally {
            Pop-Location
        }
        Write-Host ""
    }
}

if (-not $SkipBuild) {
    Write-Host "Building JS/CSS (npm run build)..."
    Push-Location $root
    try {
        npm run build --silent
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed." }
    } finally {
        Pop-Location
    }
    Write-Host ""
}

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage -Force | Out-Null

Copy-Item (Join-Path $root 'clearweb-accessibility-suite.php') $stage
Copy-Item (Join-Path $root 'uninstall.php') $stage -ErrorAction SilentlyContinue
Copy-Item (Join-Path $root 'readme.txt') $stage -ErrorAction SilentlyContinue
Copy-Item (Join-Path $root 'license.txt') $stage -ErrorAction SilentlyContinue
Copy-Item (Join-Path $root 'INSTALL-STAGING.txt') $stage -ErrorAction SilentlyContinue
Copy-Item (Join-Path $root 'includes') (Join-Path $stage 'includes') -Recurse
Copy-Item (Join-Path $root 'build') (Join-Path $stage 'build') -Recurse
Copy-Item (Join-Path $root 'languages') (Join-Path $stage 'languages') -Recurse
New-Item -ItemType Directory -Path (Join-Path $stage 'assets\css') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage 'assets\images') -Force | Out-Null
Copy-Item (Join-Path $root 'assets\css\*.css') (Join-Path $stage 'assets\css')
Copy-Item (Join-Path $root 'assets\images\*') (Join-Path $stage 'assets\images')

$silence = "<?php`n// Silence is golden.`n"
Get-ChildItem $stage -Recurse -Directory | ForEach-Object {
    $index = Join-Path $_.FullName 'index.php'
    if (-not (Test-Path $index)) { Set-Content -Path $index -Value $silence -NoNewline }
}
$rootIndex = Join-Path $stage 'index.php'
if (-not (Test-Path $rootIndex)) { Set-Content -Path $rootIndex -Value $silence -NoNewline }

$main = Join-Path $stage 'clearweb-accessibility-suite.php'
if (-not (Test-Path $main)) { throw "Missing main plugin file in stage." }

Remove-Item $zip -Force -ErrorAction SilentlyContinue
Push-Location $dist
tar -a -c -f $zip $slug
Pop-Location

Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead($zip)
$expected = "$slug/clearweb-accessibility-suite.php"
$found = $false
foreach ($e in $z.Entries) {
    if ($e.FullName -match '\\') { throw "ZIP has backslash paths (broken on Linux): $($e.FullName)" }
    if ($e.FullName -eq $expected) { $found = $true }
}
$z.Dispose()
if (-not $found) { throw "ZIP missing required entry: $expected" }

$kb = [math]::Round((Get-Item $zip).Length / 1KB)
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host ('Created: ' + $zip + ' (' + $kb + ' KB)')
Write-Host "Built at: $stamp"
Write-Host ""
Write-Host "Deploy:"
Write-Host "  1. Upload ZIP in WP Admin -> Plugins -> Add New -> Upload Plugin"
Write-Host "  2. Replace the old plugin folder if updating"
Write-Host "  3. Purge cache and hard-refresh"
Write-Host ""
Write-Host "Server path after install:"
Write-Host "  wp-content/plugins/$slug/clearweb-accessibility-suite.php"

if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
