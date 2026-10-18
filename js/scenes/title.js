// Title screen: night over the Derby stadium, Larissa and Serious in the foreground.
(() => {
  'use strict';
  const { TAU, seeded } = G.U;
  const A = G.Art;
  G.TitleScene = function (onNew, onContinue) {
    const el = document.getElementById('title');
    let sky = null, gen = -1;
    const sc = {};
    sc.enter = () => {
      G.UI.hud(false);
      el.classList.remove('hidden');
      el.querySelector('[data-act="continue"]').disabled = !G.loadSave();
      el.onclick = (e) => {
        const b = e.target.closest('button');
        if (!b || b.disabled) return;
        el.classList.add('hidden');
        (b.dataset.act === 'new' ? onNew : onContinue)();
      };
    };
    sc.exit = () => el.classList.add('hidden');
    sc.draw = (ctx) => {
      const t = G.t;
      if (gen !== G.layerGen) {
        gen = G.layerGen;
        sky = G.U.layer(G.W, G.H, (x, w, h) => {
          const g = x.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, '#05061a'); g.addColorStop(0.55, '#1d1840'); g.addColorStop(0.85, '#4a2a4a'); g.addColorStop(1, '#7a3a3a');
          x.fillStyle = g; x.fillRect(0, 0, w, h);
          const r = seeded(4);
          for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(255,255,255,${r() * 0.8})`; const s = r() * 1.8; x.fillRect(r() * w, r() * h * 0.7, s, s); }
          const m = x.createRadialGradient(1040, 140, 10, 1040, 140, 140);
          m.addColorStop(0, 'rgba(255,250,230,1)'); m.addColorStop(0.3, 'rgba(255,240,210,.35)'); m.addColorStop(1, 'rgba(255,240,210,0)');
          x.fillStyle = m; x.fillRect(880, -20, 320, 320);
          x.fillStyle = '#fffbea'; x.beginPath(); x.arc(1040, 140, 38, 0, TAU); x.fill();
          A.sigil(x, 640, 230, 150, 'rgba(110,255,170,.08)');
        });
      }
      ctx.drawImage(sky, 0, 0, G.W, G.H);
      // silhouettes of riders crossing the moon
      for (let i = 0; i < 4; i++) {
        const x = ((t * (60 + i * 25) + i * 400) % (G.W + 400)) - 200, y = 120 + i * 70 + Math.sin(t + i) * 10;
        ctx.save(); ctx.globalAlpha = 0.85; ctx.filter = 'brightness(0)';
        A.rider(ctx, ['drake', 'nell', 'brutus', 'ronan'][i], x, y, 0.32, { t: t + i });
        ctx.restore();
      }
      // stadium
      ctx.fillStyle = '#0c0814';
      ctx.beginPath(); ctx.moveTo(0, 720); ctx.lineTo(0, 520); ctx.quadraticCurveTo(640, 430, 1280, 520); ctx.lineTo(1280, 720); ctx.fill();
      for (let i = 0; i < 9; i++) {
        const x = 70 + i * 142, y = 520 - Math.sin((i / 8) * Math.PI) * 70;
        A.line(ctx, [x, y + 20, x, y - 60], 4, '#0c0814', false);
        A.glow(ctx, x, y - 64, 60, 'rgba(255,230,180,.5)', 0.8 + 0.2 * Math.sin(t * 3 + i));
      }
      A.figure(ctx, 'larissa', 300, 690, 1.5, { face: 1, t });
      A.figure(ctx, 'serious', 1000, 690, 1.45, { face: -1, t });
      A.vignette(ctx, 0.65);
    };
    return sc;
  };
})();
