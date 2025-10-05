# Start Backend Server Script
# Save this as start-backend.ps1 in the project root

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Stop any existing node processes
Write-Host "Stopping existing node processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Location: $backendPath" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected output:" -ForegroundColor Cyan
Write-Host "  📅 Campaign scheduler started - checking every 5 minutes" -ForegroundColor Gray
Write-Host "  🚀 Server running on port 5001" -ForegroundColor Gray
Write-Host "  MongoDB Connected: ..." -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
node index.js
