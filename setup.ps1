# MOM & ME's - Quick Setup Script
# Run this to create your .env files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MOM & ME's - Quick Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create backend .env
Write-Host "Creating backend/.env file..." -ForegroundColor Green
$backendEnv = @"
MONGODB_URI=mongodb://localhost:27017/momandme
PORT=5000
NODE_ENV=development
JWT_SECRET=momandmes_super_secret_key_change_this_in_production_minimum_32_characters
JWT_EXPIRE=24h
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
"@

$backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Host "✓ backend/.env created" -ForegroundColor Green

# Create frontend .env
Write-Host "Creating web-frontend/.env file..." -ForegroundColor Green
$frontendEnv = "VITE_API_URL=http://localhost:5000/api"
$frontendEnv | Out-File -FilePath "web-frontend\.env" -Encoding UTF8
Write-Host "✓ web-frontend/.env created" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start MongoDB (if using local):" -ForegroundColor White
Write-Host "   mongod" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Backend (Terminal 1):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start Frontend (Terminal 2):" -ForegroundColor White
Write-Host "   cd web-frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Create first admin user:" -ForegroundColor White
Write-Host "   POST http://localhost:5000/api/auth/register" -ForegroundColor Gray
Write-Host "   Body: {username: 'admin', password: 'Admin@123', fullName: 'Admin'}" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Note: For production, update Cloudinary credentials in backend/.env" -ForegroundColor Yellow
Write-Host ""
