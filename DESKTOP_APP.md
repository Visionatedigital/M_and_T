# M&T Growth Gateway - Desktop Application

## 🖥️ Desktop Mode (Electron + SQLite)

The M&T Growth Gateway has been transformed from a web application into a **native desktop application** powered by **Electron** and **SQLite**.

### Key Benefits
- **No internet required** — Everything runs locally on your machine
- **No database server needed** — SQLite is embedded, zero-config
- **Fast performance** — Leverages your machine's CPU and memory directly
- **Local data storage** — Your data stays on your machine at `~/Library/Application Support/M&T Growth Gateway/mt_growth.db`
- **Installable** — Distributable as `.dmg` (macOS), `.exe` (Windows), or `.AppImage` (Linux)

---

## 🏗️ Technical Stack

### Frontend
- **Framework:** React 18 (Functional Components, Hooks)
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui + Lucide React icons
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Animations:** tailwindcss-animate + locomotive-scroll

### Desktop Runtime
- **Framework:** Electron (Chromium + Node.js)
- **Database:** SQLite via better-sqlite3 (embedded, no server required)
- **Backend:** Express.js embedded in Electron main process
- **Storage:** Local filesystem (`~/Library/Application Support/M&T Growth Gateway/`)

### Backend (Embedded)
- **Server:** Express.js (runs inside Electron, port 3000)
- **Database:** SQLite with WAL mode, 64MB cache
- **Auth:** Local mock authentication
- **AI Integration:** OpenAI GPT-4o-mini (optional, requires API key)

---

## 🚀 Getting Started

### Development Mode
```bash
# Install dependencies
npm install

# Run the desktop app in development mode
npm run electron:dev
```

### Production Build
```bash
# Build for macOS
npm run electron:build:mac

# Build for Windows
npm run electron:build:win

# Build for all platforms
npm run electron:build
```

### Test Credentials
- **Admin:** admin@example.com (password: `admin123` or `password`)
- **Officer:** officer@example.com (password: `officer123` or `password`)

---

## 📁 Project Structure

```
M_and_T/
├── electron/                # Electron desktop app files
│   ├── main.cjs             # Electron main process (window, menu, lifecycle)
│   ├── preload.cjs           # Secure bridge between Node.js and renderer
│   ├── server.cjs            # Embedded Express server (SQLite-backed)
│   ├── database.cjs          # SQLite database setup, schema, and seeding
│   └── reports.cjs           # Reports router (SQLite queries)
├── src/                     # React frontend (unchanged)
│   ├── components/
│   ├── pages/
│   ├── services/api.ts       # API client (connects to localhost:3000)
│   └── ...
├── server/                  # Original web server (PostgreSQL, kept for reference)
├── electron-builder.config.cjs  # Desktop packaging configuration
├── package.json             # Scripts: electron:dev, electron:build
└── vite.config.ts           # Vite config (base: './' for Electron)
```

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run electron:dev` | Start desktop app in development mode (hot reload) |
| `npm run electron:start` | Start Electron without Vite dev server |
| `npm run electron:build` | Build distributable installer |
| `npm run electron:build:mac` | Build macOS `.dmg` installer |
| `npm run electron:build:win` | Build Windows `.exe` installer |
| `npm run dev` | Start Vite dev server only (web mode) |
| `npm run dev:full` | Start Vite + original PostgreSQL server (web mode) |
| `npm run build` | Build frontend only |

---

## 💾 Database

The SQLite database is stored at:
- **macOS:** `~/Library/Application Support/M&T Growth Gateway/mt_growth.db`
- **Windows:** `%APPDATA%/M&T Growth Gateway/mt_growth.db`
- **Linux:** `~/.config/M&T Growth Gateway/mt_growth.db`

The database is automatically created and seeded with test data on first launch.

### Schema
All tables from the original PostgreSQL schema are preserved:
- `auth_users` (replaces `auth.users`)
- `profiles`
- `user_roles`
- `branches`
- `loan_products`
- `loan_applications`
- `repayments`
- `collateral`
- `conversations`
- `chat_messages`
- And more (territories, branch_performance, product_performance, etc.)
