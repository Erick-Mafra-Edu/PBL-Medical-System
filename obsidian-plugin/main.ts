import { App, Notice, Plugin, PluginSettingTab, Setting, requestUrl } from 'obsidian';

interface SyncSettings {
  apiBaseUrl: string;
  userId: string;
  courseId: string;
  vaultPath: string;
}

const DEFAULT_SETTINGS: SyncSettings = {
  apiBaseUrl: 'http://localhost:3001',
  userId: '',
  courseId: '',
  vaultPath: ''
};

export default class PblObsidianSyncClient extends Plugin {
  settings: SyncSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'pbl-sync-vault-now',
      name: 'Sincronizar vault agora',
      callback: () => this.syncVault()
    });

    this.addCommand({
      id: 'pbl-sync-start-watch',
      name: 'Iniciar monitoramento (watch)',
      callback: () => this.startWatch()
    });

    this.addSettingTab(new SyncSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private resolveVaultPath(): string {
    if (this.settings.vaultPath) return this.settings.vaultPath;
    const adapter: any = this.app.vault.adapter;
    const basePath = adapter?.basePath || '';
    return basePath || '';
  }

  private ensureConfig(): { apiBaseUrl: string; userId: string; courseId: string; vaultPath: string } | null {
    const apiBaseUrl = this.settings.apiBaseUrl.trim();
    const userId = this.settings.userId.trim();
    const courseId = this.settings.courseId.trim();
    const vaultPath = this.resolveVaultPath();

    if (!apiBaseUrl || !userId || !courseId || !vaultPath) {
      new Notice('Configure API base, userId, courseId e vaultPath nas settings.');
      return null;
    }
    return { apiBaseUrl, userId, courseId, vaultPath };
  }

  private async syncVault() {
    const cfg = this.ensureConfig();
    if (!cfg) return;

    try {
      const res = await requestUrl({
        url: `${cfg.apiBaseUrl}/api/sync/vault`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cfg.userId, courseId: cfg.courseId, vaultPath: cfg.vaultPath })
      });
      new Notice(`Vault sincronizado: ${res.status}`);
    } catch (error: any) {
      console.error('syncVault failed', error);
      new Notice('Falha ao sincronizar vault (ver console).');
    }
  }

  private async startWatch() {
    const cfg = this.ensureConfig();
    if (!cfg) return;

    try {
      const res = await requestUrl({
        url: `${cfg.apiBaseUrl}/api/sync/watch/start`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cfg.userId, courseId: cfg.courseId, vaultPath: cfg.vaultPath })
      });
      new Notice(`Watch iniciado: ${res.status}`);
    } catch (error: any) {
      console.error('startWatch failed', error);
      new Notice('Falha ao iniciar watch (ver console).');
    }
  }
}

class SyncSettingTab extends PluginSettingTab {
  plugin: PblObsidianSyncClient;

  constructor(app: App, plugin: PblObsidianSyncClient) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'PBL Obsidian Sync Client' });

    new Setting(containerEl)
      .setName('API Base URL')
      .setDesc('Ex: http://localhost:3001')
      .addText((text) =>
        text
          .setPlaceholder('http://localhost:3001')
          .setValue(this.plugin.settings.apiBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiBaseUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('User ID')
      .addText((text) =>
        text
          .setPlaceholder('user-123')
          .setValue(this.plugin.settings.userId)
          .onChange(async (value) => {
            this.plugin.settings.userId = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Course ID')
      .addText((text) =>
        text
          .setPlaceholder('course-456')
          .setValue(this.plugin.settings.courseId)
          .onChange(async (value) => {
            this.plugin.settings.courseId = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Vault path (opcional)')
      .setDesc('Se vazio, usamos o caminho base do vault detectado pelo Obsidian.')
      .addText((text) =>
        text
          .setPlaceholder('ex: /vault')
          .setValue(this.plugin.settings.vaultPath)
          .onChange(async (value) => {
            this.plugin.settings.vaultPath = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
