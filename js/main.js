// Boot: title screen → new game or continue from the last saved scene.
(() => {
  'use strict';
  const title = () => G.TitleScene(
    () => { G.S = G.newState(); G.Story.reset(); G.save(); G.go(G.Story.market); },
    () => { G.S = G.loadSave() || G.newState(); G.Story.reset(); G.go(G.Story.byId(G.S.scene)); },
  );
  G.setScene(title());
  G.fade.a = 1;
  G.UI.refresh();
  G.start();
})();
