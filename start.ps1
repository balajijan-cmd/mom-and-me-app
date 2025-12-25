# MOM & ME's - Start Application
# This script starts both backend and frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting MOM & ME's Application" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check and Create .env files if missing
if (-not (Test-Path "backend\.env")) {
    Write-Host "i backend/.env not found. Creating default..." -ForegroundColor Yellow
    $backendEnv = "MONGODB_URI=mongodb://localhost:27017/momandme`r`nPORT=5000`r`nNODE_ENV=development`r`nJWT_SECRET=momandmes_super_secret_key_change_this_in_production`r`nCLOUDINARY_CLOUD_NAME=demo`r`nCLOUDINARY_API_KEY=demo`r`nCLOUDINARY_API_SECRET=demo`r`nFRONTEND_URL=http://localhost:5173"
    $backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
}

if (-not (Test-Path "web-frontend\.env")) {
    Write-Host "i web-frontend/.env not found. Creating default..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:5000/api" | Out-File -FilePath "web-frontend\.env" -Encoding UTF8
}

Write-Host "SUCCESS: Environment files found" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'Backend Server' -ForegroundColor Cyan; npm start"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\web-frontend'; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers Starting!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Two new terminal windows have opened." -ForegroundColor White
Write-Host "Wait for both servers to start, then:" -ForegroundColor White
Write-Host ""
Write-Host "1. Create admin user (in this terminal):" -ForegroundColor Yellow
Write-Host "   node create-admin.js" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C in each terminal to stop servers" -ForegroundColor White
Write-Host ""
