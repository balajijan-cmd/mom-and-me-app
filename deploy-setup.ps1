# ========================================
# GitHub Deployment Setup Script
# ========================================
# This script helps you prepare your code for deployment
# by setting up Git and pushing to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Mom & Me - GitHub Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking if Git is installed..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host ""

# Check if already a Git repository
if (Test-Path ".git") {
    Write-Host "✓ This is already a Git repository" -ForegroundColor Green
    $initGit = $false
} else {
    Write-Host "This is not yet a Git repository" -ForegroundColor Yellow
    $response = Read-Host "Do you want to initialize Git? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        git init
        Write-Host "✓ Git repository initialized" -ForegroundColor Green
        $initGit = $true
    } else {
        Write-Host "Skipping Git initialization" -ForegroundColor Yellow
        exit
    }
}

Write-Host ""

# Check for .gitignore
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore file..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.production
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Uploads (local development)
uploads/
backend/uploads/

# Temporary files
*.tmp
*.temp
.cache/

# Testing
coverage/
.nyc_output/

# Misc
*.bak
*.old
"@
    
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✓ .gitignore file created" -ForegroundColor Green
} else {
    Write-Host "✓ .gitignore file already exists" -ForegroundColor Green
}

Write-Host ""

# Check Git status
Write-Host "Checking Git status..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    Write-Host "You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    $response = Read-Host "Do you want to commit all changes? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        git add .
        
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Prepare for deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        git commit -m $commitMessage
        Write-Host "✓ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "✓ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""

# Check for remote
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "✓ Remote 'origin' already configured" -ForegroundColor Green
    $remoteUrl = git remote get-url origin
    Write-Host "  URL: $remoteUrl" -ForegroundColor Cyan
    
    $response = Read-Host "Do you want to push to this remote? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
        git push -u origin main
        Write-Host "✓ Pushed to GitHub" -ForegroundColor Green
    }
} else {
    Write-Host "No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a new repository (private recommended)" -ForegroundColor White
    Write-Host "3. DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
    Write-Host "4. Copy the repository URL" -ForegroundColor White
    Write-Host ""
    
    $repoUrl = Read-Host "Enter your GitHub repository URL (or press Enter to skip)"
    
    if (-not [string]::IsNullOrWhiteSpace($repoUrl)) {
        # Clean up the URL if needed
        $repoUrl = $repoUrl.Trim()
        
        git remote add origin $repoUrl
        Write-Host "✓ Remote 'origin' added" -ForegroundColor Green
        
        # Check if main branch exists, if not create it
        $currentBranch = git branch --show-current
        if ([string]::IsNullOrWhiteSpace($currentBranch)) {
            git checkout -b main
            Write-Host "✓ Created and switched to 'main' branch" -ForegroundColor Green
        } elseif ($currentBranch -ne "main") {
            git branch -M main
            Write-Host "✓ Renamed branch to 'main'" -ForegroundColor Green
        }
        
        Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
        try {
            git push -u origin main
            Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to push to GitHub" -ForegroundColor Red
            Write-Host "You may need to authenticate with GitHub" -ForegroundColor Yellow
            Write-Host "Try running: git push -u origin main" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Skipping remote configuration" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify your code is on GitHub" -ForegroundColor White
Write-Host "2. Follow the DEPLOYMENT_GUIDE.md for deployment steps" -ForegroundColor White
Write-Host "3. Use DEPLOYMENT_CHECKLIST_INTERACTIVE.md to track progress" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
