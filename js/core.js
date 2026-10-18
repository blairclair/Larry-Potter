// Core: global namespace, rendering surface, input, game state, effects, scene + fade loop.
(() => {
  'use strict';
  const G = (window.G = { W: 1280, H: 720, t: 0, scene: null, modal: 0 });
  const TAU = Math.PI * 2;

  G.U = {
    TAU,
    clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
    lerp: (a, b, t) => a + (b - a) * t,
    rand: (a, b) => a + Math.random() * (b - a),
    pick: (a) => a[(Math.random() * a.length) | 0],
    sign: (n) => (n > 0 ? '+' + n : '' + n),
    seeded(seed) {
      let s = seed >>> 0 || 1;
      return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    },
    // Offscreen canvas in logical units, rendered at the current pixel ratio.
    layer(w, h, paint, pr = G.pr) {
      const c = document.createElement('canvas');
      c.width = Math.ceil(w * pr);
      c.height = Math.ceil(h * pr);
      const x = c.getContext('2d');
      x.scale(pr, pr);
      paint(x, w, h);
      c.lw = w;
      c.lh = h;
      return c;
    },
  };

  // ---- Rendering surface: fixed 1280x720 logical stage, backing store at devicePixelRatio ----
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  G.canvas = canvas;
  G.ctx = ctx;
  G.layerGen = 0;
  function fit() {
    const s = Math.min(innerWidth / G.W, innerHeight / G.H);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    G.scale = s;
    G.pr = s * dpr;
    canvas.width = Math.round(G.W * G.pr);
    canvas.height = Math.round(G.H * G.pr);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
    G.layerGen++; // scenes rebuild cached layers when this changes
  }
  addEventListener('resize', fit);
  fit();

  // ---- Input ----
  G.keys = {};
  G.pressed = {};
  const norm = (k) => (k === ' ' ? 'space' : k.toLowerCase());
  const BLOCK = ['space', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'];
  addEventListener('keydown', (e) => {
    const k = norm(e.key);
    if (!G.keys[k]) G.pressed[k] = true;
    G.keys[k] = true;
    if (BLOCK.includes(k) && !(e.target && e.target.tagName === 'BUTTON' && k === 'space')) e.preventDefault();
  });
  addEventListener('keyup', (e) => (G.keys[norm(e.key)] = false));
  addEventListener('blur', () => (G.keys = {}));
  G.down = (...ks) => ks.some((k) => G.keys[k]);
  G.hit = (...ks) => ks.some((k) => G.pressed[k]);
  G.clearInput = () => {
    G.pressed = {};
    G.mouse.clicked = false;
  };

  G.mouse = { x: 0, y: 0, down: false, clicked: false };
  function mpos(e) {
    const r = canvas.getBoundingClientRect();
    G.mouse.x = ((e.clientX - r.left) / r.width) * G.W;
    G.mouse.y = ((e.clientY - r.top) / r.height) * G.H;
  }
  addEventListener('mousemove', mpos);
  // #ui is pointer-events:none except its interactive children, so canvas clicks land here.
  canvas.addEventListener('mousedown', (e) => {
    mpos(e);
    G.mouse.down = true;
    G.mouse.clicked = true;
  });
  addEventListener('mouseup', () => (G.mouse.down = false));

  // True when the active scene may read gameplay input.
  G.canAct = () => !G.modal && G.fade.target === 0;

  // ---- State ----
  G.newState = () => ({
    v: 1,
    scene: 'market',
    flags: {},
    trust: 50,
    safety: 60,
    rel: { serious: 60, fennick: 0, hermia: 10, ronan: 10 },
    xp: { larissa: 0, serious: 0 },
    sp: { larissa: 2, serious: 2 },
    skills: { larissa: {}, serious: {} },
    wins: 0,
    races: 0,
    tuning: 0,
    daily: { tune: false, cipher: false },
    racer: 'larissa',
  });
  G.S = G.newState();
  const SAVE_KEY = 'larissa_potter_save_v1';
  G.save = () => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.S)); } catch (e) { /* storage unavailable */ }
  };
  G.loadSave = () => {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (d && d.v === 1) return Object.assign(G.newState(), d);
    } catch (e) { /* corrupt or unavailable */ }
    return null;
  };

  const REL_NAMES = { serious: 'Serious', fennick: 'Old Fennick', hermia: 'Hermia', ronan: 'Ronan' };
  G.apply = (fx) => {
    if (!fx) return;
    const S = G.S, U = G.U;
    if (fx.trust) {
      S.trust = U.clamp(S.trust + fx.trust, 0, 100);
      G.toast(`Trust ${U.sign(fx.trust)}`, fx.trust > 0 ? 'good' : 'bad');
    }
    if (fx.safety) {
      S.safety = U.clamp(S.safety + fx.safety, 0, 100);
      G.toast(`Safety ${U.sign(fx.safety)}${fx.safety < 0 ? ' — the regime takes note' : ''}`, fx.safety > 0 ? 'good' : 'bad');
    }
    if (fx.rel) {
      for (const k in fx.rel) {
        const v = fx.rel[k];
        S.rel[k] = U.clamp((S.rel[k] || 0) + v, -100, 100);
        G.toast(`${REL_NAMES[k]} ${v > 0 ? 'will remember that' : "won't forget that"} (${U.sign(v)})`, 'rel');
      }
    }
    if (fx.flags) Object.assign(S.flags, fx.flags);
    if (fx.xp) { G.gainXP('larissa', fx.xp); G.gainXP('serious', fx.xp); }
    if (fx.xpL) G.gainXP('larissa', fx.xpL);
    if (fx.xpS) G.gainXP('serious', fx.xpS);
    G.UI.refresh();
  };
  G.gainXP = (who, n) => {
    const S = G.S;
    S.xp[who] += n;
    while (S.xp[who] >= 100) {
      S.xp[who] -= 100;
      S.sp[who]++;
      G.toast(`${who === 'larissa' ? 'Larissa' : 'Serious'} earned a Skill Point — press K`, 'sp');
    }
    G.UI.refresh();
  };

  // ---- Scenes & fade ----
  G.fade = { a: 1, target: 0, cb: null };
  G.setScene = (s) => {
    if (G.scene && G.scene.exit) G.scene.exit();
    G.scene = s;
    if (s.enter) s.enter();
  };
  G.go = (make) => {
    G.fade.target = 1;
    G.fade.cb = () => {
      G.setScene(typeof make === 'function' ? make() : make);
      G.fade.target = 0;
    };
  };

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    G.t += dt;
    ctx.setTransform(G.pr, 0, 0, G.pr, 0, 0);
    if (G.Dialogue) G.Dialogue.update(dt);
    const s = G.scene;
    if (s) {
      if (s.update) s.update(dt);
      s.draw(ctx);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, G.W, G.H);
    }
    const f = G.fade;
    if (f.a !== f.target) {
      f.a = f.target > f.a ? Math.min(1, f.a + dt * 2.6) : Math.max(0, f.a - dt * 2.2);
      if (f.a === 1 && f.cb) { const cb = f.cb; f.cb = null; cb(); }
    }
    if (f.a > 0) {
      ctx.fillStyle = `rgba(0,0,0,${f.a})`;
      ctx.fillRect(0, 0, G.W, G.H);
    }
    G.clearInput();
    requestAnimationFrame(frame);
  }
  G.start = () => requestAnimationFrame(frame);
})();
