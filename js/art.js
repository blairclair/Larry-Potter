// Procedural art: characters (standing, on broom, portrait busts) and environment painters.
// Larissa and Serious are drawn from the reference photos in assets/reference/.
(() => {
  'use strict';
  const { TAU, seeded, clamp, lerp } = G.U;

  G.Chars = {
    larissa: {
      name: 'Larissa Potter', tint: '#3d5f8a',
      skin: '#f3c9ab', skinD: '#d9a283', hair: '#d6a064', hairD: '#a8743f', hairHi: '#f3d39a', hairStyle: 'wavy',
      glasses: '#5b3220', eyes: '#4d6b5a', lips: '#c46e6e',
      shirt: '#a9c9ec', shirtD: '#7f9fc8', print: true, shorts: '#1c1c22', shortsD: '#0f0f13',
      socks: '#f6f6f6', sockH: 14, shoes: '#56616b', sole: '#eeeeee', pack: '#f4a6c4', watchL: '#fafafa',
      h: 1, b: 0.94, scarf: '#c0392b',
    },
    serious: {
      name: 'Serious Bloop', tint: '#5a4630',
      skin: '#efbe9e', skinD: '#d39a7a', hair: '#9b9187', hairD: '#776e66', hairStyle: 'balding',
      eyes: '#4e4136', lips: '#b5675f',
      shirt: '#22263c', shirtD: '#14172a', emblem: '#b2232f', shorts: '#16161a', shortsD: '#0a0a0c', belt: '#0b0b0b',
      socks: '#fbfbfb', sockH: 28, shoes: '#151517', sole: '#26262a', watchR: '#cfd3da', glassesInHand: true,
      h: 1.04, b: 1.1, scarf: '#d4a017',
    },
    fennick: {
      name: 'Old Fennick', tint: '#4a3d63',
      skin: '#e8bea0', skinD: '#c99a7c', hair: '#ebe7df', hairD: '#c3bdb2', hairStyle: 'long', beard: '#f1eee8',
      eyes: '#5a6b7a', lips: '#b07068', robe: '#53456d', robeD: '#352b49', shoes: '#3a2a20', sole: '#2a1d15',
      staff: true, h: 0.95, b: 1,
    },
    enforcer: {
      name: 'Death Enforcer', tint: '#4a0d14',
      helm: true, cloak: '#2a0a10', armor: '#2a2d38', armorD: '#14161d', visor: '#ff3344',
      pants: true, shorts: '#191b22', shortsD: '#0d0e12', shoes: '#0b0b0e', sole: '#050506',
      h: 1.1, b: 1.18, scarf: '#5a0d18', skin: '#c8ccd2', skinD: '#8f949c',
    },
    hermia: {
      name: 'Hermia Grange', tint: '#6b2030',
      skin: '#c99474', skinD: '#a8765a', hair: '#4a2f1c', hairD: '#2f1d10', hairHi: '#6e4a2c', hairStyle: 'bushy',
      eyes: '#3d2a1c', lips: '#9e5a4f', shirt: '#7c1f2e', shirtD: '#57141f', jacket: true, inner: '#efe6d6',
      pants: true, shorts: '#2c2c36', shortsD: '#1a1a22', shoes: '#2b1e16', sole: '#1a120c',
      h: 0.96, b: 0.9, scarf: '#7c1f2e',
    },
    ronan: {
      name: 'Ronan Weasel', tint: '#7a3a12',
      skin: '#f4cdb4', skinD: '#dcaa8c', hair: '#d4561c', hairD: '#a3400f', hairHi: '#f2843f', hairStyle: 'mop', freckles: true,
      eyes: '#3c6a8a', lips: '#c4786a', shirt: '#c98a2e', shirtD: '#9b671c', jacket: true, inner: '#5d4a2e',
      pants: true, shorts: '#3a3326', shortsD: '#25201a', shoes: '#3b2a1a', sole: '#24180e',
      h: 1.07, b: 0.95, scarf: '#d4561c',
    },
    darklord: {
      name: 'Lord Moldevort', tint: '#0e3a22',
      skin: '#dfe3da', skinD: '#adb4a9', hairStyle: 'none', robe: '#101016', robeD: '#030305', trim: '#1f7a4a',
      eyes: '#ff2b2b', glowEyes: true, slit: true, lips: '#9aa096', shoes: '#000', sole: '#000',
      h: 1.16, b: 1.02, aura: '#4dff9a',
    },
    vendor: {
      name: 'Mags', tint: '#6d4a2e',
      skin: '#d6a07c', skinD: '#b98463', hair: '#77736e', hairD: '#55524e', hairStyle: 'bun',
      eyes: '#3b2a1e', lips: '#a8605a', robe: '#7a5233', robeD: '#523621', apron: '#ebdfc6',
      shoes: '#2b1e16', sole: '#1a120c', h: 0.93, b: 1.15,
    },
    kid: {
      name: 'Tib', tint: '#46602b',
      skin: '#e8b996', skinD: '#c99877', hair: '#2d2016', hairD: '#1b130d', hairHi: '#4a3626', hairStyle: 'mop',
      eyes: '#3b2a1e', lips: '#b5675f', shirt: '#5c7a3a', shirtD: '#41592a', shorts: '#4a3a2a', shortsD: '#33281c',
      socks: '#dddddd', sockH: 8, shoes: '#3b2a1a', sole: '#24180e', h: 0.72, b: 0.82, freckles: true,
    },
    pell: {
      name: 'Pell (Guard)', tint: '#3a2a2a',
      helm: true, cloak: '#2a0a10', armor: '#3a3a40', armorD: '#1e1e24', visor: '#ffaa33',
      pants: true, shorts: '#22222a', shortsD: '#111116', shoes: '#0b0b0e', sole: '#050506',
      h: 1.05, b: 1.1, skin: '#c8ccd2', skinD: '#8f949c',
    },
    // Derby rivals (rider art only)
    drake: {
      name: 'Drake Malfoyle', tint: '#1e5a3a',
      skin: '#f1d6c4', skinD: '#d6b4a0', hair: '#efe6c4', hairD: '#c9bd92', hairHi: '#fffbe8', hairStyle: 'slick',
      eyes: '#7a8c9a', lips: '#c08a80', shirt: '#1e5a3a', shirtD: '#123c26', pants: true, shorts: '#121214', shortsD: '#08080a',
      shoes: '#0b0b0e', sole: '#050506', scarf: '#2f8a5a', h: 1.02, b: 0.95,
    },
    brutus: {
      name: 'Brutus Grime', tint: '#4a0d14',
      helm: true, cloak: '#2a0a10', armor: '#2a2d38', armorD: '#14161d', visor: '#ff3344',
      pants: true, shorts: '#191b22', shortsD: '#0d0e12', shoes: '#0b0b0e', sole: '#050506',
      h: 1.1, b: 1.25, scarf: '#7a0d18', skin: '#c8ccd2', skinD: '#8f949c',
    },
    nell: {
      name: 'Nell Quickwater', tint: '#2d5a8a',
      skin: '#8d5a3c', skinD: '#6e432b', hair: '#1f1a17', hairD: '#0e0b09', hairHi: '#3a302a', hairStyle: 'bun',
      eyes: '#2a1d14', lips: '#7a4038', shirt: '#3d6fa8', shirtD: '#28507e', pants: true, shorts: '#22303f', shortsD: '#141d27',
      shoes: '#22303f', sole: '#111', scarf: '#e9eef5', h: 0.98, b: 0.9,
    },
  };

  const A = (G.Art = {});

  // ---------- primitives ----------
  const OUT = 'rgba(22,14,14,.55)';
  function line(ctx, pts, w, col, outline = true) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    };
    if (outline) { path(); ctx.strokeStyle = OUT; ctx.lineWidth = w + 2.6; ctx.stroke(); }
    path(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  }
  function ell(ctx, x, y, rx, ry, fill, stroke, lw = 1.6) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), 0, 0, TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }
  function fillOut(ctx, fill) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }
  A.glow = (ctx, x, y, r, col, a = 1) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };
  A.line = line;
  A.ell = ell;

  // ---------- face ----------
  function face(ctx, c, hx, hy, f, mood, t) {
    if (c.helm) return mask(ctx, c, hx, hy, f, t);
    // ears
    ell(ctx, hx - 14, hy + 1, 3.2, 4.5, c.skinD);
    ell(ctx, hx + 14, hy + 1, 3.2, 4.5, c.skinD);
    // head
    const g = ctx.createRadialGradient(hx - 4, hy - 6, 2, hx, hy, 18);
    g.addColorStop(0, c.skin);
    g.addColorStop(1, c.skinD);
    ctx.beginPath();
    ctx.ellipse(hx, hy, 14, 16, 0, 0, TAU);
    fillOut(ctx, g);
    const ex = hx + f * 2.5, ey = hy + 1;
    if (!c.slit) {
      ell(ctx, ex - 8, ey + 6, 3.5, 2, 'rgba(230,110,110,.18)');
      ell(ctx, ex + 8, ey + 6, 3.5, 2, 'rgba(230,110,110,.18)');
    }
    if (c.freckles) {
      ctx.fillStyle = 'rgba(150,80,40,.45)';
      for (const [dx, dy] of [[-7, 5], [-5, 7], [-9, 7], [6, 5], [8, 7], [5, 7]]) ctx.fillRect(ex + dx, ey + dy, 0.9, 0.9);
    }
    // eyes
    const blink = Math.sin(t * 0.9 + hx) > 0.985;
    for (const s of [-1, 1]) {
      const x = ex + s * 5.5;
      if (blink) { line(ctx, [x - 2, ey, x + 2, ey], 1, '#2a1d18', false); continue; }
      if (c.glowEyes) {
        A.glow(ctx, x, ey, 7, c.eyes, 0.9);
        ell(ctx, x, ey, 2.2, 1.3, '#ffdddd');
        ell(ctx, x, ey, 0.8, 1.3, '#600');
      } else {
        ell(ctx, x, ey, 2.4, 2.8, '#fff');
        ell(ctx, x + f * 0.5, ey + 0.3, 1.7, 2.1, c.eyes);
        ell(ctx, x + f * 0.5, ey + 0.4, 0.9, 1.1, '#140c0a');
        ell(ctx, x + f * 0.5 - 0.6, ey - 0.6, 0.5, 0.5, '#fff');
      }
      // brows
      const ang = mood === 'angry' ? s * 1.6 : mood === 'sad' ? -s * 1.2 : 0;
      line(ctx, [x - 3, ey - 5.5 - ang, x + 3, ey - 5.5 + ang], 1.3, c.hairD || '#3a2a20', false);
    }
    // nose
    if (c.slit) {
      line(ctx, [hx + f * 3 - 1.2, hy + 4, hx + f * 3 - 1.2, hy + 6.5], 0.9, '#556', false);
      line(ctx, [hx + f * 3 + 1.2, hy + 4, hx + f * 3 + 1.2, hy + 6.5], 0.9, '#556', false);
    } else {
      ctx.beginPath();
      ctx.moveTo(hx + f * 3.5, hy + 1);
      ctx.quadraticCurveTo(hx + f * 6, hy + 5.5, hx + f * 3, hy + 6.5);
      ctx.strokeStyle = c.skinD;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    // mouth
    const mx = hx + f * 2.5, my = hy + 10;
    ctx.beginPath();
    ctx.strokeStyle = '#6a2f2c';
    ctx.lineWidth = 1.3;
    if (mood === 'sad' || mood === 'angry') { ctx.moveTo(mx - 3.5, my + 1.5); ctx.quadraticCurveTo(mx, my - 1.5, mx + 3.5, my + 1.5); ctx.stroke(); }
    else if (mood === 'shock') { ell(ctx, mx, my, 2, 2.6, '#5a2020'); }
    else if (mood === 'neutral') { ctx.moveTo(mx - 3, my); ctx.lineTo(mx + 3, my); ctx.stroke(); }
    else if (mood === 'smirk') { ctx.moveTo(mx - 3, my + 0.5); ctx.quadraticCurveTo(mx + 1, my + 1.5, mx + 4, my - 1.5); ctx.stroke(); }
    else {
      ctx.moveTo(mx - 4, my - 1);
      ctx.quadraticCurveTo(mx, my + 3.6, mx + 4, my - 1);
      ctx.fillStyle = '#7a3532';
      ctx.fill();
      ctx.stroke();
    }
    if (c.glasses) {
      ctx.lineWidth = 1.9;
      ctx.strokeStyle = c.glasses;
      for (const s of [-1, 1]) {
        const x = ex + s * 5.6;
        ctx.beginPath();
        ctx.roundRect(x - 5.2, ey - 4.2, 10.4, 8.4, 3.4);
        ctx.fillStyle = 'rgba(220,235,255,.13)';
        ctx.fill();
        ctx.stroke();
      }
      line(ctx, [ex - 0.5, ey - 1.5, ex + 0.5, ey - 1.5], 1.6, c.glasses, false);
      line(ctx, [ex - 10.8, ey - 1, hx - 14, hy - 1], 1.4, c.glasses, false);
      line(ctx, [ex + 10.8, ey - 1, hx + 14, hy - 1], 1.4, c.glasses, false);
      ctx.fillStyle = 'rgba(255,200,140,.55)';
      ctx.fillRect(ex - 9, ey - 3.8, 1.6, 1.2);
      ctx.fillRect(ex + 2.5, ey - 3.8, 1.6, 1.2);
    }
  }

  function mask(ctx, c, hx, hy, f, t) {
    // hood
    ctx.beginPath();
    ctx.moveTo(hx - 19, hy + 16);
    ctx.bezierCurveTo(hx - 22, hy - 14, hx - 10, hy - 26, hx + f * 2, hy - 25);
    ctx.bezierCurveTo(hx + 14, hy - 26, hx + 22, hy - 12, hx + 19, hy + 16);
    ctx.closePath();
    fillOut(ctx, c.cloak);
    // skull mask
    const g = ctx.createLinearGradient(hx - 10, hy - 12, hx + 10, hy + 14);
    g.addColorStop(0, '#e9ecef');
    g.addColorStop(1, '#8c929c');
    ctx.beginPath();
    ctx.ellipse(hx + f * 1.5, hy + 1, 11, 13.5, 0, 0, TAU);
    fillOut(ctx, g);
    for (const s of [-1, 1]) {
      const x = hx + f * 2.5 + s * 4.6;
      ell(ctx, x, hy - 1, 3.2, 3.8, '#0a0a0d');
      const pulse = 0.65 + 0.35 * Math.sin(t * 4 + s);
      A.glow(ctx, x, hy - 1, 6, c.visor, pulse);
      ell(ctx, x, hy - 1, 1, 1.2, c.visor);
    }
    ctx.strokeStyle = '#4a4d55';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) line(ctx, [hx + f * 1.5 + i * 2.2, hy + 7, hx + f * 1.5 + i * 2.2, hy + 11], 0.8, '#3a3d45', false);
  }

  // ---------- hair ----------
  function hairBack(ctx, c, hx, hy, t) {
    const st = c.hairStyle;
    if (st === 'wavy') {
      const w = Math.sin(t * 1.7) * 0.8;
      ctx.beginPath();
      ctx.moveTo(hx - 16, hy - 14);
      ctx.bezierCurveTo(hx - 33, hy - 2, hx - 24, hy + 16, hx - 31 + w, hy + 31);
      ctx.quadraticCurveTo(hx - 24, hy + 39, hx - 15, hy + 32);
      ctx.quadraticCurveTo(hx - 7, hy + 38, hx, hy + 32);
      ctx.quadraticCurveTo(hx + 7, hy + 38, hx + 15, hy + 32);
      ctx.quadraticCurveTo(hx + 24, hy + 39, hx + 31 - w, hy + 31);
      ctx.bezierCurveTo(hx + 24, hy + 16, hx + 33, hy - 2, hx + 16, hy - 14);
      ctx.closePath();
      const g = ctx.createLinearGradient(hx, hy - 20, hx, hy + 36);
      g.addColorStop(0, c.hair);
      g.addColorStop(1, c.hairD);
      fillOut(ctx, g);
    } else if (st === 'long') {
      ctx.beginPath();
      ctx.moveTo(hx - 14, hy - 8);
      ctx.bezierCurveTo(hx - 22, hy + 6, hx - 20, hy + 22, hx - 18, hy + 30);
      ctx.lineTo(hx + 18, hy + 30);
      ctx.bezierCurveTo(hx + 20, hy + 22, hx + 22, hy + 6, hx + 14, hy - 8);
      ctx.closePath();
      fillOut(ctx, c.hairD);
    } else if (st === 'bushy') {
      const r = seeded(7);
      for (let i = 0; i < 16; i++) {
        const a = Math.PI * (0.9 + (i / 15) * 1.2) + Math.PI * 0.05;
        const rad = 15 + r() * 6;
        ell(ctx, hx + Math.cos(a) * rad * 1.1, hy + 6 - Math.sin(a) * rad * 0.2 + (i % 3) * 6, 9 + r() * 3, 10 + r() * 4, i % 2 ? c.hair : c.hairD);
      }
      ell(ctx, hx - 17, hy + 16, 9, 13, c.hairD);
      ell(ctx, hx + 17, hy + 16, 9, 13, c.hairD);
    }
  }

  function hairFront(ctx, c, hx, hy, f, t) {
    const st = c.hairStyle;
    if (st === 'wavy') {
      const g = ctx.createLinearGradient(hx, hy - 20, hx, hy + 14);
      g.addColorStop(0, c.hairHi);
      g.addColorStop(0.4, c.hair);
      g.addColorStop(1, c.hairD);
      ctx.beginPath();
      ctx.moveTo(hx - 16, hy + 12);
      ctx.bezierCurveTo(hx - 20, hy - 6, hx - 14, hy - 21, hx, hy - 20);
      ctx.bezierCurveTo(hx + 14, hy - 21, hx + 20, hy - 6, hx + 16, hy + 12);
      ctx.quadraticCurveTo(hx + 12, hy + 3, hx + 12.5, hy - 4);
      ctx.quadraticCurveTo(hx + 5, hy - 6, hx - 3, hy - 12.5);
      ctx.quadraticCurveTo(hx - 9, hy - 10, hx - 12.5, hy - 3);
      ctx.quadraticCurveTo(hx - 13, hy + 4, hx - 16, hy + 12);
      ctx.closePath();
      fillOut(ctx, g);
      // face-framing waves
      const w = Math.sin(t * 1.7) * 0.8;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx + s * 16, hy - 2);
        ctx.bezierCurveTo(hx + s * 23, hy + 8, hx + s * 16, hy + 18, hx + s * (24 + w), hy + 29);
        ctx.strokeStyle = OUT;
        ctx.lineWidth = 11.5;
        ctx.stroke();
        ctx.strokeStyle = c.hair;
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.strokeStyle = c.hairHi;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.strokeStyle = c.hairHi;
      ctx.globalAlpha *= 0.7;
      ctx.lineWidth = 1.1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(hx - 8 + i * 5, hy - 18);
        ctx.quadraticCurveTo(hx - 12 + i * 6, hy - 10, hx - 14 + i * 7, hy - 4 + i);
        ctx.stroke();
      }
      ctx.globalAlpha /= 0.7;
    } else if (st === 'balding') {
      // thin, close-cropped grey hair over a receding crown
      ctx.save();
      ctx.globalAlpha *= 0.45;
      ctx.beginPath();
      ctx.ellipse(hx, hy - 7, 13.5, 9.5, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fillStyle = c.hair;
      ctx.fill();
      ctx.restore();
      ell(ctx, hx - 3, hy - 11, 5.5, 3, 'rgba(255,255,255,.22)');
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx + s * 11.5, hy - 12);
        ctx.quadraticCurveTo(hx + s * 16.5, hy - 8, hx + s * 15.5, hy + 5);
        ctx.quadraticCurveTo(hx + s * 13, hy + 2, hx + s * 12.5, hy - 4);
        ctx.quadraticCurveTo(hx + s * 11, hy - 8, hx + s * 11.5, hy - 12);
        ctx.fillStyle = c.hair;
        ctx.fill();
        ctx.strokeStyle = c.hairD;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      ctx.strokeStyle = c.hair;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(hx - 6 + i * 3, hy - 15.5);
        ctx.quadraticCurveTo(hx - 5 + i * 3, hy - 18.5, hx - 3 + i * 3 + Math.sin(t * 2 + i) * 0.5, hy - 17.5);
        ctx.stroke();
      }
    } else if (st === 'long') {
      for (const s of [-1, 1]) ell(ctx, hx + s * 13, hy - 2, 4.5, 9, c.hair);
      ell(ctx, hx - 2, hy - 11, 6, 3, 'rgba(255,255,255,.25)');
      // beard + moustache
      ctx.beginPath();
      ctx.moveTo(hx - 12, hy + 3);
      ctx.quadraticCurveTo(hx - 12, hy + 24, hx + f * 2, hy + 36);
      ctx.quadraticCurveTo(hx + 12, hy + 24, hx + 12, hy + 3);
      ctx.quadraticCurveTo(hx + 6, hy + 14, hx + f * 2, hy + 13);
      ctx.quadraticCurveTo(hx - 6, hy + 14, hx - 12, hy + 3);
      fillOut(ctx, c.beard);
      ctx.beginPath();
      ctx.moveTo(hx + f * 2.5 - 8, hy + 10);
      ctx.quadraticCurveTo(hx + f * 2.5, hy + 5, hx + f * 2.5 + 8, hy + 10);
      ctx.strokeStyle = c.beard;
      ctx.lineWidth = 3.4;
      ctx.stroke();
    } else if (st === 'bushy') {
      const r = seeded(11);
      for (let i = 0; i < 9; i++) ell(ctx, hx - 15 + i * 3.8, hy - 13 - Math.sin((i / 8) * Math.PI) * 6 + r() * 2, 7 + r() * 2, 6 + r() * 2, i % 2 ? c.hair : c.hairHi);
      ell(ctx, hx - 15, hy - 2, 5, 9, c.hair);
      ell(ctx, hx + 15, hy - 2, 5, 9, c.hair);
    } else if (st === 'mop') {
      ctx.beginPath();
      ctx.moveTo(hx - 16, hy + 2);
      ctx.bezierCurveTo(hx - 19, hy - 18, hx + 19, hy - 18, hx + 16, hy + 2);
      for (let i = 0; i <= 6; i++) ctx.lineTo(hx + 16 - i * 5.3, hy - 4 - (i % 2) * 6 + (i === 3 ? 2 : 0));
      ctx.closePath();
      fillOut(ctx, c.hair);
      ell(ctx, hx - 4, hy - 13, 6, 2.5, c.hairHi);
    } else if (st === 'bun') {
      ell(ctx, hx, hy - 21, 7, 6, c.hairD, OUT);
      ctx.beginPath();
      ctx.moveTo(hx - 15, hy);
      ctx.bezierCurveTo(hx - 17, hy - 20, hx + 17, hy - 20, hx + 15, hy);
      ctx.quadraticCurveTo(hx, hy - 12, hx - 15, hy);
      fillOut(ctx, c.hair);
    } else if (st === 'slick') {
      ctx.beginPath();
      ctx.moveTo(hx - 15, hy + 2);
      ctx.bezierCurveTo(hx - 18, hy - 20, hx + 16, hy - 22, hx + 15, hy - 2);
      ctx.quadraticCurveTo(hx + 4, hy - 12, hx - 15, hy + 2);
      fillOut(ctx, c.hair);
      ell(ctx, hx - 2, hy - 14, 7, 2, c.hairHi);
    }
  }

  // ---------- standing figure (3/4 front view; origin = feet) ----------
  A.figure = function (ctx, key, x, y, s, o = {}) {
    const c = typeof key === 'string' ? G.Chars[key] : key;
    const f = o.face || 1, t = o.t ?? G.t, ph = o.walk || 0, mv = o.moving ? 1 : 0, mood = o.mood;
    const B = c.b || 1, k = s * (c.h || 1);
    ctx.save();
    ctx.translate(x, y);
    if (!o.noShadow) ell(ctx, 0, 0, 30 * B * s, 7.5 * s, 'rgba(0,0,0,.32)');
    ctx.scale(k, k);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.down) {
      ctx.translate(0, -14 * o.down);
      ctx.rotate(-f * (Math.PI / 2) * o.down);
    }
    if (c.aura) A.glow(ctx, 0, -90, 120, c.aura, 0.25 + 0.1 * Math.sin(t * 2));

    const bob = mv ? -Math.abs(Math.sin(ph)) * 3 : Math.sin(t * 2.2 + x * 0.01) * 0.8;
    const sw = mv ? Math.sin(ph) : 0;
    const lifts = [mv ? Math.max(0, Math.cos(ph)) * 6 : 0, mv ? Math.max(0, -Math.cos(ph)) * 6 : 0];
    const hx = f * 1.5, hy = -147 + bob;

    // cloak behind
    if (c.cloak) {
      ctx.beginPath();
      ctx.moveTo(-20 * B, -124 + bob);
      ctx.quadraticCurveTo(-34 * B - sw * 3, -60, -30 * B - sw * 5, -6);
      ctx.lineTo(30 * B - sw * 5, -6);
      ctx.quadraticCurveTo(34 * B - sw * 3, -60, 20 * B, -124 + bob);
      fillOut(ctx, c.cloak);
    }
    if (c.pack) {
      ctx.beginPath();
      ctx.roundRect(-24 * B, -124 + bob, 48 * B, 44, 11);
      fillOut(ctx, '#d98aa9');
    }
    hairBack(ctx, c, hx, hy, t);

    // legs + shoes
    const feet = [];
    for (let i = 0; i < 2; i++) {
      const side = i ? 1 : -1, off = i ? -sw : sw, lift = lifts[i];
      const hipX = side * 9 * B, fx = side * 8 * B + off * 11 * f, fy = -8 - lift;
      const kx = (hipX + fx) / 2 + (lift > 0 ? f * 3 : 0), ky = -36 - lift * 0.5;
      feet.push([fx, fy]);
      if (c.robe) continue;
      const legC = c.pants ? c.shorts : c.skin;
      line(ctx, [hipX, -66, kx, ky, fx, fy], 11 * B, legC);
      if (c.sockH) {
        const fr = clamp(c.sockH / 28, 0, 1);
        line(ctx, [fx, fy, lerp(fx, kx, fr), lerp(fy, ky, fr)], 10.6 * B, c.socks);
      }
    }
    for (const [fx, fy] of feet) {
      ctx.beginPath();
      ctx.ellipse(fx + f * 5, fy + 1, 13 * B, 6, 0, 0, TAU);
      fillOut(ctx, c.shoes);
      ctx.beginPath();
      ctx.ellipse(fx + f * 5, fy + 4, 12.5 * B, 2.4, 0, 0, TAU);
      ctx.fillStyle = c.sole;
      ctx.fill();
    }

    ctx.translate(0, bob);
    if (c.robe) {
      const g = ctx.createLinearGradient(-26 * B, 0, 26 * B, 0);
      g.addColorStop(0, c.robeD);
      g.addColorStop(0.45, c.robe);
      g.addColorStop(1, c.robeD);
      ctx.beginPath();
      ctx.moveTo(-20 * B, -126);
      ctx.quadraticCurveTo(-24 * B, -60, -28 * B - sw * 3, -6 - bob);
      for (let i = 0; i <= 8; i++) ctx.lineTo(-28 * B + i * 7 * B - sw * 3, -6 - bob + (i % 2 ? 3 : 0));
      ctx.quadraticCurveTo(24 * B, -60, 20 * B, -126);
      ctx.closePath();
      fillOut(ctx, g);
      ctx.strokeStyle = 'rgba(0,0,0,.25)';
      ctx.lineWidth = 1.5;
      for (const fx of [-10, 4, 14]) { ctx.beginPath(); ctx.moveTo(fx * B, -100); ctx.lineTo(fx * B * 1.3 - sw * 2, -12 - bob); ctx.stroke(); }
      if (c.trim) line(ctx, [0, -126, 0, -8 - bob], 3, c.trim, false);
      if (c.apron) {
        ctx.beginPath();
        ctx.roundRect(-14 * B, -96, 28 * B, 70, 6);
        fillOut(ctx, c.apron);
      }
    } else {
      // shorts / trousers top
      const sc = c.shorts;
      ctx.beginPath();
      ctx.moveTo(-19 * B, -84);
      ctx.lineTo(19 * B, -84);
      ctx.lineTo(21 * B - sw * f * 4, c.pants ? -60 : -48);
      ctx.lineTo(1, c.pants ? -60 : -50);
      ctx.lineTo(0, -60);
      ctx.lineTo(-1, c.pants ? -60 : -50);
      ctx.lineTo(-21 * B + sw * f * 4, c.pants ? -60 : -48);
      ctx.closePath();
      fillOut(ctx, sc);
      if (c.belt) {
        ctx.fillStyle = c.belt;
        ctx.fillRect(-19 * B, -86, 38 * B, 5);
        ctx.fillStyle = '#c9c9cf';
        ctx.fillRect(-2, -86, 4, 5);
      }
    }

    // torso
    const tc = c.armor || c.shirt, tcD = c.armorD || c.shirtD;
    if (tc && !c.robe) {
      const g = ctx.createLinearGradient(-21 * B, 0, 21 * B, 0);
      g.addColorStop(0, tcD);
      g.addColorStop(0.42, tc);
      g.addColorStop(1, tcD);
      ctx.beginPath();
      ctx.moveTo(-7, -131);
      ctx.quadraticCurveTo(-20 * B, -130, -22 * B, -122);
      ctx.lineTo(-20 * B, -106);
      ctx.lineTo(-19 * B, -80);
      ctx.lineTo(19 * B, -80);
      ctx.lineTo(20 * B, -106);
      ctx.lineTo(22 * B, -122);
      ctx.quadraticCurveTo(20 * B, -130, 7, -131);
      ctx.closePath();
      fillOut(ctx, g);
      if (c.print) {
        const px = -9 + f * 2;
        ctx.fillStyle = '#2f9fd8'; ctx.fillRect(px, -118, 18, 16);
        ctx.fillStyle = '#e03a35'; ctx.fillRect(px + 3, -115, 12, 10);
        ctx.fillStyle = '#f7d531'; ctx.fillRect(px + 5, -113, 8, 6);
        ctx.fillStyle = '#2f6fd8'; ctx.fillRect(px + 6, -111, 6, 1.5);
        ctx.fillStyle = '#fff'; ctx.fillRect(px + 1, -104, 2, 2); ctx.fillRect(px + 14, -117, 2, 2);
      }
      if (c.emblem) { ctx.fillStyle = c.emblem; ctx.fillRect(-11 * B + f * 2, -118, 3, 2.5); }
      if (c.jacket) {
        ctx.beginPath();
        ctx.moveTo(-6, -131); ctx.lineTo(0, -104); ctx.lineTo(6, -131); ctx.closePath();
        ctx.fillStyle = c.inner; ctx.fill();
        line(ctx, [-6, -131, 0, -100, 0, -80], 1.2, 'rgba(0,0,0,.4)', false);
      }
      if (c.armor) {
        ctx.strokeStyle = 'rgba(255,255,255,.12)';
        ctx.lineWidth = 1.3;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-17 * B, -112 + i * 10); ctx.quadraticCurveTo(0, -108 + i * 10, 17 * B, -112 + i * 10); ctx.stroke(); }
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 21 * B, -122, 9 * B, 6, s * 0.3, 0, TAU); fillOut(ctx, c.armorD); }
        line(ctx, [-18 * B, -126, 18 * B, -88], 4, '#7a1420', false);
      }
    }
    if (c.pack) {
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 12 * B, -130);
        ctx.quadraticCurveTo(s * 17 * B, -112, s * 14 * B, -94);
        ctx.strokeStyle = '#1d1d22'; ctx.lineWidth = 5.5; ctx.stroke();
        ctx.strokeStyle = c.pack; ctx.lineWidth = 3.6; ctx.stroke();
      }
    }

    // arms
    const cast = o.cast || 0;
    for (let i = 0; i < 2; i++) {
      const side = i ? 1 : -1;
      const sx = side * 20 * B, sy = -121;
      let hxp = side * 24 * B - (i ? -sw : sw) * f * 7, hyp = -76;
      let ex2 = (sx + hxp) / 2 + side * 3, ey2 = -100;
      const castArm = cast > 0 && side === f;
      if (castArm) {
        hxp = lerp(hxp, f * 46, cast); hyp = lerp(hyp, -126, cast);
        ex2 = lerp(ex2, f * 32, cast); ey2 = lerp(ey2, -116, cast);
      }
      if (c.staff && side === f && !castArm) { hxp = f * 27; hyp = -96; ex2 = f * 26; ey2 = -106; }
      const longSleeve = c.robe || c.jacket || c.armor;
      const sleeveC = c.robe || c.shirt || c.armor;
      if (longSleeve) {
        line(ctx, [sx, sy, ex2, ey2, hxp, hyp], 10 * B, sleeveC);
      } else {
        line(ctx, [sx, sy, ex2, ey2, hxp, hyp], 8.5 * B, c.skin);
        line(ctx, [sx, sy, lerp(sx, ex2, 0.75), lerp(sy, ey2, 0.75)], 12 * B, c.shirt);
      }
      const watch = side === -1 ? c.watchL : c.watchR;
      if (watch) {
        const wx = lerp(ex2, hxp, 0.82), wy = lerp(ey2, hyp, 0.82);
        line(ctx, [wx - 0.1, wy - 2, wx + 0.1, wy + 2], 9.6 * B, watch, false);
      }
      ell(ctx, hxp, hyp + 2, 4.8, 5, c.skin, OUT, 1.2);
      if (castArm) {
        line(ctx, [hxp, hyp, hxp + f * 18, hyp - 8], 2.2, '#5a3a22', false);
        A.glow(ctx, hxp + f * 19, hyp - 9, 14 + 6 * Math.sin(t * 20), o.castCol || '#9fd8ff', 0.9);
      }
      if (c.staff && side === f && !castArm) {
        line(ctx, [f * 27, -160, f * 28, -4], 3.2, '#6b4a2a');
        A.glow(ctx, f * 27, -163, 16 + 3 * Math.sin(t * 3), '#ffd27a', 0.75);
        ell(ctx, f * 27, -163, 3.5, 3.5, '#fff1c4');
      }
      if (c.glassesInHand && side === f && !castArm && !mv) {
        line(ctx, [hxp - 2, hyp + 6, hxp + 2, hyp + 18], 1.4, '#222', false);
        ctx.strokeStyle = '#222'; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.roundRect(hxp - 4, hyp + 10, 7, 6, 2); ctx.stroke();
      }
    }

    // neck + head
    ctx.fillStyle = c.skinD || '#999';
    if (!c.helm) ctx.fillRect(-5, -137, 10, 9);
    face(ctx, c, hx, hy - bob, f, mood, t);
    if (!c.helm) hairFront(ctx, c, hx, hy - bob, f, t);
    ctx.restore();
  };

  // ---------- rider on broom (side profile, facing right; origin = broom centre) ----------
  A.rider = function (ctx, key, x, y, s, o = {}) {
    const c = typeof key === 'string' ? G.Chars[key] : key;
    const t = o.t ?? G.t, wv = Math.sin(t * 14);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(o.tilt || 0);
    ctx.scale(s, s);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;

    // bristles
    const br = ctx.createLinearGradient(-118, 0, -60, 0);
    br.addColorStop(0, '#8a6a2a');
    br.addColorStop(1, '#e2bf6a');
    ctx.beginPath();
    ctx.moveTo(-60, 2);
    ctx.lineTo(-114, -14 + wv);
    ctx.quadraticCurveTo(-122, 6, -114, 24 - wv);
    ctx.closePath();
    fillOut(ctx, br);
    ctx.strokeStyle = 'rgba(90,60,20,.55)';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-62, 2 + (i - 3) * 0.8); ctx.lineTo(-114, -10 + i * 5 + wv * 0.5); ctx.stroke(); }
    // handle
    line(ctx, [-64, 3, 70, -3], 5.5, '#7a4a22');
    line(ctx, [-30, 0, 66, -3.5], 1.3, '#a8743f', false);
    line(ctx, [-62, -2, -62, 8], 5, '#8a1f1f', false);
    if (o.boost) A.glow(ctx, -116, 5, 40, '#ffcc66', 0.8);

    // scarf
    if (c.scarf) {
      ctx.beginPath();
      ctx.moveTo(8, -46);
      for (let i = 1; i <= 6; i++) ctx.lineTo(8 - i * 11, -44 + Math.sin(t * 12 - i * 0.9) * (2 + i * 1.2));
      ctx.strokeStyle = OUT; ctx.lineWidth = 8.5; ctx.stroke();
      ctx.strokeStyle = c.scarf; ctx.lineWidth = 6.5; ctx.stroke();
    }
    const legC = c.pants ? c.shorts : c.skin, robeC = c.robe;
    const leg = (dx) => {
      line(ctx, [-14 + dx, -14, 10 + dx, -2], 11, robeC || c.shorts);
      line(ctx, [10 + dx, -2, 2 + dx, 15], 9.5, robeC || legC);
      if (c.sockH && !robeC) line(ctx, [2 + dx, 15, 5 + dx, 7], 9.6, c.socks);
      ctx.beginPath(); ctx.ellipse(6 + dx, 18, 9, 4.5, 0.15, 0, TAU); fillOut(ctx, c.shoes);
    };
    leg(-4);
    // back arm
    const tc = c.armor || c.shirt || robeC;
    line(ctx, [2, -42, 18, -24, 32, -3], 8, c.jacket || c.armor || robeC ? tc : c.skin);
    // torso
    line(ctx, [-14, -14, 4, -42], 23, tc);
    if (c.pack) { ctx.beginPath(); ctx.roundRect(-26, -46, 20, 30, 7); fillOut(ctx, '#d98aa9'); }
    if (c.print) { ctx.fillStyle = '#e03a35'; ctx.fillRect(-2, -34, 8, 8); ctx.fillStyle = '#f7d531'; ctx.fillRect(0, -32, 4, 4); }
    // head
    const hx = 15, hy = -60;
    if (c.helm) {
      ctx.beginPath(); ctx.ellipse(hx - 2, hy, 16, 17, 0, 0, TAU); fillOut(ctx, c.cloak);
      ctx.beginPath(); ctx.ellipse(hx + 5, hy + 1, 9, 12, 0, 0, TAU); fillOut(ctx, '#c9ced6');
      ell(ctx, hx + 9, hy - 2, 2.6, 3, '#000'); A.glow(ctx, hx + 9, hy - 2, 7, c.visor, 0.9);
    } else {
      if (c.hairStyle === 'wavy') {
        ctx.beginPath();
        ctx.moveTo(hx + 8, hy - 13);
        ctx.quadraticCurveTo(hx - 6, hy - 22, hx - 12, hy - 6);
        for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(hx - 20 - i * 9, hy - 4 + Math.sin(t * 10 + i) * 4 + i * 2, hx - 24 - i * 9, hy + 6 + Math.sin(t * 10 + i + 1) * 4);
        ctx.quadraticCurveTo(hx - 14, hy + 16, hx - 4, hy + 10);
        ctx.closePath();
        fillOut(ctx, c.hair);
      }
      if (c.hairStyle === 'bushy') { ell(ctx, hx - 8, hy - 2, 16, 15, c.hair, OUT); }
      if (c.hairStyle === 'long') { ell(ctx, hx - 6, hy + 2, 12, 15, c.hair, OUT); }
      ctx.beginPath(); ctx.ellipse(hx, hy, 12.5, 14.5, 0, 0, TAU); fillOut(ctx, c.skin);
      ell(ctx, hx - 3, hy + 1, 2.6, 4, c.skinD);
      ctx.beginPath(); ctx.moveTo(hx + 12, hy - 4); ctx.quadraticCurveTo(hx + 17, hy + 1, hx + 12, hy + 3); ctx.fillStyle = c.skin; ctx.fill();
      ell(ctx, hx + 7.5, hy - 3, 1.5, 1.9, '#1a1210');
      line(ctx, [hx + 6, hy + 8, hx + 10, hy + 7], 1.3, '#6a2f2c', false);
      if (c.glasses) {
        ctx.strokeStyle = c.glasses; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.roundRect(hx + 3.5, hy - 7, 9, 7.5, 3); ctx.stroke();
        line(ctx, [hx + 3.5, hy - 4, hx - 3, hy - 2], 1.4, c.glasses, false);
      }
      if (c.hairStyle === 'wavy') {
        ctx.beginPath(); ctx.moveTo(hx + 12, hy - 6); ctx.quadraticCurveTo(hx + 6, hy - 18, hx - 8, hy - 12); ctx.quadraticCurveTo(hx, hy - 10, hx + 12, hy - 6); fillOut(ctx, c.hairHi);
      } else if (c.hairStyle === 'balding') {
        ell(ctx, hx - 6, hy - 1, 5, 7, c.hair);
        ell(ctx, hx + 1, hy - 10, 5, 2.5, 'rgba(255,255,255,.3)');
      } else if (c.hairStyle === 'mop' || c.hairStyle === 'slick' || c.hairStyle === 'bun') {
        ctx.beginPath(); ctx.moveTo(hx + 11, hy - 6); ctx.quadraticCurveTo(hx + 2, hy - 22, hx - 13, hy - 4); ctx.quadraticCurveTo(hx - 2, hy - 10, hx + 11, hy - 6); fillOut(ctx, c.hair);
        if (c.hairStyle === 'bun') ell(ctx, hx - 12, hy - 10, 6, 6, c.hairD, OUT);
      } else if (c.hairStyle === 'bushy') {
        ell(ctx, hx - 2, hy - 10, 13, 7, c.hairHi);
      } else if (c.hairStyle === 'long') {
        ctx.beginPath(); ctx.moveTo(hx + 6, hy + 4); ctx.quadraticCurveTo(hx + 8, hy + 22, hx - 2, hy + 26); ctx.quadraticCurveTo(hx - 2, hy + 10, hx + 6, hy + 4); fillOut(ctx, c.beard);
      }
    }
    leg(4);
    // front arm
    line(ctx, [6, -40, 22, -22, 40, -2], 8.5, c.jacket || c.armor || robeC ? tc : c.skin);
    if (!(c.jacket || c.armor || robeC)) line(ctx, [6, -40, 13, -32], 11, c.shirt);
    ell(ctx, 40, -2, 4.6, 4.6, c.skin, OUT, 1.1);
    ell(ctx, 32, -3, 4.2, 4.2, c.skin, OUT, 1.1);
    if (o.shield) {
      ctx.globalAlpha *= 0.5 + 0.2 * Math.sin(t * 8);
      ell(ctx, 0, -20, 78, 70, 'rgba(140,220,255,.12)', '#9fe4ff', 2);
    }
    ctx.restore();
  };

  // ---------- portrait bust ----------
  A.bust = function (canvas, key, mood, size = 168) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * Math.max(1, G.scale || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const c = G.Chars[key];
    const g = ctx.createRadialGradient(size * 0.5, size * 0.42, 6, size * 0.5, size * 0.5, size * 0.8);
    g.addColorStop(0, c ? c.tint : '#333');
    g.addColorStop(1, '#07060c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    if (!c) return;
    const k = 2.75 * (size / 168);
    const s = k / (c.h || 1);
    ctx.save();
    A.figure(ctx, key, size / 2 - 1.5 * k, size * 0.5 + 147 * k, s, { noShadow: true, mood, face: 1, t: G.t });
    ctx.restore();
    const v = ctx.createRadialGradient(size / 2, size / 2, size * 0.35, size / 2, size / 2, size * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, size, size);
  };

  // ---------- shared environment pieces ----------
  let cloud = null;
  A.cloud = () => {
    if (cloud) return cloud;
    cloud = G.U.layer(300, 140, (x) => {
      const r = seeded(42);
      for (let i = 0; i < 22; i++) {
        const cx = 50 + r() * 200, cy = 60 + r() * 40 - Math.sin(((cx - 50) / 200) * Math.PI) * 25, rad = 22 + r() * 30;
        const g = x.createRadialGradient(cx, cy - rad * 0.3, 2, cx, cy, rad);
        g.addColorStop(0, 'rgba(255,255,255,.95)');
        g.addColorStop(0.6, 'rgba(235,230,245,.6)');
        g.addColorStop(1, 'rgba(220,215,235,0)');
        x.fillStyle = g;
        x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.fill();
      }
    }, 2);
    return cloud;
  };

  // The regime's sigil: a ringed eye.
  A.sigil = (ctx, x, y, r, col, a = 1) => {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = col;
    ctx.lineWidth = r * 0.09;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r * 0.75, y);
    ctx.quadraticCurveTo(x, y - r * 0.6, x + r * 0.75, y);
    ctx.quadraticCurveTo(x, y + r * 0.6, x - r * 0.75, y);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.12, r * 0.26, 0, 0, TAU); ctx.fill();
    ctx.restore();
  };

  A.banner = (ctx, x, y, w, h, t) => {
    const sway = Math.sin(t * 1.3 + x * 0.01) * 3;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#4a0a12');
    g.addColorStop(0.5, '#8e1724');
    g.addColorStop(1, '#4a0a12');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w + sway, y + h);
    ctx.lineTo(x + w / 2 + sway, y + h - 18);
    ctx.lineTo(x + sway, y + h);
    ctx.closePath();
    fillOut(ctx, g);
    line(ctx, [x - 6, y, x + w + 6, y], 4, '#c9a24a', false);
    A.sigil(ctx, x + w / 2 + sway * 0.5, y + h * 0.38, w * 0.3, '#e8c46a', 0.9);
  };

  A.vignette = (ctx, a = 0.55) => {
    const g = ctx.createRadialGradient(G.W / 2, G.H / 2, G.H * 0.35, G.W / 2, G.H / 2, G.H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${a})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, G.W, G.H);
  };

  // ---------- MARKET (Diagon Row) ----------
  const M = { sky: null, far: null, gen: -1 };
  const facades = [];
  (() => {
    const r = seeded(19);
    let x = -100;
    const cols = ['#5a3b2e', '#4a3b4e', '#3e4a3c', '#5b4a32', '#47343c'];
    while (x < 3400) {
      const w = 220 + r() * 120;
      facades.push({ x, w, h: 230 + r() * 120, col: cols[(r() * cols.length) | 0], roof: r() < 0.5 ? 'peak' : 'flat', banner: r() < 0.38, poster: r() < 0.5, seed: (r() * 1e6) | 0 });
      x += w + 6;
    }
  })();
  const stalls = [
    { x: 560, awn: ['#b8333a', '#f0e2c4'], goods: 'bread' },
    { x: 940, awn: ['#2f6f8f', '#f0e2c4'], goods: 'fruit' },
    { x: 1700, awn: ['#6b3f8f', '#f0e2c4'], goods: 'potions' },
  ];
  function buildMarketLayers() {
    M.gen = G.layerGen;
    M.sky = G.U.layer(G.W, 480, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0b0f26');
      g.addColorStop(0.45, '#2a2350');
      g.addColorStop(0.78, '#8a4b5c');
      g.addColorStop(1, '#e39a62');
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      const r = seeded(5);
      for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.6})`; x.fillRect(r() * w, r() * h * 0.5, 1.2, 1.2); }
      // the Mark in the sky
      const sg = x.createRadialGradient(930, 130, 10, 930, 130, 170);
      sg.addColorStop(0, 'rgba(90,255,160,.22)');
      sg.addColorStop(1, 'rgba(90,255,160,0)');
      x.fillStyle = sg;
      x.fillRect(700, -60, 460, 380);
      A.sigil(x, 930, 130, 70, 'rgba(130,255,180,.55)');
    });
    const FW = 2300;
    M.far = G.U.layer(FW, 480, (x) => {
      const r = seeded(77);
      // distant tower of the Dark Lord
      x.fillStyle = '#120f22';
      x.beginPath(); x.moveTo(1180, 470); x.lineTo(1200, 90); x.lineTo(1215, 40); x.lineTo(1230, 90); x.lineTo(1250, 470); x.fill();
      const tg = x.createRadialGradient(1215, 45, 0, 1215, 45, 60);
      tg.addColorStop(0, 'rgba(110,255,170,.9)'); tg.addColorStop(1, 'rgba(110,255,170,0)');
      x.fillStyle = tg; x.fillRect(1150, -20, 130, 130);
      let bx = 0;
      while (bx < FW) {
        const w = 50 + r() * 110, h = 90 + r() * 170;
        x.fillStyle = r() < 0.5 ? '#1b1731' : '#221c38';
        x.fillRect(bx, 470 - h, w, h);
        if (r() < 0.5) { x.beginPath(); x.moveTo(bx - 4, 470 - h); x.lineTo(bx + w / 2, 470 - h - 30 - r() * 40); x.lineTo(bx + w + 4, 470 - h); x.fill(); }
        for (let wy = 470 - h + 14; wy < 455; wy += 18) for (let wx = bx + 8; wx < bx + w - 8; wx += 14) if (r() < 0.22) { x.fillStyle = `rgba(255,${190 + r() * 40},110,${0.5 + r() * 0.4})`; x.fillRect(wx, wy, 5, 7); }
        bx += w + r() * 10;
      }
    });
  }

  function facade(ctx, f, sx, t) {
    const top = 470 - f.h, r = seeded(f.seed);
    const g = ctx.createLinearGradient(0, top, 0, 470);
    g.addColorStop(0, f.col);
    g.addColorStop(1, '#1d1622');
    ctx.fillStyle = g;
    ctx.fillRect(sx, top, f.w, f.h);
    // timber frame
    ctx.strokeStyle = 'rgba(25,15,10,.8)';
    ctx.lineWidth = 6;
    ctx.strokeRect(sx + 3, top + 3, f.w - 6, f.h - 6);
    ctx.beginPath(); ctx.moveTo(sx, top + f.h * 0.45); ctx.lineTo(sx + f.w, top + f.h * 0.45); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx + 6, top + 6); ctx.lineTo(sx + f.w / 2, top + f.h * 0.45); ctx.lineTo(sx + f.w - 6, top + 6); ctx.stroke();
    if (f.roof === 'peak') {
      ctx.fillStyle = '#2a1c22';
      ctx.beginPath(); ctx.moveTo(sx - 12, top + 4); ctx.lineTo(sx + f.w / 2, top - 70); ctx.lineTo(sx + f.w + 12, top + 4); ctx.fill();
    } else {
      ctx.fillStyle = '#2a1c22';
      ctx.fillRect(sx - 8, top - 12, f.w + 16, 16);
    }
    // windows
    const nw = Math.max(2, Math.floor(f.w / 90));
    for (let i = 0; i < nw; i++) {
      const wx = sx + 24 + i * ((f.w - 48) / nw) + 8, wy = top + 30;
      const lit = r() < 0.7;
      ctx.fillStyle = lit ? '#f7c56b' : '#1b1a2a';
      ctx.fillRect(wx, wy, 38, 46);
      if (lit) A.glow(ctx, wx + 19, wy + 23, 48, 'rgba(255,190,100,.45)', 0.8);
      ctx.strokeStyle = '#2a1a12'; ctx.lineWidth = 3; ctx.strokeRect(wx, wy, 38, 46);
      ctx.beginPath(); ctx.moveTo(wx + 19, wy); ctx.lineTo(wx + 19, wy + 46); ctx.moveTo(wx, wy + 23); ctx.lineTo(wx + 38, wy + 23); ctx.stroke();
    }
    // shopfront
    const dx = sx + f.w * 0.5 - 22;
    ctx.fillStyle = '#24160f';
    ctx.beginPath(); ctx.roundRect(dx, 470 - 92, 44, 92, [22, 22, 0, 0]); ctx.fill();
    ctx.fillStyle = 'rgba(255,190,100,.25)'; ctx.fillRect(dx + 6, 470 - 80, 32, 30);
    if (f.poster) {
      const px = sx + 20, py = 470 - 120;
      ctx.fillStyle = '#d8ccb0'; ctx.fillRect(px, py, 48, 64);
      A.sigil(ctx, px + 24, py + 24, 13, '#8e1724');
      ctx.fillStyle = '#8e1724'; ctx.font = '700 10px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText('OBEY', px + 24, py + 52);
      ctx.font = '7px Cinzel, serif'; ctx.fillText("IT'S EASIER", px + 24, py + 60);
    }
    if (f.banner) A.banner(ctx, sx + f.w - 78, top + 18, 50, 140, t);
  }

  function stall(ctx, s, sx, t) {
    const y = 488;
    ctx.fillStyle = '#3b2616';
    ctx.fillRect(sx - 90, y - 120, 8, 120);
    ctx.fillRect(sx + 82, y - 120, 8, 120);
    // table
    ctx.fillStyle = '#5a3a20'; ctx.fillRect(sx - 96, y - 46, 192, 14);
    ctx.fillStyle = '#3b2616'; ctx.fillRect(sx - 92, y - 32, 184, 32);
    // goods
    const r = seeded(s.x);
    for (let i = 0; i < 9; i++) {
      const gx = sx - 80 + i * 20, gy = y - 52;
      if (s.goods === 'bread') { ell(ctx, gx, gy, 9, 6, '#c58a45', OUT); ell(ctx, gx - 2, gy - 2, 4, 2, '#e7b874'); }
      else if (s.goods === 'fruit') ell(ctx, gx, gy, 7, 7, ['#d63a3a', '#e7a23a', '#7ab84a'][i % 3], OUT);
      else { ctx.fillStyle = ['#7a3fcf', '#3fcf9a', '#cf3f7a'][i % 3]; ctx.beginPath(); ctx.roundRect(gx - 5, gy - 14, 10, 16, 3); ctx.fill(); A.glow(ctx, gx, gy - 6, 14, ctx.fillStyle, 0.4 + 0.2 * Math.sin(t * 3 + i)); ctx.fillStyle = '#c9a24a'; ctx.fillRect(gx - 2, gy - 18, 4, 4); }
      if (r() < 0.2) continue;
    }
    // awning
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = s.awn[i % 2];
      ctx.beginPath();
      ctx.moveTo(sx - 110 + i * 27.5, y - 150);
      ctx.lineTo(sx - 110 + (i + 1) * 27.5, y - 150);
      ctx.lineTo(sx - 110 + (i + 1) * 27.5, y - 118);
      ctx.quadraticCurveTo(sx - 110 + (i + 0.5) * 27.5, y - 108, sx - 110 + i * 27.5, y - 118);
      ctx.fill();
    }
    line(ctx, [sx - 112, y - 151, sx + 112, y - 151], 4, '#2a1a12', false);
  }

  function lamp(ctx, sx, t) {
    line(ctx, [sx, 480, sx, 300], 6, '#1b1620', false);
    line(ctx, [sx, 300, sx + 26, 296], 4, '#1b1620', false);
    ctx.fillStyle = '#1b1620'; ctx.fillRect(sx + 18, 296, 16, 26);
    const fl = 0.85 + 0.15 * Math.sin(t * 9 + sx);
    ctx.fillStyle = `rgba(255,214,140,${fl})`; ctx.fillRect(sx + 21, 300, 10, 18);
    A.glow(ctx, sx + 26, 309, 90, 'rgba(255,190,110,.55)', fl);
  }

  function fountain(ctx, sx, t) {
    const y = 480;
    // statue of the Dark Lord
    ctx.fillStyle = '#2a2833';
    ctx.beginPath(); ctx.moveTo(sx - 18, y - 70); ctx.lineTo(sx - 26, y - 190); ctx.lineTo(sx, y - 230); ctx.lineTo(sx + 26, y - 190); ctx.lineTo(sx + 18, y - 70); ctx.fill();
    ell(ctx, sx, y - 238, 12, 14, '#2f2d3a');
    A.glow(ctx, sx - 4, y - 240, 8, '#ff3344', 0.8);
    A.glow(ctx, sx + 4, y - 240, 8, '#ff3344', 0.8);
    ctx.fillStyle = '#4a4656'; ctx.fillRect(sx - 40, y - 80, 80, 14);
    // basin
    const g = ctx.createLinearGradient(0, y - 60, 0, y);
    g.addColorStop(0, '#6a6676'); g.addColorStop(1, '#2e2b38');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(sx, y - 30, 120, 24, 0, 0, TAU); ctx.fill();
    ctx.fillRect(sx - 120, y - 30, 240, 26);
    ell(ctx, sx, y - 34, 104, 16, '#2b4a63');
    for (let i = 0; i < 5; i++) ell(ctx, sx - 60 + i * 30 + Math.sin(t * 2 + i) * 4, y - 34, 10, 2, 'rgba(160,210,255,.35)');
    for (const s of [-1, 1]) {
      ctx.strokeStyle = 'rgba(160,210,255,.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx + s * 20, y - 80); ctx.quadraticCurveTo(sx + s * 60, y - 110 + Math.sin(t * 6) * 2, sx + s * 80, y - 38); ctx.stroke();
    }
  }

  A.marketBack = (ctx, camX, t) => {
    if (M.gen !== G.layerGen) buildMarketLayers();
    ctx.drawImage(M.sky, 0, 0, G.W, 480);
    const fx = -camX * 0.25;
    ctx.drawImage(M.far, fx, 0, M.far.lw, 480);
    // haze
    const hz = ctx.createLinearGradient(0, 300, 0, 480);
    hz.addColorStop(0, 'rgba(227,154,98,0)'); hz.addColorStop(1, 'rgba(227,154,98,.25)');
    ctx.fillStyle = hz; ctx.fillRect(0, 300, G.W, 180);
    for (const f of facades) { const sx = f.x - camX; if (sx > G.W + 20 || sx + f.w < -20) continue; facade(ctx, f, sx, t); }
    // ground
    const gg = ctx.createLinearGradient(0, 470, 0, G.H);
    gg.addColorStop(0, '#4a4150'); gg.addColorStop(1, '#1e1a24');
    ctx.fillStyle = gg; ctx.fillRect(0, 470, G.W, G.H - 470);
    let y = 476, rh = 10, row = 0;
    while (y < G.H) {
      const sw2 = 26 + rh * 2.2, off = (row % 2) * sw2 * 0.5;
      const first = Math.floor((camX - off) / sw2) - 1;
      for (let i = first; i < first + G.W / sw2 + 3; i++) {
        const wx = i * sw2 + off - camX, n = ((i * 73856093) ^ (row * 19349663)) >>> 0;
        const sh = 54 + (n % 22);
        ctx.fillStyle = `rgb(${sh + 6},${sh},${sh + 12})`;
        ctx.beginPath(); ctx.roundRect(wx + 2, y + 1, sw2 - 4, rh - 2, Math.min(6, rh / 2)); ctx.fill();
      }
      y += rh; rh *= 1.16; row++;
    }
    const sh = ctx.createLinearGradient(0, 470, 0, 520);
    sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh; ctx.fillRect(0, 470, G.W, 50);
    for (let lx = 200; lx < 3200; lx += 430) { const sx = lx - camX; if (sx > -120 && sx < G.W + 120) lamp(ctx, sx, t); }
    for (const s of stalls) { const sx = s.x - camX; if (sx > -150 && sx < G.W + 150) stall(ctx, s, sx, t); }
    const fsx = 2620 - camX;
    if (fsx > -200 && fsx < G.W + 200) fountain(ctx, fsx, t);
    // notice board
    const nsx = 1460 - camX;
    if (nsx > -100 && nsx < G.W + 100) noticeBoard(ctx, nsx, 486, '#d8ccb0', 'DERBY');
  };

  function noticeBoard(ctx, sx, y, paper, label) {
    line(ctx, [sx - 34, y, sx - 34, y - 110], 5, '#3b2616', false);
    line(ctx, [sx + 34, y, sx + 34, y - 110], 5, '#3b2616', false);
    ctx.fillStyle = '#5a3a20'; ctx.fillRect(sx - 44, y - 140, 88, 70);
    ctx.fillStyle = paper; ctx.fillRect(sx - 36, y - 134, 40, 52);
    ctx.fillStyle = '#efe4c8'; ctx.fillRect(sx + 8, y - 128, 28, 36);
    ctx.fillStyle = '#8e1724'; ctx.font = '700 9px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText(label, sx - 16, y - 120);
    ctx.fillStyle = '#5a4a3a';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 32, y - 112 + i * 6, 32, 2);
  }
  A.noticeBoard = noticeBoard;

  A.marketFront = (ctx) => A.vignette(ctx, 0.5);

  // ---------- HANGAR ----------
  A.hangarBack = (ctx, camX, t) => {
    const W = G.W;
    // wall
    const wg = ctx.createLinearGradient(0, 0, 0, 480);
    wg.addColorStop(0, '#1e140e'); wg.addColorStop(1, '#4a3222');
    ctx.fillStyle = wg; ctx.fillRect(0, 0, W, 480);
    const plank = 46, first = Math.floor(camX / plank);
    for (let i = first; i < first + W / plank + 2; i++) {
      const sx = i * plank - camX;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(0,0,0,.18)' : i % 3 === 1 ? 'rgba(255,220,180,.04)' : 'rgba(0,0,0,.08)';
      ctx.fillRect(sx, 0, plank - 2, 480);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(sx + plank - 2, 0, 2, 480);
    }
    // arched windows onto the stadium
    for (let wx = 160; wx < 2000; wx += 560) {
      const sx = wx - camX;
      if (sx < -260 || sx > W + 60) continue;
      ctx.save();
      ctx.beginPath(); ctx.roundRect(sx, 70, 200, 280, [100, 100, 6, 6]); ctx.clip();
      const sg = ctx.createLinearGradient(0, 70, 0, 350);
      sg.addColorStop(0, '#1b1f45'); sg.addColorStop(0.6, '#7a4a6a'); sg.addColorStop(1, '#e8a066');
      ctx.fillStyle = sg; ctx.fillRect(sx, 70, 200, 280);
      ctx.fillStyle = '#140f1c';
      ctx.beginPath(); ctx.moveTo(sx - 10, 350); ctx.lineTo(sx - 10, 270); ctx.quadraticCurveTo(sx + 100, 230, sx + 210, 270); ctx.lineTo(sx + 210, 350); ctx.fill();
      for (let i = 0; i < 4; i++) { const lx = sx + 20 + i * 55; line(ctx, [lx, 270, lx, 200], 2, '#140f1c', false); A.glow(ctx, lx, 198, 26, 'rgba(255,240,200,.7)', 0.8); }
      const cx = sx + ((t * 40 + wx) % 260) - 30;
      ctx.fillStyle = '#140f1c'; ctx.fillRect(cx, 150 + Math.sin(t * 2 + wx) * 6, 22, 2);
      ctx.restore();
      ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.roundRect(sx, 70, 200, 280, [100, 100, 6, 6]); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx + 100, 70); ctx.lineTo(sx + 100, 350); ctx.moveTo(sx, 210); ctx.lineTo(sx + 200, 210); ctx.stroke();
    }
    // beams
    ctx.fillStyle = '#20150d'; ctx.fillRect(0, 30, W, 22);
    for (let bx = 0; bx < 2000; bx += 280) { const sx = bx - camX; if (sx > -40 && sx < W + 40) ctx.fillRect(sx, 0, 24, 480); }
    // team banner
    const tb = 760 - camX;
    if (tb > -300 && tb < W + 300) {
      const g = ctx.createLinearGradient(tb, 0, tb + 260, 0);
      g.addColorStop(0, '#0f4a4a'); g.addColorStop(0.5, '#1d7a72'); g.addColorStop(1, '#0f4a4a');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(tb, 64); ctx.lineTo(tb + 260, 64); ctx.lineTo(tb + 260, 150); ctx.lineTo(tb + 130, 170); ctx.lineTo(tb, 150); ctx.fill();
      ctx.fillStyle = '#e8c46a'; ctx.font = '700 22px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText('HOLLOW HILL', tb + 130, 102); ctx.font = '700 16px Cinzel, serif'; ctx.fillText('HARRIERS', tb + 130, 128);
    }
    // broom racks
    for (const bx of [120, 1260, 1440]) {
      const sx = bx - camX;
      if (sx < -200 || sx > W + 200) continue;
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(sx, 300, 150, 10); ctx.fillRect(sx, 420, 150, 10);
      for (let i = 0; i < 5; i++) {
        const x2 = sx + 14 + i * 30;
        line(ctx, [x2, 250, x2 + 6, 470], 4, '#7a4a22', false);
        ctx.fillStyle = '#d9b25a'; ctx.beginPath(); ctx.moveTo(x2 + 2, 440); ctx.lineTo(x2 - 8, 478); ctx.lineTo(x2 + 18, 478); ctx.lineTo(x2 + 9, 440); ctx.fill();
      }
    }
    // floor
    const fg = ctx.createLinearGradient(0, 470, 0, G.H);
    fg.addColorStop(0, '#5a3d26'); fg.addColorStop(1, '#2a1b10');
    ctx.fillStyle = fg; ctx.fillRect(0, 470, W, G.H - 470);
    let y = 470, rh = 12;
    while (y < G.H) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(0, y, W, 2); y += rh; rh *= 1.2; }
    // lanterns
    for (let lx = 300; lx < 2000; lx += 400) {
      const sx = lx - camX;
      if (sx < -100 || sx > W + 100) continue;
      line(ctx, [sx, 52, sx, 150], 2, '#140c08', false);
      ctx.fillStyle = '#2a1a10'; ctx.fillRect(sx - 10, 150, 20, 26);
      ctx.fillStyle = '#ffd38a'; ctx.fillRect(sx - 6, 154, 12, 18);
      A.glow(ctx, sx, 163, 140, 'rgba(255,180,90,.42)', 0.9 + 0.1 * Math.sin(t * 7 + lx));
    }
  };

  A.workbench = (ctx, sx, t) => {
    const y = 486;
    ctx.fillStyle = '#4a2f1a'; ctx.fillRect(sx - 80, y - 62, 160, 14);
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(sx - 74, y - 48, 10, 48); ctx.fillRect(sx + 64, y - 48, 10, 48);
    line(ctx, [sx - 70, y - 72, sx + 70, y - 76], 5, '#7a4a22', false);
    ctx.fillStyle = '#d9b25a'; ctx.beginPath(); ctx.moveTo(sx - 66, y - 74); ctx.lineTo(sx - 100, y - 86); ctx.lineTo(sx - 100, y - 60); ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#8a8f99', '#c9a24a', '#6a4a8a', '#8a8f99'][i]; ctx.fillRect(sx - 40 + i * 22, y - 66, 12, 4); }
    A.glow(ctx, sx + 40, y - 80, 30, 'rgba(120,200,255,.6)', 0.4 + 0.3 * Math.sin(t * 5));
  };
  A.owlPerch = (ctx, sx, t) => {
    const y = 486;
    line(ctx, [sx, y, sx, y - 130], 6, '#3b2616', false);
    line(ctx, [sx - 30, y - 130, sx + 30, y - 130], 5, '#3b2616', false);
    const bob = Math.sin(t * 2) * 1.5;
    ell(ctx, sx, y - 150 + bob, 15, 20, '#b8a07a', OUT);
    ell(ctx, sx, y - 145 + bob, 9, 13, '#e8dcc0');
    ell(ctx, sx - 5, y - 158 + bob, 4.5, 4.5, '#fff'); ell(ctx, sx + 5, y - 158 + bob, 4.5, 4.5, '#fff');
    ell(ctx, sx - 5, y - 158 + bob, 2.3, 2.3, '#e8a020'); ell(ctx, sx + 5, y - 158 + bob, 2.3, 2.3, '#e8a020');
    ell(ctx, sx - 5, y - 158 + bob, 1, 1, '#000'); ell(ctx, sx + 5, y - 158 + bob, 1, 1, '#000');
    ctx.fillStyle = '#6a4a20'; ctx.beginPath(); ctx.moveTo(sx - 2, y - 153 + bob); ctx.lineTo(sx + 2, y - 153 + bob); ctx.lineTo(sx, y - 149 + bob); ctx.fill();
  };
  A.gate = (ctx, sx, t) => {
    const y = 486;
    ctx.fillStyle = '#1a110a';
    ctx.beginPath(); ctx.roundRect(sx - 110, y - 300, 220, 300, [110, 110, 0, 0]); ctx.fill();
    const g = ctx.createLinearGradient(0, y - 300, 0, y);
    g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#ffb15a');
    ctx.save();
    ctx.globalAlpha = 0.85 + 0.1 * Math.sin(t * 2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(sx - 92, y - 282, 184, 282, [92, 92, 0, 0]); ctx.fill();
    ctx.restore();
    A.glow(ctx, sx, y - 120, 240, 'rgba(255,200,120,.5)', 1);
    ctx.fillStyle = '#e8c46a'; ctx.font = '700 16px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('TO THE PITCH', sx, y - 310);
  };
})();
