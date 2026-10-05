/* File Theme Mirror — mirrors the active note's `cssclasses`
   frontmatter onto document.body as `nc-*` classes.
   Example: a note with `cssclasses: [char-lunas]` yields
   `body.nc-char-lunas` while that note is the active file.
   Snippets then style the whole workspace per file.
   Desktop + mobile (plain CommonJS, only stable APIs used). */

const { Plugin } = require('obsidian');

const PREFIX = 'nc-';

function sanitize(cls) {
  return String(cls).trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
}

class FileThemeMirror extends Plugin {
  async onload() {
    this.registerEvent(this.app.workspace.on('file-open', () => this.update()));
    this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.update()));
    this.registerEvent(this.app.metadataCache.on('changed', () => this.update()));
    this.app.workspace.onLayoutReady(() => this.update());
    this.update();
  }

  clear() {
    const remove = [];
    document.body.classList.forEach((c) => {
      if (c.indexOf(PREFIX) === 0) remove.push(c);
    });
    remove.forEach((c) => document.body.classList.remove(c));
  }

  update() {
    try {
      this.clear();
      const file = this.app.workspace.getActiveFile();
      if (!file) return;
      const cache = this.app.metadataCache.getFileCache(file);
      const classes = cache && cache.frontmatter && cache.frontmatter.cssclasses;
      if (!classes) return;
      const list = Array.isArray(classes) ? classes : [classes];
      list.forEach((c) => {
        const clean = sanitize(c);
        if (clean) document.body.classList.add(PREFIX + clean);
      });
    } catch (e) {
      console.warn('file-theme: update failed', e);
    }
  }

  onunload() {
    this.clear();
  }
}

module.exports = FileThemeMirror;
module.exports.default = FileThemeMirror;
