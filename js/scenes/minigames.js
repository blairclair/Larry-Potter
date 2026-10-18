// Hangar minigames: Broom Tuning (timing) and the Old Guard Cipher (sequence memory).
(() => {
  'use strict';
  const { rand, TAU, clamp } = G.U;
  const A = G.Art;

  function backdrop(ctx, t, tint) {
    const g = ctx.createRadialGradient(G.W / 2, G.H / 2, 50, G.W / 2, G.H / 2, 800);
    g.addColorStop(0, tint);
    g.addColorStop(1, '#07050c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, G.W, G.H);
    for (let i = 0; i < 30; i++) {
      const x = (i * 211 + t * 12) % G.W, y = (i * 137 + Math.sin(t + i) * 20) % G.H;
      A.glow(ctx, x, y, 6, 'rgba(255,220,160,.5)', 0.5);
    }
  }
  function title(ctx, a, b) {
    ctx.textAlign = 'center';
    ctx.font = '900 40px Cinzel, serif';
    ctx.fillStyle = '#e8c46a';
    ctx.fillText(a, G.W / 2, 90);
    ctx.font = 'italic 21px "Crimson Pro", serif';
    ctx.fillStyle = '#d7cdb8';
    ctx.fillText(b, G.W / 2, 124);
  }

  // ---------- Broom Tuning ----------
  G.Tuning = function (back) {
    const S = G.S;
    const widen = S.rel.ronan >= 20 ? 1.3 : 1;
    const sc = { round: 0, needle: 0, dir: 1, speed: 0.9, res: [], zone: rand(0.3, 0.7), flash: 0, last: '', done: 0 };
    const PERF = 0.05 * widen, GOOD = 0.15 * widen;
    sc.enter = () => { G.UI.hud(false); G.UI.prompt(null); };
    sc.update = (dt) => {
      sc.flash = Math.max(0, sc.flash - dt);
      if (sc.done) {
        sc.done += dt;
        if (sc.done > 1.8 && !sc.left) {
          sc.left = true;
          const sum = sc.res.reduce((a, b) => a + b, 0);
          S.tuning = sum;
          S.daily.tune = true;
          G.apply({ xpL: 15, xpS: 15, rel: sum >= 8 ? { ronan: 4 } : undefined });
          G.toast(`Broom tuned: +${sum}% top speed next race`, 'good');
          G.go(back);
        }
        return;
      }
      sc.needle += sc.dir * sc.speed * dt;
      if (sc.needle > 1) { sc.needle = 1; sc.dir = -1; }
      if (sc.needle < 0) { sc.needle = 0; sc.dir = 1; }
      if (G.hit('space', 'e', 'enter') || G.mouse.clicked) {
        const d = Math.abs(sc.needle - sc.zone);
        const v = d < PERF / 2 ? 4 : d < GOOD / 2 ? 2 : 0;
        sc.last = v === 4 ? 'PERFECT' : v === 2 ? 'GOOD' : 'MISS';
        sc.res.push(v);
        sc.flash = 0.6;
        sc.round++;
        sc.speed += 0.35;
        sc.zone = rand(0.2, 0.8);
        if (sc.round >= 3) sc.done = 0.001;
      }
    };
    sc.draw = (ctx) => {
      const t = G.t;
      backdrop(ctx, t, '#3a2414');
      title(ctx, 'Broom Tuning', S.rel.ronan >= 20 ? '"Easy does it — feel for the hum." Ronan leans over your shoulder.' : 'Strike when the needle hits the resonance band.');
      // broom on the bench
      ctx.save();
      ctx.translate(G.W / 2 + 40, 330);
      ctx.scale(2.6, 2.6);
      A.line(ctx, [-64, 3, 70, -3], 5.5, '#7a4a22');
      ctx.fillStyle = '#d9b25a';
      ctx.beginPath(); ctx.moveTo(-60, 2); ctx.lineTo(-114, -14); ctx.quadraticCurveTo(-122, 6, -114, 24); ctx.closePath(); ctx.fill();
      A.line(ctx, [-62, -2, -62, 8], 5, '#8a1f1f', false);
      A.glow(ctx, 20, 0, 40 + sc.flash * 60, 'rgba(120,200,255,.6)', 0.5 + 0.3 * Math.sin(t * 6));
      ctx.restore();
      // gauge
      const x0 = 240, w = 800, y = 520;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.beginPath(); ctx.roundRect(x0 - 10, y - 30, w + 20, 60, 14); ctx.fill();
      ctx.fillStyle = 'rgba(120,200,255,.25)';
      ctx.fillRect(x0 + (sc.zone - GOOD / 2) * w, y - 20, GOOD * w, 40);
      ctx.fillStyle = 'rgba(232,196,106,.85)';
      ctx.fillRect(x0 + (sc.zone - PERF / 2) * w, y - 20, PERF * w, 40);
      const nx = x0 + sc.needle * w;
      A.line(ctx, [nx, y - 34, nx, y + 34], 4, '#fff', false);
      A.glow(ctx, nx, y, 30, 'rgba(255,255,255,.6)');
      ctx.textAlign = 'center';
      ctx.font = '600 20px "Crimson Pro", serif';
      ctx.fillStyle = '#d7cdb8';
      ctx.fillText(`Strike ${Math.min(sc.round + 1, 3)} of 3 — Space or click`, G.W / 2, y + 70);
      for (let i = 0; i < 3; i++) {
        const v = sc.res[i];
        A.ell(ctx, G.W / 2 - 40 + i * 40, y + 105, 12, 12, v === 4 ? '#e8c46a' : v === 2 ? '#7ab8ff' : v === 0 ? '#5a2a30' : 'rgba(255,255,255,.1)', 'rgba(255,255,255,.3)');
      }
      if (sc.flash > 0) {
        ctx.globalAlpha = Math.min(1, sc.flash * 2);
        ctx.font = '900 54px Cinzel, serif';
        ctx.fillStyle = sc.last === 'PERFECT' ? '#e8c46a' : sc.last === 'GOOD' ? '#7ab8ff' : '#ff6677';
        ctx.fillText(sc.last, G.W / 2, 440);
        ctx.globalAlpha = 1;
      }
      A.vignette(ctx, 0.5);
    };
    return sc;
  };

  // ---------- Old Guard Cipher ----------
  const RUNE_COL = ['#e8c46a', '#7ab8ff', '#8ef0b0', '#c78bff'];
  function rune(ctx, i, x, y, r, col) {
    ctx.strokeStyle = col;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (i === 0) { ctx.moveTo(x - r * 0.2, y + r * 0.6); ctx.lineTo(x - r * 0.2, y - r * 0.6); ctx.moveTo(x - r * 0.2, y - r * 0.5); ctx.lineTo(x + r * 0.4, y - r * 0.2); ctx.moveTo(x - r * 0.2, y - r * 0.1); ctx.lineTo(x + r * 0.4, y + r * 0.2); }
    else if (i === 1) { ctx.moveTo(x, y - r * 0.6); ctx.lineTo(x + r * 0.45, y); ctx.lineTo(x, y + r * 0.6); ctx.lineTo(x - r * 0.45, y); ctx.closePath(); ctx.moveTo(x, y - r * 0.2); ctx.lineTo(x, y + r * 0.2); }
    else if (i === 2) { ctx.moveTo(x, y + r * 0.6); ctx.lineTo(x, y - r * 0.6); ctx.moveTo(x - r * 0.45, y - r * 0.5); ctx.lineTo(x, y - r * 0.05); ctx.lineTo(x + r * 0.45, y - r * 0.5); }
    else { ctx.arc(x, y, r * 0.5, Math.PI * 0.35, Math.PI * 1.65); ctx.moveTo(x + r * 0.15, y - r * 0.15); ctx.lineTo(x + r * 0.15, y + r * 0.15); }
    ctx.stroke();
  }

  G.Cipher = function (back) {
    const S = G.S;
    const LENS = [4, 5, 6];
    const sc = { round: 0, seq: [], idx: 0, state: 'intro', timer: 1.4, lit: -1, litT: 0, inputAt: 0, result: null, endT: 0 };
    const pos = (i) => ({ x: G.W / 2 - 270 + i * 180, y: 400 });
    const newSeq = () => { sc.seq = Array.from({ length: LENS[sc.round] }, () => (Math.random() * 4) | 0); sc.idx = 0; sc.state = 'show'; sc.timer = 0.6; sc.showI = 0; };
    sc.enter = () => { G.UI.hud(false); G.UI.prompt(null); };
    function press(i) {
      sc.lit = i; sc.litT = 0.25;
      if (i !== sc.seq[sc.idx]) { sc.state = 'end'; sc.result = false; sc.endT = 0; return; }
      sc.idx++;
      if (sc.idx >= sc.seq.length) {
        sc.round++;
        if (sc.round >= LENS.length) { sc.state = 'end'; sc.result = true; sc.endT = 0; }
        else { sc.state = 'pause'; sc.timer = 0.9; }
      }
    }
    sc.update = (dt) => {
      sc.litT -= dt;
      if (sc.litT <= 0) sc.lit = -1;
      if (sc.state === 'intro') { sc.timer -= dt; if (sc.timer <= 0) newSeq(); }
      else if (sc.state === 'pause') { sc.timer -= dt; if (sc.timer <= 0) newSeq(); }
      else if (sc.state === 'show') {
        sc.timer -= dt;
        if (sc.timer <= 0) {
          if (sc.showI >= sc.seq.length) { sc.state = 'input'; return; }
          sc.lit = sc.seq[sc.showI++]; sc.litT = 0.42; sc.timer = 0.62 - sc.round * 0.06;
        }
      } else if (sc.state === 'input') {
        for (let i = 0; i < 4; i++) if (G.hit(String(i + 1))) press(i);
        if (G.mouse.clicked) for (let i = 0; i < 4; i++) { const p = pos(i); if (Math.hypot(G.mouse.x - p.x, G.mouse.y - p.y) < 70) press(i); }
      } else if (sc.state === 'end') {
        sc.endT += dt;
        if (sc.endT > 2 && !sc.left) {
          sc.left = true;
          S.daily.cipher = true;
          if (sc.result) { G.apply({ rel: { fennick: 10 }, trust: 5, xp: 20, flags: { cipherSent: true } }); G.toast('The Old Guard received your message', 'good'); }
          else { G.apply({ safety: -8 }); G.toast('Your message was intercepted by the Ministry', 'bad'); }
          G.go(back);
        }
      }
    };
    sc.draw = (ctx) => {
      const t = G.t;
      backdrop(ctx, t, '#1d2440');
      title(ctx, 'The Old Guard Cipher', 'Hedwiggle the owl waits. Memorise the runes, then repeat them — keys 1–4 or click.');
      for (let i = 0; i < 4; i++) {
        const p = pos(i), on = sc.lit === i;
        if (on) A.glow(ctx, p.x, p.y, 140, RUNE_COL[i], 0.9);
        A.ell(ctx, p.x, p.y, 66, 66, on ? 'rgba(255,255,255,.12)' : 'rgba(10,8,18,.75)', on ? RUNE_COL[i] : 'rgba(255,255,255,.18)', 3);
        rune(ctx, i, p.x, p.y, 70, on ? '#fff' : RUNE_COL[i]);
        ctx.font = '700 16px Cinzel, serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#a99f8a';
        ctx.fillText(String(i + 1), p.x, p.y + 100);
      }
      ctx.textAlign = 'center';
      ctx.font = '600 22px "Crimson Pro", serif';
      ctx.fillStyle = '#d7cdb8';
      const msg = sc.state === 'show' ? 'Watch…' : sc.state === 'input' ? `Your turn — ${sc.idx} / ${sc.seq.length}` : sc.state === 'pause' ? 'Good. Longer now…' : sc.state === 'intro' ? 'Ready…' : '';
      ctx.fillText(msg, G.W / 2, 580);
      for (let i = 0; i < LENS.length; i++) A.ell(ctx, G.W / 2 - 30 + i * 30, 620, 8, 8, i < sc.round ? '#8ef0b0' : 'rgba(255,255,255,.15)');
      if (sc.state === 'end') {
        ctx.font = '900 48px Cinzel, serif';
        ctx.fillStyle = sc.result ? '#8ef0b0' : '#ff6677';
        ctx.fillText(sc.result ? 'MESSAGE SENT' : 'INTERCEPTED', G.W / 2, 250);
      }
      A.vignette(ctx, 0.5);
    };
    return sc;
  };
})();
