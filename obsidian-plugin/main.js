"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => PblObsidianSyncClient
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  apiBaseUrl: "http://localhost:3001",
  userId: "",
  courseId: "",
  vaultPath: ""
};
var PblObsidianSyncClient = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "pbl-sync-vault-now",
      name: "Sincronizar vault agora",
      callback: () => this.syncVault()
    });
    this.addCommand({
      id: "pbl-sync-start-watch",
      name: "Iniciar monitoramento (watch)",
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
  resolveVaultPath() {
    if (this.settings.vaultPath)
      return this.settings.vaultPath;
    const adapter = this.app.vault.adapter;
    const basePath = adapter?.basePath || "";
    return basePath || "";
  }
  ensureConfig() {
    const apiBaseUrl = this.settings.apiBaseUrl.trim();
    const userId = this.settings.userId.trim();
    const courseId = this.settings.courseId.trim();
    const vaultPath = this.resolveVaultPath();
    if (!apiBaseUrl || !userId || !courseId || !vaultPath) {
      new import_obsidian.Notice("Configure API base, userId, courseId e vaultPath nas settings.");
      return null;
    }
    return { apiBaseUrl, userId, courseId, vaultPath };
  }
  async syncVault() {
    const cfg = this.ensureConfig();
    if (!cfg)
      return;
    try {
      const res = await (0, import_obsidian.requestUrl)({
        url: `${cfg.apiBaseUrl}/api/sync/vault`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: cfg.userId, courseId: cfg.courseId, vaultPath: cfg.vaultPath })
      });
      new import_obsidian.Notice(`Vault sincronizado: ${res.status}`);
    } catch (error) {
      console.error("syncVault failed", error);
      new import_obsidian.Notice("Falha ao sincronizar vault (ver console).");
    }
  }
  async startWatch() {
    const cfg = this.ensureConfig();
    if (!cfg)
      return;
    try {
      const res = await (0, import_obsidian.requestUrl)({
        url: `${cfg.apiBaseUrl}/api/sync/watch/start`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: cfg.userId, courseId: cfg.courseId, vaultPath: cfg.vaultPath })
      });
      new import_obsidian.Notice(`Watch iniciado: ${res.status}`);
    } catch (error) {
      console.error("startWatch failed", error);
      new import_obsidian.Notice("Falha ao iniciar watch (ver console).");
    }
  }
};
var SyncSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "PBL Obsidian Sync Client" });
    new import_obsidian.Setting(containerEl).setName("API Base URL").setDesc("Ex: http://localhost:3001").addText(
      (text) => text.setPlaceholder("http://localhost:3001").setValue(this.plugin.settings.apiBaseUrl).onChange(async (value) => {
        this.plugin.settings.apiBaseUrl = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("User ID").addText(
      (text) => text.setPlaceholder("user-123").setValue(this.plugin.settings.userId).onChange(async (value) => {
        this.plugin.settings.userId = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Course ID").addText(
      (text) => text.setPlaceholder("course-456").setValue(this.plugin.settings.courseId).onChange(async (value) => {
        this.plugin.settings.courseId = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Vault path (opcional)").setDesc("Se vazio, usamos o caminho base do vault detectado pelo Obsidian.").addText(
      (text) => text.setPlaceholder("ex: /vault").setValue(this.plugin.settings.vaultPath).onChange(async (value) => {
        this.plugin.settings.vaultPath = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
