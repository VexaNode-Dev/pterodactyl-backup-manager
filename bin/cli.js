#!/usr/bin/env node

import 'dotenv/config';
import { BackupManager } from '../src/manager.js';

const config = {
  panelUrl: process.env.PTERO_PANEL_URL,
  apiKey: process.env.PTERO_API_KEY,
  serverId: process.env.PTERO_SERVER_ID,
  downloadDir: process.env.BACKUP_DOWNLOAD_DIR,
  retentionCount: parseInt(process.env.BACKUP_RETENTION_COUNT || '3', 10),
  discordWebhook: process.env.DISCORD_WEBHOOK_URL
};

if (!config.panelUrl || !config.apiKey || !config.serverId) {
  console.error('[VexaNode] Missing required environment variables: PTERO_PANEL_URL, PTERO_API_KEY, PTERO_SERVER_ID');
  process.exit(1);
}

const manager = new BackupManager(config);
manager.run()
  .then(() => {
    console.log('[VexaNode] Backup process finished successfully.');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
