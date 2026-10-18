// The Flying Derby: side-scrolling broom race with rings, hazards, rival riders and spell combat.
// Rider stats come from the skill tree; Trust, Safety and relationships alter the race.
(() => {
  'use strict';
  const { clamp, rand, seeded, TAU } = G.U;
  const A = G.Art;
  const L = 19000;
  const PLACE = ['1st', '2nd', '3rd', '4th'];

  G.Derby = function (racer, onFinish) {
    const S = G.S;
    const st = G.Skills.stats(racer);
    const round = S.wins;
    const lowSafety = S.safety < 40;
    const sc = { t: 0, phase: 'count', count: 3.4, shake: 0, parts: [], bolts: [], hexes: [], texts: [], camX: -320, endT: 0 };
    const P = (sc.P = {
      key: racer, x: 0, y: 430, vy: 0, speed: 0, hp: st.hp, boost: 40, inv: 0, cool: 0, q: 0, e: 0, roll: 0, rollDir: -1, charge: 0,
      crashed: 0, shieldT: 0, revived: false, rings: 0, cheered: false, tilt: 0, slow: 0, finished: false, place: 0,
    });
    if (S.rel.ronan >= 40) P.boost = 70;

    const rivals = (sc.rivals = [
      { key: 'drake', name: 'Drake Malfoyle', col: '#2fbf7a', base: 528 + round * 22, hostile: true, aggr: 1, y: 200 },
      { key: 'brutus', name: 'Brutus Grime', col: '#ff3344', base: 500 + round * 20, hostile: true, aggr: lowSafety ? 1.6 : 1.2, y: 310 },
      { key: 'nell', name: 'Nell Quickwater', col: '#7ab8ff', base: 515 + round * 18, hostile: false, aggr: 0, y: 560 },
    ].map((r) => Object.assign(r, { x: 0, vy: 0, speed: 0, hp: 80, maxHp: 80, stun: 0, slow: 0, cool: rand(2.5, 4), finished: false, phase: Math.random() * 6, ty: r.y, tilt: 0 })));

    // ---- track ----
    const r = seeded(1000 + round * 77);
    const rings = [], obst = [], storms = [];
    let ry = 380;
    for (let x = 900; x < L - 500; x += 460 + r() * 220) {
      ry = clamp(ry + (r() - 0.5) * 300, 140, 600);
      rings.push({ x, y: ry, taken: false, fade: 0 });
    }
    for (let x = 1500; x < L - 900; x += 800 + r() * 700) {
      const near = rings.reduce((b, g) => (Math.abs(g.x - x) < Math.abs(b.x - x) ? g : b), rings[0]);
      if (near.y > 380) obst.push({ x, w: 70, y0: 0, y1: 90 + r() * 140, kind: 'hang' });
      else obst.push({ x, w: 80, y0: 450 + r() * 120, y1: 720, kind: 'spire' });
    }
    for (let x = 3500; x < L - 1500; x += 2600 + r() * 1800) storms.push({ x, y: 160 + r() * 380, rad: 110, phase: r() * 6 });
    sc.rings = rings;

    // ---- helpers ----
    const burst = (x, y, col, n = 10, sp = 220) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU, v = rand(sp * 0.3, sp);
        sc.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.8), max: 0.8, col, r: rand(1.5, 4) });
      }
    };
    const say = (text, col = '#efe6d2', size = 26) => sc.texts.push({ text, col, size, life: 2.2, y: 0 });

    function hurt(n) {
      if (P.inv > 0 || P.roll > 0 || P.crashed > 0) return;
      if (st.shield && P.shieldT <= 0) {
        P.shieldT = st.shield;
        P.inv = 0.5;
        burst(P.x, P.y - 20, '#9fe4ff', 18);
        say("Hermia's ward holds!", '#9fe4ff');
        return;
      }
      P.hp -= n;
      P.inv = 0.9;
      sc.shake = 0.35;
      burst(P.x, P.y - 20, '#ff5566', 14);
      if (P.hp <= 0) {
        if (st.revive && !P.revived) {
          P.revived = true;
          P.hp = st.hp / 2;
          P.inv = 1.5;
          say('UNBROKEN!', '#ffb07a', 34);
        } else {
          P.hp = 0;
          P.crashed = 2.4;
          P.speed *= 0.2;
          say('Knocked off your broom!', '#ff7a7a', 30);
        }
      }
    }

    function fire() {
      const shots = st.twin ? [-12, 12] : [0];
      for (const dy of shots) sc.bolts.push({ x: P.x + 60, y: P.y - 8 + dy, vx: P.speed + 1150, life: 0.9 });
      P.cool = st.boltCd;
    }

    function hitRival(rv, dmg, stun = 0) {
      rv.hp -= dmg;
      if (st.slowOnHit) rv.slow = 2;
      if (stun) rv.stun = Math.max(rv.stun, stun);
      burst(rv.x, rv.y - 20, '#9fd8ff', 12);
      if (rv.hp <= 0) {
        rv.hp = rv.maxHp;
        rv.stun = 3;
        say(`${rv.name} is knocked off course!`, '#8ef0b0');
      }
    }

    function useQ() {
      if (P.q > 0 || P.crashed > 0) return;
      P.q = st.qCd;
      if (racer === 'larissa') {
        P.roll = 0.5;
        P.rollDir = G.down('s', 'arrowdown') ? 1 : -1;
        if (st.rollHeal) P.hp = Math.min(st.hp, P.hp + st.rollHeal);
      } else {
        P.charge = 0.6;
        P.inv = Math.max(P.inv, 0.3);
      }
    }

    function useE() {
      if (!st.eName || P.e > 0 || P.crashed > 0) return;
      P.e = st.eCd;
      sc.shake = 0.3;
      if (racer === 'larissa') {
        sc.nova = 0.6;
        for (const h of sc.hexes) if (Math.hypot(h.x - P.x, h.y - P.y) < 420) { h.dead = true; burst(h.x, h.y, '#ffe08a', 8); }
        for (const rv of rivals) if (Math.hypot(rv.x - P.x, rv.y - P.y) < 360) hitRival(rv, 30, 1.2);
        say('Defiance Nova!', '#ffe08a', 32);
      } else {
        sc.bellow = 0.6;
        for (const h of sc.hexes) if (Math.hypot(h.x - P.x, h.y - P.y) < 320) h.dead = true;
        for (const rv of rivals) if (Math.hypot(rv.x - P.x, rv.y - P.y) < 400) { rv.x -= 160; rv.stun = Math.max(rv.stun, 1.5); }
        say('BELLOW OF BLOOP!', '#ffb07a', 34);
      }
    }

    sc.enter = () => {
      G.UI.hud(false);
      G.UI.prompt(null);
      if (S.rel.ronan >= 40) G.toast("Ronan's tune-up: starting boost +30", 'good');
      if (lowSafety) G.toast('Low Safety: the Enforcer stands are hurling hexes at you', 'bad');
    };

    sc.update = (dt) => {
      sc.t += dt;
      const t = G.t;
      sc.shake = Math.max(0, sc.shake - dt);
      if (sc.phase === 'count') {
        sc.count -= dt;
        if (sc.count <= 0) { sc.phase = 'race'; say('GO!', '#e8c46a', 60); }
      }
      const racing = sc.phase === 'race' || sc.phase === 'done';
      const ctl = sc.phase === 'race' && !P.finished && G.canAct();

      // ---- player ----
      P.inv -= dt; P.cool -= dt; P.q -= dt; P.e -= dt; P.roll -= dt; P.charge -= dt; P.shieldT -= dt; P.slow -= dt;
      let target = 0;
      if (racing) {
        if (P.finished) target = st.maxSpeed * 0.6;
        else if (P.crashed > 0) {
          P.crashed -= dt;
          P.y = Math.min(660, P.y + 160 * dt);
          if (P.crashed <= 0) { P.hp = Math.round(st.hp * 0.6); P.inv = 1.6; say('Back on the broom!', '#8ef0b0'); }
        } else {
          const thr = ctl && G.down('d', 'arrowright') ? 1 : ctl && G.down('a', 'arrowleft') ? 0.55 : 0.9;
          target = st.maxSpeed * thr;
          P.boosting = ctl && G.down('shift') && P.boost > 0;
          if (P.boosting) { target *= 1.45; P.boost = Math.max(0, P.boost - 30 * dt); }
          else P.boost = Math.min(100, P.boost + st.boostRegen * dt);
          if (P.slow > 0) target *= 0.6;
          if (P.charge > 0) target += 380;
          const my = ctl ? (G.down('s', 'arrowdown') ? 1 : 0) - (G.down('w', 'arrowup') ? 1 : 0) : 0;
          P.vy += (my * 380 - P.vy) * Math.min(1, dt * 7);
          if (P.roll > 0) P.vy = P.rollDir * 520;
          if (ctl) {
            if ((G.hit('space', 'j') || G.mouse.clicked) && P.cool <= 0) fire();
            if (G.hit('q')) useQ();
            if (G.hit('e')) useE();
          }
        }
      }
      const acc = target > P.speed ? st.accel : 520;
      P.speed += clamp(target - P.speed, -acc * dt, acc * dt);
      const px0 = P.x;
      P.x += P.speed * dt;
      P.y = clamp(P.y + P.vy * dt, 70, 660);
      P.tilt += ((P.crashed > 0 ? 0.9 : P.vy / 1400 + (P.boosting ? -0.05 : 0)) - P.tilt) * Math.min(1, dt * 8);
      if (racing && !P.crashed && Math.random() < 0.8) sc.parts.push({ x: P.x - 90, y: P.y + 4, vx: -60, vy: rand(-20, 20), life: 0.6, max: 0.6, col: P.boosting ? '#ffcc66' : racer === 'larissa' ? '#9fd8ff' : '#ffb07a', r: P.boosting ? 4 : 2.5 });

      // rings
      for (const g of rings) {
        if (g.taken) { g.fade += dt; continue; }
        if (px0 < g.x && P.x >= g.x && Math.abs(P.y - g.y) < 50 && !P.crashed) {
          g.taken = true;
          P.rings++;
          P.boost = Math.min(100, P.boost + st.ringBoost);
          P.speed += 40;
          burst(g.x, g.y, '#ffe08a', 16, 260);
        }
      }
      // obstacles
      for (const o of obst) {
        if (P.x + 30 < o.x || P.x - 30 > o.x + o.w) continue;
        if (P.y - 15 + 26 > o.y0 && P.y - 15 - 26 < o.y1 && P.inv <= 0 && P.roll <= 0 && !P.crashed) {
          hurt(Math.round(20 * st.obstacleMul));
          P.speed *= 1 - 0.5 * st.obstacleMul;
          P.y += o.kind === 'spire' ? -40 : 40;
        }
      }
      for (const s of storms) {
        s.active = Math.sin(t * 1.4 + s.phase) > 0.55;
        if (s.active && Math.hypot(P.x - s.x, P.y - s.y) < s.rad) hurt(12);
      }

      // halfway cheer
      if (!P.cheered && P.x > L / 2) {
        P.cheered = true;
        if (S.trust >= 60 || st.cheer) {
          P.boost = 100;
          if (st.cheer) P.hp = Math.min(st.hp, P.hp + 30);
          say(racer === 'serious' && st.cheer ? '"FOR LISSA!"' : 'The crowd chants your name!', '#5ab0ff', 32);
        } else if (S.trust < 30) say('The crowd is silent. Nobody wants to be seen cheering.', '#a99f8a', 22);
      }

      // ---- rivals ----
      for (const rv of rivals) {
        rv.stun -= dt; rv.slow -= dt; rv.cool -= dt;
        if (!racing) continue;
        let sp = rv.base * (1 + clamp((P.x - rv.x) / 3000, -0.1, 0.14)) * (1 + 0.04 * Math.sin(t * 0.7 + rv.phase));
        if (rv.finished) sp *= 0.6;
        if (rv.stun > 0) { sp *= 0.3; rv.y = Math.min(660, rv.y + 70 * dt); }
        if (rv.slow > 0) sp *= 0.6;
        rv.speed += clamp(sp - rv.speed, -500 * dt, 260 * dt);
        rv.x += rv.speed * dt;
        const nr = rings.find((g) => g.x > rv.x + 40);
        rv.ty = nr ? nr.y : 360;
        for (const o of obst) if (o.x > rv.x && o.x - rv.x < 360) {
          if (rv.ty > o.y0 - 50 && rv.ty < o.y1 + 50) rv.ty = o.kind === 'spire' ? o.y0 - 70 : o.y1 + 70;
        }
        if (rv.stun <= 0) rv.vy += ((rv.ty - rv.y) * 2.2 - rv.vy) * Math.min(1, dt * 3);
        rv.y = clamp(rv.y + rv.vy * dt, 70, 660);
        rv.tilt = rv.stun > 0 ? 0.7 : rv.vy / 1400;
        if (!rv.finished && rv.x >= L) { rv.finished = true; rv.time = sc.t; }
        if (rv.hostile && sc.phase === 'race' && rv.cool <= 0 && rv.stun <= 0 && Math.abs(rv.x - P.x) < 650 && !P.crashed && !P.finished) {
          const dx = P.x - rv.x, dy = P.y - rv.y, d = Math.hypot(dx, dy) || 1;
          sc.hexes.push({ x: rv.x + Math.sign(dx) * 50, y: rv.y - 10, vx: rv.speed + (dx / d) * 440, vy: (dy / d) * 440, life: 3, homing: 0 });
          rv.cool = rand(2.2, 3.6) / rv.aggr;
        }
        if (P.charge > 0 && Math.abs(rv.x - P.x) < 80 && Math.abs(rv.y - P.y) < 55 && !rv.rammed) {
          rv.rammed = 0.8;
          hitRival(rv, st.ramDmg, st.ramStun ? 1.6 : 0);
          rv.x -= 60;
          sc.shake = 0.3;
        }
        if (rv.rammed) { rv.rammed -= dt; if (rv.rammed <= 0) rv.rammed = 0; }
      }

      // ambient hex orbs from the Enforcer stands
      sc.orbT = (sc.orbT ?? 6) - dt;
      if (sc.phase === 'race' && sc.orbT <= 0 && !P.finished) {
        sc.orbT = lowSafety ? rand(2.6, 4) : rand(5.5, 8.5);
        sc.hexes.push({ x: P.x + G.W, y: rand(100, 620), vx: P.speed * 0.55, vy: 0, life: 6, homing: lowSafety ? 1.4 : 0.9, orb: true });
      }
      for (const h of sc.hexes) {
        if (h.homing) h.vy += clamp(P.y - h.y, -1, 1) * 260 * h.homing * dt;
        h.vy *= 1 - dt * 0.5;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.life -= dt;
        if (Math.abs(h.x - P.x) < 36 && Math.abs(h.y - (P.y - 15)) < 36 && !P.crashed) { if (P.inv <= 0 && P.roll <= 0) { hurt(h.orb ? 16 : 12); h.dead = true; } }
      }
      // bolts
      for (const b of sc.bolts) {
        b.x += b.vx * dt;
        b.life -= dt;
        for (const rv of rivals) if (Math.abs(b.x - rv.x) < 60 && Math.abs(b.y - (rv.y - 15)) < 40) { hitRival(rv, st.boltDmg); b.life = 0; break; }
        for (const h of sc.hexes) if (!h.dead && Math.abs(b.x - h.x) < 30 && Math.abs(b.y - h.y) < 30) { h.dead = true; b.life = 0; burst(h.x, h.y, '#c78bff', 12); }
      }
      sc.bolts = sc.bolts.filter((b) => b.life > 0);
      sc.hexes = sc.hexes.filter((h) => !h.dead && h.life > 0);
      for (const p of sc.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
      sc.parts = sc.parts.filter((p) => p.life > 0);
      for (const tx of sc.texts) { tx.life -= dt; tx.y -= 20 * dt; }
      sc.texts = sc.texts.filter((tx) => tx.life > 0);
      sc.nova = Math.max(0, (sc.nova || 0) - dt);
      sc.bellow = Math.max(0, (sc.bellow || 0) - dt);

      // finish
      if (!P.finished && P.x >= L) {
        P.finished = true;
        P.place = 1 + rivals.filter((rv) => rv.finished).length;
        sc.phase = 'done';
        sc.endT = 0;
        say(P.place === 1 ? 'VICTORY!' : `${PLACE[P.place - 1]} place`, P.place === 1 ? '#e8c46a' : '#efe6d2', 64);
        burst(P.x, P.y, '#e8c46a', 60, 400);
      }
      if (sc.phase === 'done') {
        sc.endT += dt;
        if (sc.endT > 2.6 && !sc.resulted) { sc.resulted = true; results(); }
      }

      const want = P.x - 320 - (P.speed - 500) * 0.25;
      sc.camX += (want - sc.camX) * Math.min(1, dt * 5);
    };

    function results() {
      const place = P.place;
      const xp = [160, 100, 70, 50][place - 1] + P.rings * 3;
      const other = racer === 'larissa' ? 'serious' : 'larissa';
      G.gainXP(racer, xp);
      G.gainXP(other, Math.round(xp * 0.4));
      S.races++;
      S.tuning = 0;
      S.daily = { tune: false, cipher: false };
      const others = rivals.map((rv) => ({ name: rv.name, x: rv.finished ? L + (1000 - rv.time) * 10 : rv.x })).sort((a, b) => b.x - a.x);
      others.splice(place - 1, 0, { name: G.Chars[racer].name, you: true });
      if (place === 1) { S.wins++; G.apply({ trust: 6, safety: -4 }); } else G.apply({ trust: -2 });
      G.save();
      const won = place === 1;
      G.UI.open(`<div class="results">
        <h3>${won ? 'Victory' : 'Defeat'}</h3>
        <div class="place">${PLACE[place - 1]}</div>
        <p class="sub">${won ? `Serious is one race closer to freedom. Wins: ${S.wins} / 3.` : 'The Serpent Squad smirks. There will be another race.'}</p>
        <table>${others.map((o, i) => `<tr class="${o.you ? 'you' : ''}"><td>${PLACE[i]}</td><td>${o.name}</td></tr>`).join('')}</table>
        <p class="sub">Rings: ${P.rings} · +${xp} XP to ${G.Chars[racer].name.split(' ')[0]}, +${Math.round(xp * 0.4)} XP to ${G.Chars[other].name.split(' ')[0]}</p>
        <button class="btn" data-close>Return to the hangar</button></div>`, { noClose: true, onClose: () => onFinish(place) });
    }

    // ---------- drawing ----------
    let sky = null, gen = -1;
    function buildSky() {
      gen = G.layerGen;
      sky = G.U.layer(G.W, G.H, (x, w, h) => {
        const g = x.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#0b0e2c');
        g.addColorStop(0.35, '#33265c');
        g.addColorStop(0.62, '#a3506a');
        g.addColorStop(0.8, '#f0a35c');
        g.addColorStop(1, '#ffd08a');
        x.fillStyle = g;
        x.fillRect(0, 0, w, h);
        const rs = seeded(9);
        for (let i = 0; i < 200; i++) { x.fillStyle = `rgba(255,255,255,${rs() * 0.7})`; x.fillRect(rs() * w, rs() * h * 0.4, 1.3, 1.3); }
        const sg = x.createRadialGradient(980, 560, 10, 980, 560, 360);
        sg.addColorStop(0, 'rgba(255,240,200,1)');
        sg.addColorStop(0.12, 'rgba(255,210,140,.9)');
        sg.addColorStop(0.4, 'rgba(255,170,100,.25)');
        sg.addColorStop(1, 'rgba(255,150,90,0)');
        x.fillStyle = sg;
        x.fillRect(600, 200, 760, 520);
      });
    }
    const ridge = (x, a, b, c) => Math.sin(x * 0.0037 + a) * 46 + Math.sin(x * 0.011 + b) * 24 + Math.sin(x * 0.027 + c) * 9;
    function mountains(ctx, par, base, col, a, b, c, amp = 1) {
      const off = sc.camX * par;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, G.H);
      for (let x = 0; x <= G.W + 16; x += 16) ctx.lineTo(x, base - (ridge(x + off, a, b, c) + 60) * amp);
      ctx.lineTo(G.W, G.H);
      ctx.fill();
    }
    const clouds = Array.from({ length: 14 }, (_, i) => { const q = seeded(300 + i); return { x: q() * 3400, y: 60 + q() * 420, s: 0.6 + q() * 1.1, a: 0.25 + q() * 0.35 }; });
    const fogs = Array.from({ length: 4 }, (_, i) => { const q = seeded(900 + i); return { x: q() * 4000, y: 380 + q() * 300, s: 1.1 + q() * 0.7 }; });

    function stadium(ctx, wx, t) {
      const sx = wx - sc.camX;
      if (sx < -1400 || sx > G.W + 200) return;
      const g = ctx.createLinearGradient(0, 560, 0, 720);
      g.addColorStop(0, '#2a1f3a');
      g.addColorStop(1, '#120d1c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(sx - 1200, 720); ctx.lineTo(sx - 1150, 590); ctx.lineTo(sx + 50, 560); ctx.lineTo(sx + 120, 720);
      ctx.fill();
      const q = seeded(Math.floor(wx));
      for (let i = 0; i < 260; i++) {
        const cx = sx - 1130 + q() * 1180, cy = 600 + q() * 110;
        ctx.fillStyle = ['#e8c46a', '#5ab0ff', '#ff5566', '#efe6d2', '#8ef0b0'][(q() * 5) | 0];
        ctx.fillRect(cx, cy + Math.sin(t * 8 + i) * 1.5 * (sc.phase === 'count' ? 0.3 : 1), 3, 4);
      }
      for (let i = 0; i < 4; i++) {
        const bx = sx - 1100 + i * 320;
        A.line(ctx, [bx, 590, bx, 470], 4, '#1a1424', false);
        A.banner(ctx, bx + 2, 470, 40, 90, t);
        A.glow(ctx, bx, 466, 50, 'rgba(255,240,200,.6)');
      }
    }

    function drawObstacle(ctx, o, t) {
      const sx = o.x - sc.camX;
      if (sx < -150 || sx > G.W + 150) return;
      if (o.kind === 'spire') {
        const g = ctx.createLinearGradient(sx, 0, sx + o.w, 0);
        g.addColorStop(0, '#2a2433'); g.addColorStop(0.5, '#4a4258'); g.addColorStop(1, '#1c1824');
        ctx.fillStyle = g;
        ctx.fillRect(sx, o.y0, o.w, 720 - o.y0);
        for (let i = 0; i < 4; i++) ctx.fillRect(sx - 6 + i * ((o.w + 12) / 4), o.y0 - 14, (o.w + 12) / 4 - 6, 16);
        ctx.fillStyle = '#ff6a3a';
        for (let wy = o.y0 + 40; wy < 700; wy += 70) { ctx.fillRect(sx + o.w / 2 - 6, wy, 12, 18); A.glow(ctx, sx + o.w / 2, wy + 9, 26, 'rgba(255,120,60,.5)'); }
        A.banner(ctx, sx + 14, o.y0 + 10, 50, 110, t);
      } else {
        A.line(ctx, [sx + 20, 0, sx + 20, o.y1 - 60], 3, '#3a3444', false);
        A.line(ctx, [sx + 50, 0, sx + 50, o.y1 - 60], 3, '#3a3444', false);
        const g = ctx.createLinearGradient(sx, 0, sx + o.w, 0);
        g.addColorStop(0, '#2a2433'); g.addColorStop(1, '#4a4258');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.roundRect(sx - 5, o.y1 - 70, o.w + 10, 70, [4, 4, 14, 14]); ctx.fill();
        ctx.strokeStyle = '#6a627a'; ctx.lineWidth = 3;
        for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(sx - 5 + i * (o.w + 10) / 4, o.y1 - 68); ctx.lineTo(sx - 5 + i * (o.w + 10) / 4, o.y1 - 4); ctx.stroke(); }
        A.glow(ctx, sx + o.w / 2, o.y1 - 35, 50, 'rgba(120,255,170,.35)', 0.7 + 0.3 * Math.sin(t * 3 + o.x));
      }
    }

    function drawStorm(ctx, s, t) {
      const sx = s.x - sc.camX;
      if (sx < -250 || sx > G.W + 250) return;
      const cl = A.cloud();
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.filter = 'brightness(0.35) saturate(0.6)';
      ctx.drawImage(cl, sx - 170, s.y - 110, 340, 160);
      ctx.restore();
      const warn = Math.sin(t * 1.4 + s.phase);
      if (warn > 0.3 && !s.active) A.glow(ctx, sx, s.y, s.rad, 'rgba(160,140,255,.25)', (warn - 0.3) * 3);
      if (s.active) {
        A.glow(ctx, sx, s.y, s.rad * 1.3, 'rgba(190,170,255,.8)', 0.8);
        ctx.strokeStyle = '#f2ecff'; ctx.lineWidth = 2.5;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath(); let lx = sx + rand(-60, 60), ly = s.y - 20; ctx.moveTo(lx, ly);
          for (let i = 0; i < 6; i++) { lx += rand(-24, 24); ly += rand(14, 26); ctx.lineTo(lx, ly); }
          ctx.stroke();
        }
      }
    }

    function drawRing(ctx, g, t, front) {
      const sx = g.x - sc.camX;
      if (sx < -80 || sx > G.W + 80) return;
      const a = g.taken ? Math.max(0, 1 - g.fade * 2) : 1;
      if (a <= 0) return;
      const sc2 = g.taken ? 1 + g.fade * 2 : 1 + 0.05 * Math.sin(t * 4 + g.x);
      ctx.save();
      ctx.globalAlpha = a;
      if (!front) A.glow(ctx, sx, g.y, 70 * sc2, 'rgba(255,210,110,.45)');
      ctx.strokeStyle = '#ffd36a';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.ellipse(sx, g.y, 16 * sc2, 52 * sc2, 0, front ? -Math.PI / 2 : Math.PI / 2, front ? Math.PI / 2 : Math.PI * 1.5);
      ctx.stroke();
      ctx.strokeStyle = '#fff6d6';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    sc.draw = (ctx) => {
      const t = G.t;
      if (gen !== G.layerGen) buildSky();
      ctx.save();
      if (sc.shake > 0) ctx.translate(rand(-8, 8) * sc.shake * 2, rand(-8, 8) * sc.shake * 2);
      ctx.drawImage(sky, 0, 0, G.W, G.H);
      // Dark Lord's spire, impossibly far away
      const tx = 900 - sc.camX * 0.01;
      ctx.fillStyle = '#1a1430';
      ctx.beginPath(); ctx.moveTo(tx - 30, 620); ctx.lineTo(tx - 10, 240); ctx.lineTo(tx, 170); ctx.lineTo(tx + 10, 240); ctx.lineTo(tx + 30, 620); ctx.fill();
      A.glow(ctx, tx, 175, 70, 'rgba(110,255,170,.7)', 0.8 + 0.2 * Math.sin(t * 2));
      mountains(ctx, 0.04, 600, '#3b2a55', 0, 1, 2);
      mountains(ctx, 0.1, 650, '#271c3d', 3, 4, 5, 1.2);
      const cl = A.cloud();
      for (const c of clouds) {
        const x = ((((c.x - sc.camX * 0.3) % 3400) + 3400) % 3400) - 350;
        ctx.globalAlpha = c.a;
        ctx.drawImage(cl, x, c.y, 300 * c.s, 140 * c.s);
      }
      ctx.globalAlpha = 1;
      mountains(ctx, 0.35, 760, '#140f22', 6, 7, 8, 1.6);
      stadium(ctx, 1000, t);
      stadium(ctx, L + 1100, t);

      // start / finish posts
      for (const wx of [0, L]) {
        const sx = wx - sc.camX;
        if (sx < -100 || sx > G.W + 100) continue;
        A.line(ctx, [sx, 40, sx, 690], 8, '#2a2030', false);
        for (let y = 40; y < 690; y += 30) { ctx.fillStyle = ((y / 30) | 0) % 2 ? '#efe6d2' : '#1a1424'; ctx.fillRect(sx - 4, y, 8, 30); }
        A.glow(ctx, sx, 365, 160, wx ? 'rgba(232,196,106,.35)' : 'rgba(150,200,255,.25)');
        ctx.fillStyle = '#e8c46a'; ctx.font = '700 22px Cinzel, serif'; ctx.textAlign = 'center';
        ctx.fillText(wx ? 'FINISH' : 'START', sx, 30);
      }

      for (const s of storms) drawStorm(ctx, s, t);
      for (const g of rings) drawRing(ctx, g, t, false);
      for (const o of obst) drawObstacle(ctx, o, t);

      // riders
      for (const rv of rivals) {
        const sx = rv.x - sc.camX;
        if (sx < -160 || sx > G.W + 160) continue;
        A.rider(ctx, rv.key, sx, rv.y, 0.86, { tilt: rv.tilt, t: t + rv.phase });
        ctx.font = '600 14px "Crimson Pro", serif'; ctx.textAlign = 'center';
        ctx.fillStyle = rv.col; ctx.fillText(rv.name, sx, rv.y - 90);
        ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(sx - 26, rv.y - 84, 52, 4);
        ctx.fillStyle = rv.col; ctx.fillRect(sx - 26, rv.y - 84, 52 * (rv.hp / rv.maxHp), 4);
        if (rv.stun > 0) for (let i = 0; i < 3; i++) A.glow(ctx, sx + Math.cos(t * 6 + i * 2) * 20, rv.y - 66 + Math.sin(t * 6 + i * 2) * 5, 8, '#ffe08a');
      }
      const psx = P.x - sc.camX;
      const flick = P.inv > 0 && Math.sin(t * 40) > 0 && !P.crashed;
      const rollRot = P.roll > 0 ? (1 - P.roll / 0.5) * TAU * P.rollDir * -1 : 0;
      A.rider(ctx, racer, psx, P.y, 0.95, { tilt: P.tilt + rollRot, boost: P.boosting, alpha: flick ? 0.4 : 1, shield: st.shield && P.shieldT <= 0 });
      if (P.charge > 0) A.glow(ctx, psx + 50, P.y - 20, 90, 'rgba(255,170,90,.7)');
      if (sc.nova) { ctx.strokeStyle = `rgba(255,224,138,${sc.nova / 0.6})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(psx, P.y - 20, (1 - sc.nova / 0.6) * 420, 0, TAU); ctx.stroke(); }
      if (sc.bellow) { ctx.strokeStyle = `rgba(255,176,122,${sc.bellow / 0.6})`; ctx.lineWidth = 14; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(psx, P.y - 20, (1 - sc.bellow / 0.6) * 400 - i * 40, -0.8, 0.8); ctx.stroke(); } }
      for (const g of rings) drawRing(ctx, g, t, true);

      for (const h of sc.hexes) {
        const sx = h.x - sc.camX;
        A.glow(ctx, sx, h.y, h.orb ? 34 : 24, h.orb ? 'rgba(170,90,255,.9)' : 'rgba(255,60,80,.9)');
        A.ell(ctx, sx, h.y, h.orb ? 10 : 6, h.orb ? 10 : 6, h.orb ? '#2a0f3a' : '#ffdddd');
        if (h.orb) A.ell(ctx, sx, h.y, 3.5, 3.5, '#ff3344');
      }
      for (const b of sc.bolts) {
        const sx = b.x - sc.camX;
        ctx.strokeStyle = 'rgba(159,216,255,.5)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(sx - 40, b.y); ctx.lineTo(sx, b.y); ctx.stroke();
        A.glow(ctx, sx, b.y, 22, '#9fd8ff');
        A.ell(ctx, sx, b.y, 4, 4, '#fff');
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const p of sc.parts) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x - sc.camX, p.y, p.r, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // foreground mist + speed lines
      for (const f of fogs) {
        const x = ((((f.x - sc.camX * 1.6) % 4000) + 4000) % 4000) - 600;
        ctx.globalAlpha = 0.14;
        ctx.drawImage(cl, x, f.y, 300 * f.s, 140 * f.s);
      }
      ctx.globalAlpha = 1;
      const spd = clamp((P.speed - 520) / 300, 0, 1);
      if (spd > 0) {
        ctx.strokeStyle = `rgba(255,255,255,${0.35 * spd})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 18; i++) {
          const y = (i * 97 + t * 50) % G.H, x = (G.W - ((t * 2400 + i * 331) % (G.W + 300)));
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120 * spd, y); ctx.stroke();
        }
      }
      A.vignette(ctx, 0.45);
      ctx.restore();
      hud(ctx, t);
    };

    function bar(ctx, x, y, w, h, v, col, label) {
      ctx.fillStyle = 'rgba(10,8,18,.7)';
      ctx.beginPath(); ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 6); ctx.fill();
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.roundRect(x, y, Math.max(0, w * v), h, 4); ctx.fill();
      ctx.fillStyle = '#efe6d2'; ctx.font = '700 12px Cinzel, serif'; ctx.textAlign = 'left';
      ctx.fillText(label, x, y - 6);
    }

    function hud(ctx, t) {
      // progress track
      const x0 = 340, w = 600, y = 34;
      ctx.fillStyle = 'rgba(10,8,18,.65)';
      ctx.beginPath(); ctx.roundRect(x0 - 16, y - 16, w + 32, 32, 16); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x0, y - 1.5, w, 3);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x0 + w / 2 - 1, y - 7, 2, 14);
      ctx.fillStyle = '#e8c46a'; ctx.font = '13px serif'; ctx.textAlign = 'center'; ctx.fillText('⚑', x0 + w + 2, y + 5);
      for (const rv of rivals) { const px = x0 + clamp(rv.x / L, 0, 1) * w; A.ell(ctx, px, y, 6, 6, rv.col, 'rgba(0,0,0,.6)'); }
      const pp = x0 + clamp(P.x / L, 0, 1) * w;
      A.glow(ctx, pp, y, 18, 'rgba(232,196,106,.8)');
      A.ell(ctx, pp, y, 8, 8, '#e8c46a', '#1a1206', 2);

      // place
      const place = P.finished ? P.place : 1 + rivals.filter((rv) => rv.x > P.x).length;
      ctx.textAlign = 'left';
      ctx.font = '900 46px Cinzel, serif';
      ctx.fillStyle = place === 1 ? '#e8c46a' : '#efe6d2';
      ctx.fillText(PLACE[place - 1], 28, 70);
      ctx.font = '600 15px "Crimson Pro", serif';
      ctx.fillStyle = '#a99f8a';
      ctx.fillText(`Round ${round + 1} · ${G.Chars[racer].name} · Rings ${P.rings}`, 30, 94);

      // bars
      bar(ctx, 28, 650, 260, 14, P.hp / st.hp, ['#c0304a', '#ff7a8a'], `VITALITY ${Math.ceil(P.hp)}`);
      bar(ctx, 28, 690, 260, 10, P.boost / 100, ['#c99a3e', '#ffe08a'], 'BOOST  [SHIFT]');
      ctx.font = '700 28px Cinzel, serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#efe6d2';
      ctx.fillText(`${Math.round(P.speed / 5)}`, 310, 700);
      ctx.font = '12px Cinzel, serif'; ctx.fillStyle = '#a99f8a'; ctx.fillText('MPH', 372, 700);

      // abilities
      const ab = [['Q', st.qName, P.q, st.qCd], ['E', st.eName || 'Locked', st.eName ? P.e : 1, st.eName ? st.eCd : 1]];
      ab.forEach(([k, name, cd, max], i) => {
        const cx = G.W - 170 + i * 92, cy = 664;
        ctx.fillStyle = 'rgba(10,8,18,.75)';
        ctx.beginPath(); ctx.arc(cx, cy, 30, 0, TAU); ctx.fill();
        ctx.strokeStyle = cd > 0 ? 'rgba(255,255,255,.2)' : '#e8c46a'; ctx.lineWidth = 2.5; ctx.stroke();
        if (cd > 0) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + TAU * (cd / max)); ctx.fill(); }
        ctx.fillStyle = name === 'Locked' ? '#6a6070' : '#efe6d2'; ctx.font = '700 20px Cinzel, serif'; ctx.textAlign = 'center';
        ctx.fillText(k, cx, cy + 7);
        ctx.font = '13px "Crimson Pro", serif'; ctx.fillStyle = '#a99f8a'; ctx.fillText(name, cx, cy + 48);
      });

      if (sc.phase === 'count') {
        const n = Math.ceil(sc.count - 0.4);
        ctx.font = '900 120px Cinzel, serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#e8c46a';
        ctx.fillText(n > 0 ? n : '', G.W / 2, G.H / 2 + 30);
        ctx.font = '600 22px "Crimson Pro", serif'; ctx.fillStyle = '#efe6d2';
        ctx.fillText('W/S climb & dive · D accelerate · Shift boost · Space cast · Q / E abilities', G.W / 2, G.H / 2 + 90);
      }
      sc.texts.forEach((tx, i) => {
        ctx.globalAlpha = Math.min(1, tx.life * 2);
        ctx.font = `900 ${tx.size}px Cinzel, serif`; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillText(tx.text, G.W / 2 + 2, 180 + i * 44 + tx.y + 2);
        ctx.fillStyle = tx.col; ctx.fillText(tx.text, G.W / 2, 180 + i * 44 + tx.y);
      });
      ctx.globalAlpha = 1;
    }

    return sc;
  };
})();
