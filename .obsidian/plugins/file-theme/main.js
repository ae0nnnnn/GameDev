/* File Theme Mirror — mirrors the active note's `cssclasses`
   frontmatter onto document.body as `nc-*` classes.
   Example: a note with `cssclasses: [char-lunas]` yields
   `body.nc-char-lunas` while that note is the active file.
   Snippets then style the whole workspace per file.
   Desktop + mobile (plain CommonJS, only stable APIs used). */

const { Plugin, Notice } = require('obsidian');

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
    this.addCommand({
      id: 'diagnose-sky',
      name: 'Diagnose Lunas sky (copies report)',
      callback: async () => {
        const lines = [];
        try {
          lines.push('body classes: ' + document.body.className);
          const view = document.querySelector('.markdown-preview-view.char-lunas');
          lines.push('themed view found: ' + !!view);
          if (view) {
            lines.push('view scrollHeight: ' + view.scrollHeight);
            const cs = getComputedStyle(view, '::before');
            const img = cs.backgroundImage || '';
            lines.push('stars urls: ' + (img.split('url(').length - 1) + ', gradients: ' + (img.split('gradient(').length - 1));
            lines.push('stars animation: ' + cs.animationName);
            const sizer = view.querySelector('.markdown-preview-sizer');
            lines.push('sizer height: ' + (sizer ? Math.round(sizer.getBoundingClientRect().height) : 'none'));
            lines.push('sections: ' + view.querySelectorAll('.markdown-preview-section').length);
            lines.push('paragraphs: ' + view.querySelectorAll('p').length + ', divs: ' + view.querySelectorAll('div').length);
            const low = document.elementFromPoint(Math.round(window.innerWidth / 2), window.innerHeight - 60);
            lines.push('element 60px from bottom: ' + (low ? low.tagName + '.' + String(low.className).split(' ').join('.') : 'none'));
          }
          lines.push('obsidian version: ' + (window.obsidianVersion || 'unknown'));
          let regProp = 'unknown';
          try {
            regProp = (window.CSS && window.CSS.registerProperty) ? 'yes' : 'no';
          } catch (e) {}
          lines.push('CSS.registerProperty (tween support): ' + regProp);
        } catch (e) {
          lines.push('ERROR: ' + e);
        }
        const report = lines.join('\n');
        try {
          await navigator.clipboard.writeText(report);
        } catch (e) {}
        new Notice('Sky report copied — paste it to Luna', 6000);
      },
    });
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
      this.maybeFlash();
    } catch (e) {
      console.warn('file-theme: update failed', e);
    }
  }

  // Pulse a full-viewport wash whenever the active theme changes.
  // CSS alone can't do this: the class swap and Obsidian's own content
  // swap land in the same frame, so no CSS transition ever gets a
  // before/after pair to animate between. WAAPI on our own overlay
  // always runs, above everything, pointer-transparent.
  maybeFlash() {
    try {
      const cur = [];
      document.body.classList.forEach((c) => {
        if (c.indexOf(PREFIX) === 0) cur.push(c);
      });
      cur.sort();
      const key = cur.join(' ');
      const prev = this._lastKey || '';
      this._lastKey = key;
      if (key === prev) return;
      if (key.indexOf(PREFIX) === -1 && prev.indexOf(PREFIX) === -1) return;
      let el = document.getElementById('nc-flash');
      if (!el) {
        el = document.createElement('div');
        el.id = 'nc-flash';
        el.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;opacity:0;'
          + 'background:radial-gradient(circle at 50% 28%, #3b1a5e 0%, #140826 55%, #0d0618 100%);';
        document.body.appendChild(el);
      }
      if (el.getAnimations) el.getAnimations().forEach((a) => a.cancel());
      el.animate(
        [{ opacity: 0 }, { opacity: 0.85, offset: 0.28 }, { opacity: 0 }],
        { duration: 750, easing: 'ease-in-out' }
      );
    } catch (e) {}
  }

  onunload() {
    this.clear();
    this._lastKey = '';
    const el = document.getElementById('nc-flash');
    if (el) el.remove();
  }
}

module.exports = FileThemeMirror;
module.exports.default = FileThemeMirror;
