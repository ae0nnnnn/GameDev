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
    this.registerDomEvent(document, 'mousedown', (e) => {
      this._clickX = e.clientX;
      this._clickY = e.clientY;
    });
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

  // Caelestia-style transition: the incoming theme blooms out of a
  // circle (from the last click, else screen center) over the old
  // screen, then melts away to reveal the new note — whose text fades
  // up at the same time. Skipped when nothing themed changed, and
  // entirely under reduced-motion.
  maybeFade(oldBg) {
    void oldBg;
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
      const NEW_BG = {
        'nc-char-lunas': 'radial-gradient(circle at 50% 28%, #3b1a5e 0%, #140826 55%, #0d0618 100%)',
      };
      const incoming = NEW_BG[cur.split(' ')[0]] || '#1e1e1e';
      const x = (typeof this._clickX === 'number') ? Math.round(this._clickX) : Math.round(window.innerWidth / 2);
      const y = (typeof this._clickY === 'number') ? Math.round(this._clickY) : Math.round(window.innerHeight / 2);
      const start = 'circle(0% at ' + x + 'px ' + y + 'px)';
      const end = 'circle(150% at ' + x + 'px ' + y + 'px)';
      let el = document.getElementById('nc-flash');
      if (!el) {
        el = document.createElement('div');
        el.id = 'nc-flash';
        el.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;opacity:1;';
        document.body.appendChild(el);
      }
      el.style.background = incoming;
      el.style.clipPath = start;
      if ('webkitClipPath' in el.style) el.style.webkitClipPath = start;
      void el.offsetWidth;
      if (el.getAnimations) el.getAnimations().forEach((a) => a.cancel());
      const seq = (this._flashSeq || 0) + 1;
      this._flashSeq = seq;
      const anim = el.animate(
        [
          { clipPath: start, opacity: 1, offset: 0 },
          { clipPath: end, opacity: 1, offset: 0.72 },
          { clipPath: end, opacity: 0, offset: 1 },
        ],
        { duration: first ? 950 : 850, easing: 'ease-out', fill: 'forwards' }
      );
      const done = () => {
        try {
          if (this._flashSeq === seq) {
            const cur2 = document.getElementById('nc-flash');
            if (cur2) cur2.remove();
          }
        } catch (e) {}
      };
      if (anim && anim.finished) anim.finished.then(done).catch(() => {});
      else window.setTimeout(done, 950);
      try {
        const vc = document.querySelector('.workspace-leaf.mod-active .view-content');
        if (vc) {
          vc.classList.add('nc-entering');
          void vc.offsetWidth;
          window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
            try { vc.classList.remove('nc-entering'); } catch (e) {}
          }));
        }
      } catch (e) {}
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
