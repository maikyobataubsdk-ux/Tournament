# Booyahesports (Booyahesports.in)
## Free Fire MAX Esports Tournament Platform

Booyahesports is a production-grade, 100% free-entry competitive tournament platform built for Free Fire MAX players and organizers in India.

---

## 🎮 Platform Features & Architecture

### 1. Technology Stack
- **Android App:** Flutter, Dart, Material 3 Dark Esports UI, automated app updates via `/api/v1/app/latest`.
- **Backend API:** Python 3.12, FastAPI, Pydantic, Argon2id & Bcrypt password hashing, session tokens, audit logging.
- **Database:** Atomic, thread-safe, Linux file-locking (`fcntl.flock`) JSON Database Engine (`/app/data/database.json`), automatic corrupt-JSON recovery, and snapshot backups.
- **Public Website & Admin Portal:** Next.js / React, TypeScript, Tailwind CSS, dark gaming aesthetic.
- **Reverse Proxy & Deployment:** Nginx, Docker Compose, Cloudflare DNS / Cloudflare Tunnel.

---

## 📁 Directory Structure
```
├── assets/                  # Platform logo and branding assets
├── backend/                 # FastAPI REST backend and JSON database manager
│   ├── database.py          # Atomic file-locked JSON database engine
│   ├── main.py              # Application entrypoint & static routes
│   ├── schemas.py           # Pydantic models with 8-digit password validator
│   ├── security.py          # Argon2id password hashing & rate limiter
│   └── routers/             # Modular REST routers (auth, tournaments, rooms, results, etc.)
├── web/                     # Next.js Public Website & Web Admin Portal
│   └── src/pages/           # Public pages (/, /download, /tournaments, /privacy, /terms)
│       └── admin/           # Admin modules (players, tournaments, releases, database, settings)
├── mobile/                  # Flutter Android player application
│   └── lib/                 # 5-screen bottom nav, auto-update dialog, room credentials
├── data/                    # Persistent database directory (/app/data/database.json)
│   └── backups/             # Automatic and manual snapshot backups
├── scripts/                 # VPS management and deployment automation
│   ├── setup-domain.sh      # Cloudflare DNS / Tunnel interactive setup wizard
│   ├── deploy.sh            # One-click VPS deployment script
│   ├── update.sh            # Zero-downtime rolling update script
│   ├── backup.sh            # Manual database snapshot script
│   ├── restore.sh           # Verified snapshot restorer
│   └── healthcheck.sh       # Healthcheck validator
├── Dockerfile.backend       # Multi-stage backend container
├── Dockerfile.web           # Multi-stage web container
├── docker-compose.yml       # Production orchestration with persistent volume mounts
└── nginx.conf               # Nginx reverse proxy routing
```

---

## 🔒 Security & Authentication Specification
- **Registration & Login:** Email address (unverified login identifier) and strictly **8-digit numeric password** (e.g., `12345678`).
- **Password Storage:** Salted and hashed using Argon2id/bcrypt. Plaintext passwords and hashes are never exposed via APIs or logs.
- **Brute-Force Defense:** Rate-limiting and temporary account lockout (5 minutes) after 5 consecutive failed attempts.
- **Session Revocation:** Incremental session versioning invalidates previous tokens upon password change or admin reset.
- **Admin Password Privacy:** Admin panel allows password resets, session revocations, and account suspensions without ever viewing player passwords.

---

## 🚀 Quick Deployment Guide on Debian 12 / Ubuntu VPS

### Step 1: Clone and Configure Domain
```bash
# Run domain setup wizard
./scripts/setup-domain.sh
```
The wizard will:
1. Detect your VPS Public IPv4 address.
2. Prompt for your primary domain (`Booyahesports.in`).
3. Offer:
   - **Method A (Cloudflare DNS):** Instructions for creating Cloudflare A (`@`) and CNAME (`www`) records with proxy enabled (orange cloud) and SSL/TLS set to Full (Strict).
   - **Method B (Cloudflare Tunnel):** Prompts for tunnel token and maps your domain directly to local Nginx.
4. Generate the `.env` file automatically.

### Step 2: Deploy Platform
```bash
./scripts/deploy.sh
```

### Step 3: Access Final URLs
- **Public Website:** `https://Booyahesports.in`
- **APK Download:** `https://Booyahesports.in/download`
- **Admin Panel:** `https://Booyahesports.in/admin`
- **API Documentation:** `https://Booyahesports.in/api/docs`
- **Health Check:** `https://Booyahesports.in/api/v1/app/health`

---

## 📦 APK Release & In-App Update System
1. Open Admin Panel -> **APK Releases** (`https://Booyahesports.in/admin/releases`).
2. Upload your signed `.apk` file, enter version name, version code, and release notes.
3. The platform calculates SHA-256 checksums automatically and symlinks `/releases/app-latest.apk`.
4. The Flutter application checks `/api/v1/app/latest` during startup and displays update prompts.

---

## 🛡️ Database Persistence, Backup & Restore
- The database is stored at `/app/data/database.json`.
- All writes are atomic: temporary files are synced to disk with `os.fsync` before replacing the destination via `os.replace`.
- Manual snapshot:
  ```bash
  ./scripts/backup.sh
  ```
- Restore snapshot:
  ```bash
  ./scripts/restore.sh <backup_filename>
  ```
- Corrupted JSON files automatically restore from the latest valid backup upon startup.

---

## ⚖️ Legal & Community Disclaimer
Booyahesports is an independent esports tournament platform operated strictly for recreational and competitive skill gaming. It is 100% free-to-play with zero betting, gambling, or paid entry fees. Booyahesports is not affiliated with, endorsed by, or sponsored by Garena or Free Fire MAX.
