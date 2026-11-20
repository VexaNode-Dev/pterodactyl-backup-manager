export class PterodactylClient {
  constructor(panelUrl, apiKey) {
    if (!panelUrl || !apiKey) {
      throw new Error('Panel URL and API Key are required.');
    }
    this.panelUrl = panelUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.panelUrl}/api/client${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'VexaNode-Backup-Manager/1.0',
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Pterodactyl API error (${res.status} ${res.statusText}): ${errorText}`);
    }

    if (res.status === 204) return null;
    return await res.json();
  }

  async listBackups(serverId) {
    const data = await this.request(`/servers/${serverId}/backups`);
    return (data.data || []).map((item) => item.attributes);
  }

  async createBackup(serverId, name) {
    const data = await this.request(`/servers/${serverId}/backups`, {
      method: 'POST',
      body: JSON.stringify({ name, is_locked: false })
    });
    return data.attributes;
  }

  async getBackupDetails(serverId, backupUuid) {
    const data = await this.request(`/servers/${serverId}/backups/${backupUuid}`);
    return data.attributes;
  }

  async getDownloadUrl(serverId, backupUuid) {
    const data = await this.request(`/servers/${serverId}/backups/${backupUuid}/download`);
    return data.attributes.url;
  }

  async deleteBackup(serverId, backupUuid) {
    await this.request(`/servers/${serverId}/backups/${backupUuid}`, {
      method: 'DELETE'
    });
    return true;
  }
}

export class DiscordNotifier {
  static async send(webhookUrl, payload) {
    if (!webhookUrl) return;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn(`[VexaNode Backup] Failed to dispatch Discord notification: ${err.message}`);
    }
  }
}
