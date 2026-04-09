# Deploying on a DigitalOcean droplet (straight setup)

One **Ubuntu** droplet runs **Node** (Express API + static `dist/`) and **nginx** in front for HTTPS. The database stays on **Supabase** (`DATABASE_URL`).

## 1. Create the droplet

- DigitalOcean → **Droplets** → **Create** → **Ubuntu 22.04 or 24.04 LTS**.
- Choose size (e.g. **1 GB RAM** minimum for Node + nginx; scale up if needed).
- Add your **SSH key**, create droplet, note the **public IP**.

## 2. DNS

- In your domain registrar, add an **A record**: `your-domain.com` → droplet **IP** (and `www` if you want).

## 3. First login and firewall

```bash
ssh root@YOUR_DROPLET_IP
apt update && apt upgrade -y
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

## 4. Install Node.js (LTS), nginx, Certbot, PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2
```

## 5. Deploy the app

Use a deploy user (optional but recommended):

```bash
adduser mtapp
usermod -aG sudo mtapp
# log in as mtapp or stay root for a quick test
```

Clone and install:

```bash
cd /var/www   # or /home/mtapp
git clone https://github.com/Visionatedigital/M_and_T.git mt-growth-gateway
cd mt-growth-gateway
npm ci
```

Create **`.env`** in the project root (same folder as `package.json`):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:6543/postgres?sslmode=require
JWT_SECRET=use-a-long-random-string-here
PORT=3000
```

- **DATABASE_URL:** Supabase → **Project Settings → Database** → use the **connection pooler** URI (port **6543** is typical).  
- **JWT_SECRET:** any long random string; keep it stable across restarts.

Build the **browser** so it calls **your public HTTPS URL** (same domain nginx will use):

```bash
export VITE_USE_SUPABASE=true
export VITE_REMOTE_API_URL=https://your-domain.com
npm run build
```

This creates `dist/` and makes the SPA talk to `https://your-domain.com/api`.

Start the API + static files with **PM2**:

```bash
pm2 start server/index.cjs --name mt-gateway
pm2 save
pm2 startup
# run the command PM2 prints so the app restarts after reboot
```

Check: `curl -s http://127.0.0.1:3000/health` should return JSON `{"status":"ok",...}`.

## 6. nginx reverse proxy

Put the site behind nginx and terminate TLS with Let’s Encrypt.

```bash
nano /etc/nginx/sites-available/mt-gateway
```

Example (replace `your-domain.com`):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 25m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
ln -sf /etc/nginx/sites-available/mt-gateway /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Issue certificates:

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will adjust nginx for HTTPS. After this, open **https://your-domain.com** — you should see the marketing site; **https://your-domain.com/#/staff-login** for staff.

## 7. Updates (redeploy)

```bash
cd /var/www/mt-growth-gateway
git pull
npm ci
export VITE_USE_SUPABASE=true
export VITE_REMOTE_API_URL=https://your-domain.com
npm run build
pm2 restart mt-gateway
```

**`VITE_REMOTE_API_URL` must be your real public site origin** (the same URL users type in the browser), e.g. `https://mandtmicrofinance.com`. It is **not** an email address; if you set something like `https://...@gmail.com`, the built SPA will call the wrong API host.

If PM2 error logs show `PathError` / `originalPath: '*'` at `server/index.cjs`, the deployed code is outdated: current `server/index.cjs` avoids `app.get('*')` (incompatible with Express 5). Run `git pull` and redeploy so `server/index.cjs` matches the repo.

## Architecture summary

| Piece | Role |
|-------|------|
| **Supabase** | Postgres (`DATABASE_URL`) |
| **Node (`server/index.cjs`)** | `/api/*`, `/uploads`, static `dist/` after `npm run build` |
| **nginx** | HTTPS, proxy to port **3000** |
| **PM2** | Keeps Node running, restart on boot |

## Health check

- `GET https://your-domain.com/health` → JSON ok  
- Log in at **Staff Portal**, open **Loan Applications** — data should load from Supabase.

## Electron vs browser

- **Browser:** `/` shows the public homepage.  
- **Electron desktop app:** still opens **staff login** when `window.electronAPI` exists.
