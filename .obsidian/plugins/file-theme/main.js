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
    // Raw-anchor translator: clicks on plain <a href> tags inside raw
    // HTML (which Obsidian renders but never wires up) resolve exactly
    // like native links. The :not([data-href]) guard means rendered
    // Markdown links can never collide; Reading view only, so editor
    // clicks keep placing the cursor.
    this.registerDomEvent(document, 'click', (e) => this.openRawAnchor(e), true);
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
    let desired = [];
    try {
      const file = this.app.workspace.getActiveFile();
      const cache = file ? this.app.metadataCache.getFileCache(file) : null;
      const classes = cache && cache.frontmatter && cache.frontmatter.cssclasses;
      if (classes) {
        const list = Array.isArray(classes) ? classes : [classes];
        list.forEach((c) => {
          const clean = sanitize(c);
          if (clean) desired.push(PREFIX + clean);
        });
      }
    } catch (e) {
      console.warn('file-theme: update failed', e);
    }
    this.maybeFade(desired);
  }

  applyClasses(desired) {
    try {
      this.clear();
      desired.forEach((c) => document.body.classList.add(c));
    } catch (e) {}
  }

  // Caelestia-style transition, sequenced so the eye never catches
  // mid-state: (1) wipe blooms over the OLD world, classes untouched;
  // (2) at cover point the theme classes swap + text fade is armed,
  // both hidden behind the opaque overlay; (3) overlay melts, revealing
  // an already-themed note whose text fades up. Skipped when nothing
  // themed changed, and entirely under reduced-motion.
  maybeFade(desired) {
    try {
      const key = desired.slice().sort().join(' ');
      const prev = this._lastKey || '';
      const first = !this._started;
      this._started = true;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.applyClasses(desired);
        this._lastKey = key;
        return;
      }
      if (key === prev) return;
      this._lastKey = key;
      if (this._swapTimer) {
        window.clearTimeout(this._swapTimer);
        this._swapTimer = 0;
      }
      const NEW_BG = {
        'nc-char-lunas': 'radial-gradient(circle at 50% 28%, #3b1a5e 0%, #140826 55%, #0d0618 100%)',
      };
      const incoming = NEW_BG[key.split(' ')[0]] || '#1e1e1e';
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
      const coverMs = first ? 680 : 610;
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
      this._swapTimer = window.setTimeout(() => {
        this._swapTimer = 0;
        try {
          this.applyClasses(desired);
          this.fadeText();
        } catch (e) {}
      }, coverMs);
    } catch (e) {}
  }

  // Text fade that actually lands: finds the incoming view by matching
  // the leaf to the active file (never trusts .mod-active mid-switch),
  // retries while the new view renders, and releases on a timer so a
  // paint is guaranteed between hide and show.
  fadeText() {
    try {
      let tries = 0;
      const attempt = () => {
        tries += 1;
        let vc = null;
        try {
          const file = this.app.workspace.getActiveFile();
          if (file) {
            const leaves = [];
            this.app.workspace.iterateAllLeaves((l) => leaves.push(l));
            for (const l of leaves) {
              try {
                if (l.view && l.view.file === file && l.view.containerEl) {
                  vc = l.view.containerEl.querySelector('.view-content');
                  if (vc) break;
                }
              } catch (e) {}
            }
          }
          if (!vc) {
            const active = document.querySelector('.workspace-leaf.mod-active .view-content');
            if (active) vc = active;
          }
        } catch (e) {}
        if (vc) {
          try {
            vc.classList.add('nc-entering');
            void vc.offsetWidth;
            window.setTimeout(() => {
              try { vc.classList.remove('nc-entering'); } catch (e) {}
            }, 80);
          } catch (e) {}
        } else if (tries < 6) {
          window.setTimeout(attempt, 90);
        }
      };
      attempt();
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

  // Resolve a click on a raw-HTML anchor the same way Obsidian
  // resolves its own links. Returns true when handled.
  openRawAnchor(e) {
    try {
      if (e.defaultPrevented) return false;
      if (e.button !== 0 && e.button !== 1) return false;
      const t = e.target && e.target.closest ? e.target.closest('a[href]:not([data-href])') : null;
      if (!t) return false;
      const raw = t.getAttribute('href') || '';
      if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.charAt(0) === '#') return false;
      const reading = t.closest('.markdown-preview-view');
      if (!reading) return false;
      let sourcePath = null;
      try {
        const leaves = [];
        this.app.workspace.iterateAllLeaves((l) => leaves.push(l));
        for (const l of leaves) {
          try {
            if (l.containerEl && l.containerEl.contains(t) && l.view && l.view.file) {
              sourcePath = l.view.file.path;
              break;
            }
          } catch (err) {}
        }
      } catch (err) {}
      if (!sourcePath) {
        try {
          const active = this.app.workspace.getActiveFile();
          if (active) sourcePath = active.path;
        } catch (err) {}
      }
      if (!sourcePath) return false;
      e.preventDefault();
      e.stopPropagation();
      const openInNew = !!(e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1);
      let target = raw;
      try {
        target = decodeURIComponent(raw);
      } catch (err) {}
      this.app.workspace.openLinkText(target, sourcePath, openInNew);
      return true;
    } catch (err) {
      return false;
    }
  }

  onunload() {
    this.clear();
    this._lastKey = '';
    if (this._swapTimer) {
      window.clearTimeout(this._swapTimer);
      this._swapTimer = 0;
    }
    const el = document.getElementById('nc-flash');
    if (el) el.remove();
  }
}

module.exports = FileThemeMirror;
module.exports.default = FileThemeMirror;
