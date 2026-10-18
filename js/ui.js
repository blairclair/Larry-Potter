// DOM UI: HUD meters, toasts, interaction prompt, modal panels, journal, racer select.
(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const hud = $('#hud'), prompt = $('#prompt'), toasts = $('#toasts'), wrap = $('#panel-wrap'), panel = $('#panel');
  const UI = (G.UI = {});

  UI.hud = (on, chapter) => {
    hud.classList.toggle('hidden', !on);
    if (chapter != null) $('.hud-chapter').textContent = chapter;
    UI.refresh();
  };
  UI.refresh = () => {
    const S = G.S;
    for (const k of ['trust', 'safety']) {
      const m = hud.querySelector(`[data-k="${k}"]`);
      m.querySelector('i').style.width = S[k] + '%';
      if (k === 'safety') m.querySelector('i').style.backgroundPosition = `${-(100 - S[k]) * 1.3}px 0`;
      m.querySelector('b').textContent = S[k];
    }
    $('.sp-dot').classList.toggle('hidden', !(S.sp.larissa + S.sp.serious > 0));
  };
  UI.prompt = (text) => {
    if (!text) return prompt.classList.add('hidden');
    prompt.innerHTML = text;
    prompt.classList.remove('hidden');
  };

  G.toast = (text, kind = '') => {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.textContent = text;
    toasts.appendChild(el);
    while (toasts.children.length > 6) toasts.firstChild.remove();
    setTimeout(() => el.classList.add('out'), 3200);
    setTimeout(() => el.remove(), 3800);
  };

  // ---- modal panel ----
  let onClose = null;
  UI.open = (html, opts = {}) => {
    if (wrap.classList.contains('hidden')) G.modal++;
    panel.innerHTML = (opts.noClose ? '' : '<button class="close" data-close>Close · Esc</button>') + html;
    wrap.classList.remove('hidden');
    onClose = opts.onClose || null;
    UI.prompt(null);
    return panel;
  };
  UI.close = () => {
    if (wrap.classList.contains('hidden')) return;
    wrap.classList.add('hidden');
    G.modal = Math.max(0, G.modal - 1);
    G.clearInput();
    const cb = onClose;
    onClose = null;
    if (cb) cb();
  };
  UI.isOpen = () => !wrap.classList.contains('hidden');
  panel.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) UI.close(); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && UI.isOpen() && panel.querySelector('[data-close]')) UI.close();
  });

  // ---- journal ----
  const REL = [
    ['serious', 'Serious Bloop', 'Your uncle. Arrested for doing the right thing.'],
    ['fennick', 'Old Fennick', 'The old man Serious defended. Knows more than he says.'],
    ['hermia', 'Hermia Grange', 'Harriers strategist. Her father is in the same prison.'],
    ['ronan', 'Ronan Weasel', 'Harriers mechanic. Jokes when he is scared.'],
  ];
  const relWord = (v) => (v >= 75 ? 'Devoted' : v >= 45 ? 'Close' : v >= 20 ? 'Friendly' : v >= 0 ? 'Wary' : 'Hostile');
  UI.journal = () => {
    const S = G.S;
    const notes = [];
    const F = S.flags;
    if (F.arrested) notes.push('Serious was arrested defending Old Fennick from Death Enforcers.');
    if (F.foughtEnforcers) notes.push('You fought the Enforcers in the street. People saw. So did the regime.');
    if (F.helpedEscape) notes.push('You helped Old Fennick slip away while the Enforcers were busy.');
    if (F.fennickToken) notes.push('Fennick gave you a tarnished brass feather — the mark of the Old Guard.');
    if (F.tornPoster) notes.push('You and Tib tore down an OBEY poster.');
    if (F.promise) notes.push('You promised Serious you would get him out.');
    if (F.defiant) notes.push('You defied the Dark Lord to his face. He seemed... amused.');
    if (F.clever) notes.push('You bargained with the Dark Lord rather than begging.');
    if (F.humble) notes.push('You begged the Dark Lord for mercy. It kept you safe — for now.');
    if (F.guardName) notes.push("Serious's guard is called Pell. He doesn't seem to enjoy the job.");
    notes.push(`Derby record: ${S.wins} win${S.wins === 1 ? '' : 's'} of the 3 needed for Serious's freedom (${S.races} raced).`);
    const html = `
      <h3>Journal</h3>
      <p class="sub">Trust ${S.trust} — how much people stand with you. Safety ${S.safety} — how far you are from the regime's eye. Low Safety brings more Enforcer hazards in the Derby; high Trust brings help from your team.</p>
      <div class="rel-list">${REL.map(([k, n, d]) => {
        const v = S.rel[k] || 0;
        const left = v < 0 ? 50 + v / 2 : 50, w = Math.abs(v) / 2;
        return `<div class="rel"><canvas data-bust="${k}"></canvas><div style="flex:1">
          <div class="rname">${n} <span class="rstate">· ${relWord(v)} (${v})</span></div>
          <div class="rstate">${d}</div>
          <div class="bar"><i style="left:${left}%;width:${w}%;background:${v < 0 ? 'var(--danger)' : '#c78bff'}"></i></div></div></div>`;
      }).join('')}</div>
      <div class="journal-notes">${notes.map((n) => `<p>• ${n}</p>`).join('')}</div>`;
    const p = UI.open(html);
    p.querySelectorAll('[data-bust]').forEach((c) => G.Art.bust(c, c.dataset.bust, null, 72));
  };

  // ---- racer select ----
  UI.racerSelect = (onPick) => {
    const card = (who) => {
      const st = G.Skills.stats(who);
      const c = G.Chars[who];
      return `<button class="card" data-pick="${who}"><canvas data-bust="${who}"></canvas><div>
        <h4>${c.name}</h4>
        <div class="stats"><span>Top speed</span><span>${Math.round(st.maxSpeed)}</span><span>Vitality</span><span>${st.hp}</span>
        <span>Spell power</span><span>${Math.round(st.boltDmg)}${st.twin ? ' ×2' : ''}</span><span>Boost regen</span><span>${st.boostRegen.toFixed(1)}/s</span></div>
        <div class="abil"><kbd>Q</kbd> ${st.qName}${st.eName ? ` &nbsp; <kbd>E</kbd> ${st.eName}` : ' &nbsp; <span style="color:var(--muted)">E — locked</span>'}</div>
      </div></button>`;
    };
    const S = G.S;
    const hazards = S.safety < 40 ? '<b style="color:var(--danger)">Low Safety:</b> the Enforcers have marked you — expect extra hex orbs.' : 'Safety is holding. The Enforcers fly by the (crooked) rules.';
    const help = S.trust >= 60 ? '<b style="color:var(--trust)">High Trust:</b> the crowd is with you — a surge of boost at the halfway mark.' : 'Raise Trust to rally the crowd behind you.';
    const p = UI.open(`<h3>Choose your rider</h3>
      <p class="sub">Derby Round ${S.wins + 1} · Broom tuning +${S.tuning}% · ${hazards} ${help}</p>
      <div class="cards">${card('larissa')}${card('serious')}</div>
      <p class="sub" style="margin-top:16px">Controls: <kbd>W</kbd><kbd>S</kbd> climb/dive · <kbd>D</kbd> accelerate · <kbd>A</kbd> brake · <kbd>Shift</kbd> boost · <kbd>Space</kbd>/click cast · <kbd>Q</kbd> <kbd>E</kbd> abilities. Fly through golden rings for boost.</p>`);
    p.querySelectorAll('[data-bust]').forEach((c) => G.Art.bust(c, c.dataset.bust, 'smile', 150));
    p.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
      G.S.racer = b.dataset.pick;
      UI.close();
      onPick(b.dataset.pick);
    }));
  };
})();
