# Fenrir | 0xprit3sh

Graph-native threat intelligence platform. 100% browser-based, no backend.

Live: **https://0xprit3sh.xyz/fenrir**

---

## Stack

- Next.js 14 (static export)
- React Flow (graph)
- Zustand (state)
- Dexie/IndexedDB (local storage)
- TanStack Query
- Tailwind CSS

---

## Build & Deploy

### Local (if you have Node)
```bash
npm install
npm run build
# Output: /out directory (static)
```

### Vercel (recommended, mobile-friendly)

1. Fork/push repo to GitHub
2. Go to [vercel.com](https://vercel.com) on your phone
3. Import GitHub repo
4. Set these in Vercel dashboard:
   - **Framework**: Next.js
   - **Build command**: `npm run build`
   - **Output directory**: `out`
5. Deploy

---

## Domain Setup (0xprit3sh.xyz/fenrir)

### Option A: Vercel + Subdomain (simplest)
- Point `fenrir.0xprit3sh.xyz` to Vercel
- Use `basePath: ''` instead of `/fenrir`

### Option B: Cloudflare Pages + Path Routing
1. Deploy to Cloudflare Pages
2. In Cloudflare dashboard → Workers & Pages
3. Add route: `0xprit3sh.xyz/fenrir/*`
4. Or use `_redirects` file:# Fenrir | 0xprit3sh

Graph-native threat intelligence platform. 100% browser-based, no backend.

Live: **https://0xprit3sh.xyz/fenrir**

---

## Stack

- Next.js 14 (static export)
- React Flow (graph)
- Zustand (state)
- Dexie/IndexedDB (local storage)
- TanStack Query
- Tailwind CSS

---

## Build & Deploy

### Local (if you have Node)
```bash
npm install
npm run build
# Output: /out directory (static)
```

### Vercel (recommended, mobile-friendly)

1. Fork/push repo to GitHub
2. Go to [vercel.com](https://vercel.com) on your phone
3. Import GitHub repo
4. Set these in Vercel dashboard:
   - **Framework**: Next.js
   - **Build command**: `npm run build`
   - **Output directory**: `out`
5. Deploy

---

## Domain Setup (0xprit3sh.xyz/fenrir)

### Option A: Vercel + Subdomain (simplest)
- Point `fenrir.0xprit3sh.xyz` to Vercel
- Use `basePath: ''` instead of `/fenrir`

### Option B: Cloudflare Pages + Path Routing
1. Deploy to Cloudflare Pages
2. In Cloudflare dashboard → Workers & Pages
3. Add route: `0xprit3sh.xyz/fenrir/*`
4. Or use `_redirects` file:/fenrir/*  /index.html  200

### Option C: Static files under /fenrir
```bash
npm run build
# Upload /out contents to your server under /fenrir/
```

---

## Mobile-Only Workflow

### Editing from phone
1. Go to your GitHub repo
2. Press `.` to open github.dev editor (web VS Code)
3. Edit files, commit
4. Vercel auto-deploys in ~2 min

### Adding a new scanner
1. Copy `scanners/urlscan.ts` as template
2. Implement `ScannerProvider` interface
3. Add to `scanners/index.ts` SCANNERS array
4. Add API key field in `components/SettingsModal.tsx`

---

## API Keys

Configure in the ⚙ Settings modal inside the app.

| Provider | Free Tier | Get Key |
|----------|-----------|---------|
| VirusTotal | 4 req/min | virustotal.com |
| URLScan.io | Public + key | urlscan.io |
| AbuseIPDB | 1000/day | abuseipdb.com |
| AlienVault OTX | Free | otx.alienvault.com |
| Hatching Triage | Limited free | tria.ge |

Keys are stored in IndexedDB (browser-local only).

---

## Privacy

- Zero telemetry
- No backend
- No data leaves your browser
- API keys in IndexedDB (not localStorage)
- All enrichment calls go directly from your browser to APIs

---

## Updating Fenrir from Phone

1. Open GitHub on mobile browser
2. Navigate to the file to edit
3. Click pencil icon to edit
4. Commit changes
5. Vercel deploys automatically

For larger edits: `github.com/[repo]` → press `.` → full web editor

---

## Features

- 🔍 **Graph Investigation** — IP, domain, URL, hash
- 🕸️ **Node Pivoting** — expand relationships from any node
- 📊 **Risk Scoring** — aggregated across all providers
- 🔌 **6 Intel Sources** — VT, URLScan, AbuseIPDB, OTX, Triage, WebCheck
- 💾 **Local Cases** — save investigations to IndexedDB
- 📤 **Export** — JSON + STIX 2.1 bundle
- 🌙 **Dark Mode** — offensive security aesthetic
- 📱 **Responsive** — works on mobile
