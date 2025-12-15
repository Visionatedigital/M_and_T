# PowerShell script to start ngrok tunnel
# Make sure your dev server is running on port 8080 first

Write-Host "Starting ngrok tunnel to localhost:8080..." -ForegroundColor Green
Write-Host "Your dev server should be running on http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "To install ngrok:" -ForegroundColor Cyan
Write-Host "1. Download from: https://ngrok.com/download" -ForegroundColor White
Write-Host "2. Extract ngrok.exe to a folder in your PATH" -ForegroundColor White
Write-Host "3. Or use: npx ngrok http 8080" -ForegroundColor White
Write-Host ""

# Try using npx first (no installation needed)
try {
    Write-Host "Attempting to start ngrok via npx..." -ForegroundColor Cyan
    npx -y ngrok http 8080
} catch {
    Write-Host "npx ngrok failed. Trying direct ngrok command..." -ForegroundColor Yellow
    try {
        ngrok http 8080
    } catch {
        Write-Host ""
        Write-Host "ERROR: ngrok not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install ngrok:" -ForegroundColor Yellow
        Write-Host "Option 1: Download from https://ngrok.com/download" -ForegroundColor White
        Write-Host "Option 2: Run 'npx -y ngrok http 8080' manually" -ForegroundColor White
        Write-Host ""
        Write-Host "Or use an alternative like:" -ForegroundColor Cyan
        Write-Host "- Cloudflare Tunnel (cloudflared)" -ForegroundColor White
        Write-Host "- localtunnel: npx localtunnel --port 8080" -ForegroundColor White
    }
}

