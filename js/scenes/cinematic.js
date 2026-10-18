// Static, painted scene that plays a dialogue script over an animated backdrop.
(() => {
  'use strict';
  G.Cinematic = function (cfg) {
    const sc = { t: 0, started: false, cfg };
    sc.enter = () => {
      G.UI.hud(true, cfg.chapter);
      if (cfg.id) { G.S.scene = cfg.id; G.save(); }
    };
    sc.update = (dt) => {
      sc.t += dt;
      if (!sc.started && sc.t > (cfg.delay ?? 0.8) && G.fade.a < 0.05) {
        sc.started = true;
        G.Dialogue.play(cfg.script, cfg.start || 'start', () => cfg.onDone(sc));
      }
      if (cfg.update) cfg.update(sc, dt);
    };
    sc.draw = (ctx) => cfg.draw(ctx, G.t, sc);
    return sc;
  };
})();
