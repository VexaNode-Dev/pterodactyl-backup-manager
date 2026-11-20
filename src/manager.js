import fs from 'node:fs';
import path from 'node:path';
import { PterodactylClient, DiscordNotifier } from './client.js';

export class BackupManager {
  constructor(config) {
    this.config = config;
    this.client = new PterodactylClient(config.panelUrl, config.apiKey);
  }

  async run() {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `auto-backup-${timestamp}`;

    console.log(`[VexaNode] Starting backup for server ${this.config.serverId}...`);

    try {
      // 1. Create backup on Panel
      const backup = await this.client.createBackup(this.config.serverId, backupName);
      console.log(`[VexaNode] Backup job initiated (UUID: ${backup.uuid}). Polling completion...`);

      // 2. Poll for completion
      let completedBackup = null;
      const maxRetries = 30;
      for (let i = 0; i < maxRetries; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const details = await this.client.getBackupDetails(this.config.serverId, backup.uuid);
        if (details.completed_at) {
          completedBackup = details;
          break;
        }
      }

      if (!completedBackup) {
        throw new Error('Backup creation timed out on the Pterodactyl node.');
      }

      const sizeMB = (completedBackup.bytes / 1024 / 1024).toFixed(2);
      const durationSec = Math.round((Date.now() - startTime) / 1000);
      console.log(`[VexaNode] Backup created successfully (${sizeMB} MB in ${durationSec}s).`);

      // 3. Download if downloadDir is configured
      if (this.config.downloadDir) {
        fs.mkdirSync(this.config.downloadDir, { recursive: true });
        const downloadUrl = await this.client.getDownloadUrl(this.config.serverId, completedBackup.uuid);
        console.log(`[VexaNode] Downloading backup archive locally...`);
        const resp = await fetch(downloadUrl);
        const arrayBuffer = await resp.arrayBuffer();
        const destPath = path.join(this.config.downloadDir, `${backupName}.tar.gz`);
        fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
        console.log(`[VexaNode] Backup saved to: ${destPath}`);
      }

      // 4. Enforce retention limit
      if (this.config.retentionCount && this.config.retentionCount > 0) {
        const allBackups = await this.client.listBackups(this.config.serverId);
        if (allBackups.length > this.config.retentionCount) {
          // Sort oldest first
          allBackups.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          const toDelete = allBackups.slice(0, allBackups.length - this.config.retentionCount);
          for (const oldBackup of toDelete) {
            console.log(`[VexaNode] Pruning older panel backup: ${oldBackup.name} (${oldBackup.uuid})`);
            await this.client.deleteBackup(this.config.serverId, oldBackup.uuid);
          }
        }
      }

      // 5. Discord Webhook notification
      if (this.config.discordWebhook) {
        await DiscordNotifier.send(this.config.discordWebhook, {
          embeds: [{
            title: '✅ Pterodactyl Server Backup Completed',
            description: `Automated backup for server **${this.config.serverId}** completed successfully.`,
            color: 0x10B981,
            fields: [
              { name: 'Backup Name', value: `\`${backupName}\``, inline: true },
              { name: 'Size', value: `\`${sizeMB} MB\``, inline: true },
              { name: 'Duration', value: `\`${durationSec}s\``, inline: true }
            ],
            footer: { text: 'VexaNode Backup Automation • vexanode.gg' },
            timestamp: new Date().toISOString()
          }]
        });
      }

      return { success: true, backupUuid: completedBackup.uuid, sizeMB, durationSec };
    } catch (err) {
      console.error(`[VexaNode] Backup error: ${err.message}`);

      if (this.config.discordWebhook) {
        await DiscordNotifier.send(this.config.discordWebhook, {
          embeds: [{
            title: '❌ Pterodactyl Server Backup Failed',
            description: `An error occurred while creating backup for server **${this.config.serverId}**:\n\`${err.message}\``,
            color: 0xEF4444,
            footer: { text: 'VexaNode Backup Automation • vexanode.gg' },
            timestamp: new Date().toISOString()
          }]
        });
      }

      throw err;
    }
  }
}
