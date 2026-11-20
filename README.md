# Pterodactyl Panel Automated Backup Manager

A lightweight, automated backup manager for **Pterodactyl Panel** game and bot servers. Automatically triggers server backups via the Client API, downloads archives locally or offsite, enforces strict retention rotation limits, and reports status via Discord Webhooks.

[![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen.svg?logo=node.js&logoColor=white)](https://nodejs.org)
[![Pterodactyl](https://img.shields.io/badge/Pterodactyl-v1.x-blue.svg)](https://pterodactyl.io)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Hosting](https://img.shields.io/badge/Powered%20By-VexaNode-06b6d4.svg)](https://vexanode.gg)

---

## ⚡ Highlights

- **Panel API Driven:** Creates native Pterodactyl backups cleanly without requiring SSH or root access to the node.
- **Automated Retention Pruning:** Prevents hitting panel backup quota limits by auto-deleting oldest backups once threshold is exceeded.
- **Offsite Archival:** Automatically downloads `.tar.gz` archives locally, to external storage, or network volumes.
- **Discord Alerts:** Rich embed notifications for backup success (size, duration) and failure.
- **Cron & Docker Ready:** Run as a scheduled cron job or containerized daemon.

---

## 🚀 Quick Setup

### 1. Installation
```bash
git clone https://github.com/VexaNode-Dev/pterodactyl-backup-manager.git
cd pterodactyl-backup-manager
npm install
```

### 2. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```ini
PTERO_PANEL_URL=https://panel.vexanode.gg
PTERO_API_KEY=ptlc_your_client_api_key
PTERO_SERVER_ID=ab12cd34
BACKUP_DOWNLOAD_DIR=./backups
BACKUP_RETENTION_COUNT=3
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### 3. Run Manually
```bash
npm start
```

---

## ⏰ Cron Job Scheduling

To run automated backups every day at 03:00 AM, add a crontab entry:
```bash
0 3 * * * cd /path/to/pterodactyl-backup-manager && /usr/bin/npm start >> /var/log/ptero-backup.log 2>&1
```

---

## 🐳 Running with Docker

Run directly using Docker:
```bash
docker build -t pterodactyl-backup-manager .
docker run --rm --env-file .env -v $(pwd)/backups:/app/backups pterodactyl-backup-manager
```

---

## 🌐 Optimized for VexaNode Game & Bot Hosting

Built for server owners running workloads on **[VexaNode](https://vexanode.gg)**. Enjoy zero-downtime automated offsite backups protecting your Discord bots, Minecraft worlds, and application data.

---

## 📜 License

MIT License. Developed by [VexaNode-Dev](https://github.com/VexaNode-Dev).
Community Discord: [discord.gg/devz](https://discord.gg/devz)
