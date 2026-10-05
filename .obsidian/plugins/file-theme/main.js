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
    // Safety net: if any navigation path doesn't emit an event, the
    // 1.5s poll still converges classes + flash. Idempotent when idle.
    this.registerInterval(window.setInterval(() => this.update(), 1500));
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
          lines.push('last theme key: ' + (this._lastKey || '(none)'));
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
    let oldBg = null;
    try {
      try {
        oldBg = getComputedStyle(document.body).backgroundColor;
      } catch (e) {}
      this.clear();
      const file = this.app.workspace.getActiveFile();
      const cache = file ? this.app.metadataCache.getFileCache(file) : null;
      const classes = cache && cache.frontmatter && cache.frontmatter.cssclasses;
      if (classes) {
        const list = Array.isArray(classes) ? classes : [classes];
        list.forEach((c) => {
          const clean = sanitize(c);
          if (clean) document.body.classList.add(PREFIX + clean);
        });
      }
    } catch (e) {
      console.warn('file-theme: update failed', e);
    }
      this.maybeFade(oldBg);
  }

  // Fade transition between themes: snapshot the outgoing backdrop
  // color, cover the fresh screen with it for one frame, then melt it
  // away to reveal the new note. Reads as a true crossfade. Skipped
  // when nothing themed changed, and entirely under reduced-motion.
  maybeFade(oldBg) {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this._lastKey = this._themeKey();
        return;
      }
      const cur = this._themeKey();
      const prev = this._lastKey || '';
      const first = !this._started;
      this._started = true;
      this._lastKey = cur;
      if (cur === prev) return;
      let color = oldBg;
      if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') color = '#0d0618';
      let el = document.getElementById('nc-flash');
      if (!el) {
        el = document.createElement('div');
        el.id = 'nc-flash';
        el.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;opacity:0;';
        document.body.appendChild(el);
      }
      el.style.background = color;
      el.style.opacity = '1';
      void el.offsetWidth;
      if (el.getAnimations) el.getAnimations().forEach((a) => a.cancel());
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: first ? 900 : 650, easing: 'ease-out' })
        .finished.catch(() => {}).then(() => {
          try {
            if (el.getAnimations && el.getAnimations().length === 0) el.style.opacity = '0';
          } catch (e) {}
        });
    } catch (e) {}
  }

  _themeKey() {
    const cur = [];
    document.body.classList.forEach((c) => {
      if (c.indexOf(PREFIX) === 0) cur.push(c);
    });
    cur.sort();
    return cur.join(' ');
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
