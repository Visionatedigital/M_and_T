# Quick Setup Guide for ngrok (Temporary Public URL)

## Option 1: Using npx (No Installation Required) ⭐ Recommended

1. **Start your dev server** (in one terminal):
   ```bash
   npm run dev
   ```

2. **Start ngrok** (in another terminal):
   ```bash
   npx -y ngrok http 8080
   ```

3. **Copy the forwarding URL** (looks like `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)
   - This is the public URL you can share with your client!

## Option 2: Manual Installation

1. **Download ngrok:**
   - Visit: https://ngrok.com/download
   - Download the Windows version
   - Extract `ngrok.exe` to a folder (e.g., `C:\ngrok\`)

2. **Add to PATH (optional):**
   - Add the ngrok folder to your system PATH
   - Or use the full path: `C:\ngrok\ngrok.exe http 8080`

3. **Start ngrok:**
   ```bash
   ngrok http 8080
   ```

## Option 3: Using PowerShell Script

Run the provided script:
```powershell
.\start-ngrok.ps1
```

## Alternative: localtunnel (No Sign-up Required)

If ngrok doesn't work, try localtunnel:

```bash
# Start dev server
npm run dev

# In another terminal
npx localtunnel --port 8080
```

## Important Notes

- ⚠️ **Keep both terminals open** - The dev server and ngrok must stay running
- 🔒 **Free ngrok URLs expire** after 2 hours (or restart)
- 💰 **For longer sessions**, sign up for a free ngrok account at https://ngrok.com
- 🌐 **The public URL** will be shown in the ngrok terminal output
- 📱 **Share the HTTPS URL** with your client (not localhost)

## Troubleshooting

- **Port already in use**: Make sure nothing else is using port 8080
- **ngrok not found**: Use `npx -y ngrok http 8080` instead
- **Connection refused**: Ensure your dev server is running first

