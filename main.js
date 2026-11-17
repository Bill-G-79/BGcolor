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
  default: () => BGcolorPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var BGcolorPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.colorReadErrorShown = false;
  }
  onload() {
    this.registerEvent(
      this.app.workspace.on("file-open", () => {
        void this.refreshOpenNotes();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        void this.refreshOpenNotes();
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", () => {
        void this.refreshOpenNotes();
      })
    );
    this.app.workspace.onLayoutReady(() => {
      void this.refreshOpenNotes();
    });
  }
  onunload() {
    this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
      if (leaf.view instanceof import_obsidian.MarkdownView) this.clearColor(leaf.view);
    });
  }
  async refreshOpenNotes() {
    var _a;
    const noteColors = await this.readMiniNotesColors();
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      if (!(leaf.view instanceof import_obsidian.MarkdownView)) continue;
      const file = leaf.view.file;
      const color = file ? (_a = noteColors[file.path]) != null ? _a : noteColors[file.name] : void 0;
      if (typeof color === "string" && color.trim() !== "") {
        leaf.view.contentEl.addClass("bgcolor-note-content");
        leaf.view.contentEl.style.setProperty("--bgcolor-note-color", color);
      } else {
        this.clearColor(leaf.view);
      }
    }
  }
  clearColor(view) {
    view.contentEl.removeClass("bgcolor-note-content");
    view.contentEl.style.removeProperty("--bgcolor-note-color");
  }
  async readMiniNotesColors() {
    const dataPath = `${this.app.vault.configDir}/plugins/mini-notes/data.json`;
    if (!await this.app.vault.adapter.exists(dataPath)) return {};
    try {
      const data = JSON.parse(await this.app.vault.adapter.read(dataPath));
      return data.noteColors && typeof data.noteColors === "object" ? data.noteColors : {};
    } catch (error) {
      console.error("BGcolor: Could not read Mini Notes color assignments.", error);
      if (!this.colorReadErrorShown) {
        new import_obsidian.Notice("BGcolor: Could not read Mini Notes colors. See the console for details.");
        this.colorReadErrorShown = true;
      }
      return {};
    }
  }
};
