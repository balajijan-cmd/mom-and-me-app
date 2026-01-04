# Backend Connection Test Script
# This script tests if your backend is accessible

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MOM & ME Backend Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://mom-and-me-backend.onrender.com"

Write-Host "Testing backend at: $backendUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health Endpoint
Write-Host "[Test 1] Testing /health endpoint..." -ForegroundColor Green
try {
    $healthResponse = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -TimeoutSec 30
    Write-Host "✅ SUCCESS! Backend is accessible!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $healthResponse | ConvertTo-Json -Depth 3
    Write-Host ""
}
catch {
    Write-Host "❌ FAILED! Backend is NOT accessible!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Backend is not deployed to Render" -ForegroundColor Yellow
    Write-Host "  2. Backend URL is incorrect" -ForegroundColor Yellow
    Write-Host "  3. Backend service is sleeping (free tier)" -ForegroundColor Yellow
    Write-Host "  4. Backend deployment failed" -ForegroundColor Yellow
    Write-Host ""
}

# Test 2: Root API Endpoint
Write-Host "[Test 2] Testing / endpoint..." -ForegroundColor Green
try {
    $rootResponse = Invoke-RestMethod -Uri "$backendUrl/" -Method Get -TimeoutSec 30
    Write-Host "✅ SUCCESS! API root is accessible!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $rootResponse | ConvertTo-Json -Depth 3
    Write-Host ""
}
catch {
    Write-Host "❌ FAILED! API root is NOT accessible!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Login Endpoint (should return error without credentials)
Write-Host "[Test 3] Testing /api/auth/login endpoint..." -ForegroundColor Green
try {
    $loginBody = @{
        username = "test"
        password = "test"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$backendUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Login endpoint is accessible!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $loginResponse | ConvertTo-Json -Depth 3
    Write-Host ""
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Login endpoint is accessible (returned 401 as expected)!" -ForegroundColor Green
        Write-Host "This means the backend is working!" -ForegroundColor Green
        Write-Host ""
    }
    else {
        Write-Host "❌ FAILED! Login endpoint is NOT accessible!" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. If all tests passed: Your backend is working! Check frontend configuration." -ForegroundColor White
Write-Host "2. If tests failed: Check your Render dashboard at https://dashboard.render.com/" -ForegroundColor White
Write-Host "3. Read LOGIN_ISSUE_DIAGNOSIS.md for detailed troubleshooting steps" -ForegroundColor White
Write-Host ""
