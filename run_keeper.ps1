$ErrorActionPreference = 'Stop'

# Navigate to Keeper folder
$KeeperDir = $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Yellow
Write-Host "        STARTING WINDMILL KEEPER NODE ON YOUR MACHINE           " -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Yellow

# 1. Setup .env file
$EnvFile = Join-Path $KeeperDir ".env"
$ExampleEnvFile = Join-Path $KeeperDir ".env.example"

if (-not (Test-Path $EnvFile)) {
    Write-Host "[1/3] Creating .env file from .env.example..." -ForegroundColor Cyan
    Copy-Item $ExampleEnvFile $EnvFile
    Write-Host "[OK] Created $EnvFile" -ForegroundColor Green
} else {
    Write-Host "[1/3] Found existing .env file." -ForegroundColor Green
}

# 2. Setup Dependencies
$NodeModules = Join-Path $KeeperDir "node_modules"
if (-not (Test-Path $NodeModules)) {
    Write-Host "[2/3] Installing keeper dependencies..." -ForegroundColor Cyan
    Push-Location $KeeperDir
    npm install
    Pop-Location
    Write-Host "[OK] Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "[2/3] Dependencies already installed." -ForegroundColor Green
}

Push-Location $KeeperDir
try {
    # 3. Validate the same environment the keeper will load.
    node src/validate-launch-config.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Check $EnvFile and any environment overrides, then run the keeper again." -ForegroundColor Yellow
        exit $LASTEXITCODE
    }

    Write-Host "[3/3] Config variables are valid." -ForegroundColor Green

    # 4. Launch Keeper
    Write-Host "Starting the keeper runner loop..." -ForegroundColor Yellow
    node src/index.js
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
