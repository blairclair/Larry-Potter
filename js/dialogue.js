// Branching dialogue. A script is a map of node id -> node:
//   { who, mood, name, text, next, choices:[{t, tag, fx, next, if, lock, run}], fx, run, branch }
// `who` is a G.Chars key (omit for narration). `branch(S)` reroutes without showing the node.
// `lock(S)` returns a reason string to show a choice as unavailable.
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const box = $('#dialogue'), nameEl = $('.dlg-name'), textEl = $('.dlg-text'), choicesEl = $('.dlg-choices');
  const more = $('.dlg-more'), portrait = $('#portrait'), pwrap = $('.dlg-portrait');
  const D = (G.Dialogue = { active: false });
  let redraw = 0;

  D.play = (script, start = 'start', done) => {
    D.script = script;
    D.done = done;
    if (!D.active) { D.active = true; G.modal++; }
    box.classList.remove('hidden');
    G.UI.prompt(null);
    D.go(start);
  };

  D.go = (id) => {
    if (typeof id === 'function') id = id(G.S);
    if (!id || id === 'end') return D.end();
    const n = D.script[id];
    if (!n) { console.warn('dialogue: missing node', id); return D.end(); }
    D.node = n;
    if (n.fx) G.apply(n.fx);
    if (n.run) n.run(G.S);
    if (n.branch) return D.go(n.branch(G.S));
    const c = n.who && G.Chars[n.who];
    nameEl.textContent = n.name || (c ? c.name : '');
    pwrap.classList.toggle('none', !c);
    if (c) G.Art.bust(portrait, n.who, n.mood);
    D.full = typeof n.text === 'function' ? n.text(G.S) : n.text;
    textEl.classList.toggle('narr', !c);
    textEl.textContent = '';
    choicesEl.innerHTML = '';
    more.classList.add('hidden');
    D.shown = 0;
    D.typing = true;
  };

  D.finishTyping = () => {
    D.typing = false;
    textEl.textContent = D.full;
    const n = D.node;
    if (!n.choices) { more.classList.remove('hidden'); return; }
    D.opts = n.choices.filter((ch) => !ch.if || ch.if(G.S));
    choicesEl.innerHTML = '';
    D.opts.forEach((ch, i) => {
      const b = document.createElement('button');
      const reason = ch.lock && ch.lock(G.S);
      b.innerHTML = `<span class="n">${i + 1}.</span><span>${ch.t}${reason ? ` <i style="color:var(--muted)">(${reason})</i>` : ''}</span>${ch.tag ? `<span class="tag ${ch.tag}">${ch.tag}</span>` : ''}`;
      if (reason) { b.disabled = true; b.style.opacity = 0.45; b.style.cursor = 'not-allowed'; }
      b.addEventListener('click', (e) => { e.stopPropagation(); if (!reason) D.choose(ch); });
      choicesEl.appendChild(b);
    });
  };

  D.advance = () => {
    if (!D.active) return;
    if (D.typing) return D.finishTyping();
    if (D.node.choices) return;
    D.go(D.node.next);
  };

  D.choose = (ch) => {
    G.apply(ch.fx);
    if (ch.run) ch.run(G.S);
    D.go(ch.next);
  };

  D.end = () => {
    box.classList.add('hidden');
    D.active = false;
    G.modal = Math.max(0, G.modal - 1);
    G.clearInput();
    const d = D.done;
    D.done = null;
    if (d) d();
  };

  D.update = (dt) => {
    if (!D.active) return;
    if (D.typing) {
      D.shown += dt * 75;
      textEl.textContent = D.full.slice(0, D.shown | 0);
      if (D.shown >= D.full.length) D.finishTyping();
    }
    redraw += dt;
    if (redraw > 0.12 && D.node && D.node.who && G.Chars[D.node.who]) { redraw = 0; G.Art.bust(portrait, D.node.who, D.node.mood); }
    if (G.UI.isOpen()) return;
    if (G.hit('space', 'enter', 'e')) D.advance();
    else if (!D.typing && D.opts && D.node.choices) {
      for (let i = 0; i < D.opts.length; i++) {
        const ch = D.opts[i];
        if (G.hit(String(i + 1)) && !(ch.lock && ch.lock(G.S))) { D.choose(ch); break; }
      }
    }
  };

  box.addEventListener('click', (e) => { if (!e.target.closest('button')) D.advance(); });
})();
