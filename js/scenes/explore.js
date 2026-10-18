// Walkable side-on "street" scene: character control, NPC interaction, scripted
// movement for cutscenes, and real-time spell combat.
(() => {
  'use strict';
  const { clamp, rand } = G.U;

  function stepGoal(e, dt) {
    const g = e.goal;
    if (!g) return false;
    const gy = g.y ?? e.y, dx = g.x - e.x, dy = gy - e.y, d = Math.hypot(dx, dy), sp = (g.speed || 160) * dt;
    if (d <= sp) {
      e.x = g.x; e.y = gy; e.goal = null; e.moving = false;
      if (g.face) e.face = g.face;
      if (g.done) g.done();
      return true;
    }
    e.x += (dx / d) * sp;
    e.y += (dy / d) * sp;
    e.moving = true;
    e.walk = (e.walk || 0) + dt * 10;
    if (Math.abs(dx) > 1) e.face = Math.sign(dx);
    return true;
  }

  G.Explore = function (cfg) {
    const A = G.Art;
    const sc = { cfg, camX: 0, bolts: [], parts: [], enemies: [], combat: false, shake: 0, cut: false, allowMenus: true, near: null, camFocus: null };
    const P = (sc.player = { key: 'larissa', x: cfg.start.x, y: cfg.start.y, face: 1, walk: 0, moving: false, hp: 6, maxHp: 6, inv: 0, dash: 0, dcool: 0, cool: 0, cast: 0 });
    sc.follower = cfg.follower ? { key: cfg.follower, x: P.x - 80, y: P.y - 18, face: 1, walk: 0, moving: false } : null;
    sc.npcs = cfg.npcs || [];
    sc.camX = clamp(P.x - G.W / 2, 0, cfg.width - G.W);
    sc.goal = stepGoal;
    let lastPrompt = null;

    const depth = (y) => 1.04 + ((y - cfg.yMin) / (cfg.yMax - cfg.yMin)) * 0.22;
    const burst = (x, y, col, n = 10, sp = 160) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = rand(sp * 0.3, sp);
        sc.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: rand(0.3, 0.7), max: 0.7, col, r: rand(1.5, 3.5) });
      }
    };
    sc.burst = burst;

    sc.startCombat = (enemies) => {
      sc.enemies = enemies.map((e) => Object.assign({ key: 'enforcer', face: -1, walk: 0, hp: 4, cool: rand(1, 2), range: rand(200, 300), hurt: 0, cast: 0 }, e));
      sc.combat = true;
      P.hp = P.maxHp;
      G.toast('Combat! Space / click to cast · Shift to dodge', 'bad');
    };

    sc.enter = () => {
      G.UI.hud(true, cfg.chapter);
      G.S.scene = cfg.id;
      G.save();
      if (cfg.enter) cfg.enter(sc);
    };
    sc.exit = () => G.UI.prompt(null);

    function fire() {
      const sx = P.x - sc.camX;
      if (G.mouse.clicked && Math.abs(G.mouse.x - sx) > 10) P.face = Math.sign(G.mouse.x - sx);
      sc.bolts.push({ x: P.x + P.face * 40, y: P.y, vx: P.face * 900, from: 'p', life: 1.1, col: '#9fd8ff' });
      P.cool = 0.32;
      P.cast = 0.25;
    }

    sc.update = (dt) => {
      const act = G.canAct() && !sc.cut;
      // player
      P.inv -= dt; P.cool -= dt; P.dcool -= dt; P.cast -= dt;
      if (P.downT != null) P.downT += dt;
      if (P.goal) stepGoal(P, dt);
      else if (act && !(sc.combat && P.hp <= 0)) {
        const mx = (G.down('d', 'arrowright') ? 1 : 0) - (G.down('a', 'arrowleft') ? 1 : 0);
        const my = (G.down('s', 'arrowdown') ? 1 : 0) - (G.down('w', 'arrowup') ? 1 : 0);
        if (P.dash > 0) {
          P.dash -= dt;
          P.x += P.dashDir * 640 * dt;
          if (Math.random() < 0.6) burst(P.x, P.y - 4, 'rgba(200,190,170,.7)', 1, 60);
        } else {
          const l = Math.hypot(mx, my) || 1;
          P.x += (mx / l) * 235 * dt;
          P.y += (my / l) * 235 * 0.62 * dt;
        }
        P.moving = !!(mx || my) || P.dash > 0;
        if (mx) P.face = mx;
        if (P.moving) P.walk += dt * 11;
        if (sc.combat) {
          if (G.hit('shift', 'k') && P.dcool <= 0) { P.dash = 0.22; P.dashDir = mx || P.face; P.inv = Math.max(P.inv, 0.34); P.dcool = 0.6; }
          if ((G.hit('space', 'j', 'f') || G.mouse.clicked) && P.cool <= 0) fire();
        } else if (G.hit('e') && sc.near) {
          G.UI.prompt(null); lastPrompt = null;
          sc.near.talk(sc, sc.near);
        }
      } else P.moving = false;
      P.x = clamp(P.x, 40, cfg.width - 40);
      P.y = clamp(P.y, cfg.yMin, cfg.yMax);

      // follower
      const F = sc.follower;
      if (F) {
        if (!stepGoal(F, dt) && !F.held) {
          const tx = clamp(P.x - P.face * 80, 40, cfg.width - 40), ty = clamp(P.y - 22, cfg.yMin, cfg.yMax);
          const dx = tx - F.x, dy = ty - F.y, d = Math.hypot(dx, dy);
          if (d > 30) {
            const sp = Math.min(250, d * 3) * dt;
            F.x += (dx / d) * sp; F.y += (dy / d) * sp;
            F.moving = true; F.walk += dt * 10;
            if (Math.abs(dx) > 4) F.face = Math.sign(dx);
          } else { F.moving = false; F.face = Math.sign(P.x - F.x) || 1; }
        }
      }

      // npcs
      sc.near = null;
      let best = 1e9;
      for (const n of sc.npcs) {
        if (n.hidden) continue;
        stepGoal(n, dt);
        if (!n.goal && !n.fixedFace && Math.abs(P.x - n.x) < 200) n.face = Math.sign(P.x - n.x) || n.face;
        if (n.talk && act && !sc.combat) {
          const dx = Math.abs(P.x - n.x), dy = Math.abs(P.y - n.y);
          if (dx < (n.r || 90) && dy < 105 && dx < best) { best = dx; sc.near = n; }
        }
      }
      const pr = sc.near ? `<kbd>E</kbd> ${sc.near.label}` : null;
      if (pr !== lastPrompt) { G.UI.prompt(pr); lastPrompt = pr; }

      // enemies
      for (const e of sc.enemies) {
        e.hurt -= dt; e.cast -= dt;
        if (e.down) { e.downT = (e.downT || 0) + dt; continue; }
        if (stepGoal(e, dt)) continue;
        if (!sc.combat || G.modal) { e.moving = false; continue; }
        const dx = P.x - e.x;
        e.face = Math.sign(dx) || 1;
        const wx = P.x - Math.sign(dx || 1) * e.range;
        const mx = wx - e.x, my = P.y - e.y, d = Math.hypot(mx, my);
        if (d > 12) { e.x += (mx / d) * 125 * dt; e.y += (my / d) * 95 * dt; e.moving = true; e.walk += dt * 9; } else e.moving = false;
        e.cool -= dt;
        if (Math.abs(my) < 40 && Math.abs(dx) < 560 && e.cool <= 0 && P.hp > 0) {
          sc.bolts.push({ x: e.x + e.face * 40, y: e.y, vx: e.face * 470, from: 'e', life: 2, col: '#ff3344' });
          e.cool = rand(1.3, 2.3) * (G.S.safety < 40 ? 0.8 : 1);
          e.cast = 0.3;
        }
        e.y = clamp(e.y, cfg.yMin, cfg.yMax);
      }

      // bolts
      for (const b of sc.bolts) {
        b.x += b.vx * dt;
        b.life -= dt;
        if (Math.random() < 0.7) sc.parts.push({ x: b.x, y: b.y, vx: -b.vx * 0.05, vy: rand(-20, 20), life: 0.25, max: 0.25, col: b.col, r: 2.2, lift: true });
        if (b.from === 'p') {
          for (const e of sc.enemies) {
            if (e.down || Math.abs(b.x - e.x) > 26 || Math.abs(b.y - e.y) > 34) continue;
            e.hp--; e.hurt = 0.2; e.x += Math.sign(b.vx) * 18; b.life = 0;
            burst(b.x, b.y - 95, '#9fd8ff', 12);
            if (e.hp <= 0) { e.down = true; e.downT = 0; burst(e.x, e.y - 60, '#ff3344', 18, 220); sc.shake = 0.2; }
            break;
          }
        } else if (P.inv <= 0 && P.hp > 0 && Math.abs(b.x - P.x) < 24 && Math.abs(b.y - P.y) < 32) {
          P.hp--; P.inv = 0.9; b.life = 0; sc.shake = 0.3;
          burst(b.x, b.y - 95, '#ff3344', 14);
        }
      }
      sc.bolts = sc.bolts.filter((b) => b.life > 0);
      for (const p of sc.parts) { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.lift) p.vy += 300 * dt; p.life -= dt; }
      sc.parts = sc.parts.filter((p) => p.life > 0);

      if (sc.combat) {
        if (sc.enemies.every((e) => e.down)) { sc.combat = false; cfg.onCombat && cfg.onCombat(sc, true); }
        else if (P.hp <= 0) { sc.combat = false; P.downT = 0; cfg.onCombat && cfg.onCombat(sc, false); }
      }

      // triggers
      if (act && cfg.triggers) for (const tr of cfg.triggers) if (!tr.fired && P.x > tr.x && (!tr.if || tr.if(G.S))) { tr.fired = true; tr.run(sc); }
      if (cfg.update) cfg.update(sc, dt);

      // camera
      const focus = sc.camFocus ?? P.x + P.face * 60;
      const tx = clamp(focus - G.W / 2, 0, cfg.width - G.W);
      sc.camX += (tx - sc.camX) * (1 - Math.exp(-dt * 4));
      sc.shake = Math.max(0, sc.shake - dt);

      if (sc.allowMenus && act && !sc.combat) {
        if (G.hit('k')) G.Skills.open();
        else if (G.hit('j')) G.UI.journal();
      }
    };

    sc.draw = (ctx) => {
      const t = G.t;
      ctx.save();
      if (sc.shake > 0) ctx.translate(rand(-6, 6) * sc.shake * 3, rand(-6, 6) * sc.shake * 3);
      const camX = sc.camX;
      cfg.drawBack(ctx, camX, t, sc);
      const ents = [...sc.npcs.filter((n) => !n.hidden), ...sc.enemies, sc.follower, P].filter(Boolean).sort((a, b) => a.y - b.y);
      for (const e of ents) {
        const sx = e.x - camX;
        if (sx < -150 || sx > G.W + 150) continue;
        const s = depth(e.y);
        if (e.draw) { e.draw(ctx, sx, e.y, s, t, sc); continue; }
        const flick = e.inv > 0 && Math.sin(t * 50) > 0;
        const down = e.down ? Math.min(1, e.downT * 4) : e === P && P.hp <= 0 && P.downT != null ? Math.min(1, P.downT * 4) : 0;
        A.figure(ctx, e.key, sx, e.y, s, {
          face: e.face, walk: e.walk, moving: e.moving, mood: e.mood, alpha: flick ? 0.45 : e.down ? Math.max(0.35, 1 - e.downT * 0.3) : 1,
          cast: e.cast > 0 ? 1 : 0, castCol: e.from === 'e' || e.key === 'enforcer' ? '#ff5566' : '#9fd8ff', down,
        });
        if (e.hurt > 0) A.glow(ctx, sx, e.y - 90 * s, 60, 'rgba(255,255,255,.6)', e.hurt * 4);
      }
      for (const b of sc.bolts) {
        const sx = b.x - camX, by = b.y - 95 * depth(b.y);
        A.glow(ctx, sx, by, 26, b.col, 1);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(sx, by, 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const p of sc.parts) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.col;
        const py = p.lift ? p.y - 95 * depth(p.y) : p.y;
        ctx.beginPath(); ctx.arc(p.x - camX, py, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (sc.near && G.canAct() && !sc.cut) {
        const n = sc.near, sx = n.x - camX, y = n.y - (n.markerH || 190) * depth(n.y) + Math.sin(t * 4) * 4;
        ctx.fillStyle = '#e8c46a';
        ctx.beginPath(); ctx.moveTo(sx, y - 9); ctx.lineTo(sx + 7, y); ctx.lineTo(sx, y + 9); ctx.lineTo(sx - 7, y); ctx.fill();
        A.glow(ctx, sx, y, 22, 'rgba(232,196,106,.6)');
      }
      if (cfg.drawFront) cfg.drawFront(ctx, camX, t, sc);
      ctx.restore();
      if (sc.combat || (sc.enemies.length && P.hp < P.maxHp && sc.enemies.some((e) => !e.down))) {
        ctx.font = '700 15px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#efe6d2';
        ctx.fillText('LARISSA', G.W / 2, 92);
        for (let i = 0; i < P.maxHp; i++) {
          const x = G.W / 2 - (P.maxHp - 1) * 15 + i * 30;
          heart(ctx, x, 110, i < P.hp ? '#ff5577' : 'rgba(255,255,255,.15)');
        }
        ctx.font = '15px "Crimson Pro", serif';
        ctx.fillStyle = 'rgba(239,230,210,.8)';
        ctx.fillText('Space / click — cast   ·   Shift — dodge   ·   WASD — move', G.W / 2, 142);
      }
    };
    return sc;
  };

  function heart(ctx, x, y, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.bezierCurveTo(x - 14, y - 2, x - 8, y - 12, x, y - 5);
    ctx.bezierCurveTo(x + 8, y - 12, x + 14, y - 2, x, y + 8);
    ctx.fill();
  }
})();
