// Skill trees for both Derby riders. Heart/Defiance/Veteran nodes are gated by story
// choices, relationships and the Trust/Safety meters, so how you play shapes what you can learn.
(() => {
  'use strict';
  const T = {
    larissa: [
      {
        name: 'Agility', color: '#8ef0b0', desc: 'Speed, handling and the art of not being hit.',
        nodes: [
          { id: 'l_swift', name: 'Featherweight', desc: '+7% top speed.', apply: (s) => { s.maxSpeed *= 1.07; } },
          { id: 'l_slip', name: 'Slipstream', desc: 'Rings grant +60% boost.', req: 'l_swift', apply: (s) => { s.ringBoost *= 1.6; } },
          { id: 'l_ace', name: 'Sky Ace', desc: 'Barrel Roll cooldown −40% and it restores 8 vitality.', req: 'l_slip', apply: (s) => { s.qCd *= 0.6; s.rollHeal = 8; } },
        ],
      },
      {
        name: 'Spellwork', color: '#9fd8ff', desc: 'Wandwork learned in secret, from banned books.',
        nodes: [
          { id: 'l_focus', name: 'Focused Wand', desc: '+40% spell damage.', apply: (s) => { s.boltDmg *= 1.4; } },
          { id: 'l_twin', name: 'Twin Sparks', desc: 'Each cast fires two bolts.', req: 'l_focus', apply: (s) => { s.twin = true; } },
          { id: 'l_bind', name: 'Binding Hex', desc: 'Bolts slow rivals by 40% for 2s.', req: 'l_twin', apply: (s) => { s.slowOnHit = true; } },
        ],
      },
      {
        name: 'Heart', color: '#c78bff', desc: 'Strength drawn from the people who stand with you.',
        nodes: [
          { id: 'l_bond', name: 'Study Group', desc: "Hermia's ward absorbs one hit every 15s.", gate: (S) => S.rel.hermia >= 30, gateText: 'Requires Hermia relationship 30+', apply: (s) => { s.shield = 15; } },
          { id: 'l_oldguard', name: "Old Guard's Blessing", desc: '+35 vitality. The brass feather hums when you fly.', gate: (S) => S.flags.fennickToken, gateText: "Requires Old Fennick's token", apply: (s) => { s.hp += 35; } },
          { id: 'l_rebel', name: 'Spark of Defiance', desc: 'Unlocks E: Defiance Nova — shatters hexes and blasts nearby rivals.', gate: (S) => S.flags.defiant || S.safety <= 40, gateText: 'Requires defying the Dark Lord, or Safety 40 or less', apply: (s) => { s.eName = 'Defiance Nova'; s.eCd = 12; } },
        ],
      },
    ],
    serious: [
      {
        name: 'Brawn', color: '#ffb07a', desc: 'Forty years of carrying shopping and grudges.',
        nodes: [
          { id: 's_iron', name: 'Iron Constitution', desc: '+40 vitality.', apply: (s) => { s.hp += 40; } },
          { id: 's_ram', name: 'Battering Ram', desc: 'Shoulder Charge deals 45 damage and stuns.', req: 's_iron', apply: (s) => { s.ramDmg = 45; s.ramStun = true; } },
          { id: 's_jugg', name: 'Juggernaut', desc: 'Obstacles deal half damage and barely slow you.', req: 's_ram', apply: (s) => { s.obstacleMul = 0.5; } },
        ],
      },
      {
        name: 'Defiance', color: '#ff7a7a', desc: 'The thing that got him arrested. Now it flies.',
        nodes: [
          { id: 's_roar', name: 'Bellow of Bloop', desc: 'Unlocks E: a roar that knocks back and stuns nearby rivals.', apply: (s) => { s.eName = 'Bellow'; s.eCd = 10; } },
          { id: 's_fury', name: 'Righteous Fury', desc: '+35% spell damage.', req: 's_roar', gate: (S) => S.safety <= 50 || S.flags.foughtEnforcers, gateText: 'Requires Safety 50 or less, or having fought the Enforcers', apply: (s) => { s.boltDmg *= 1.35; } },
          { id: 's_unbroken', name: 'Unbroken', desc: 'Once per race, get back up at half vitality instantly.', req: 's_fury', gate: (S) => S.rel.serious >= 70, gateText: 'Requires Serious relationship 70+', apply: (s) => { s.revive = true; } },
        ],
      },
      {
        name: 'Veteran', color: '#f2cf6a', desc: 'He flew in the old Derbies, before they were rigged.',
        nodes: [
          { id: 's_tricks', name: 'Old Tricks', desc: '+50% boost regeneration.', apply: (s) => { s.boostRegen *= 1.5; } },
          { id: 's_lines', name: 'Racing Lines', desc: '+5% top speed and rings give +50% boost.', req: 's_tricks', apply: (s) => { s.maxSpeed *= 1.05; s.ringBoost *= 1.5; } },
          { id: 's_cheer', name: 'For Lissa!', desc: 'At the halfway mark: full boost and +30 vitality.', req: 's_lines', gate: (S) => S.trust >= 60, gateText: 'Requires Trust 60+', apply: (s) => { s.cheer = true; } },
        ],
      },
    ],
  };

  const BASE = {
    larissa: { maxSpeed: 560, accel: 320, hp: 100, boostRegen: 6, ringBoost: 24, boltDmg: 14, boltCd: 0.3, qName: 'Barrel Roll', qCd: 3, ramDmg: 0, obstacleMul: 1 },
    serious: { maxSpeed: 525, accel: 250, hp: 150, boostRegen: 5, ringBoost: 22, boltDmg: 22, boltCd: 0.42, qName: 'Shoulder Charge', qCd: 5, ramDmg: 15, obstacleMul: 0.8 },
  };

  const find = (who, id) => {
    for (const b of T[who]) for (const n of b.nodes) if (n.id === id) return n;
    return null;
  };

  const Sk = (G.Skills = { trees: T });
  Sk.has = (who, id) => !!G.S.skills[who][id];
  Sk.status = (who, n) => {
    const S = G.S;
    if (Sk.has(who, n.id)) return { k: 'owned' };
    if (n.req && !Sk.has(who, n.req)) return { k: 'locked', why: `Requires ${find(who, n.req).name}` };
    if (n.gate && !n.gate(S)) return { k: 'gated', why: n.gateText };
    if (S.sp[who] < 1) return { k: 'locked', why: 'Needs a skill point' };
    return { k: 'available' };
  };
  Sk.buy = (who, id) => {
    const n = find(who, id);
    if (!n || Sk.status(who, n).k !== 'available') return false;
    G.S.sp[who]--;
    G.S.skills[who][id] = true;
    G.toast(`Learned ${n.name}`, 'sp');
    G.UI.refresh();
    G.save();
    return true;
  };
  Sk.stats = (who) => {
    const s = Object.assign({ twin: false, slowOnHit: false, shield: 0, revive: false, cheer: false, eName: null, eCd: 0, rollHeal: 0, ramStun: false }, BASE[who]);
    for (const b of T[who]) for (const n of b.nodes) if (Sk.has(who, n.id)) n.apply(s);
    s.maxSpeed *= 1 + G.S.tuning / 100;
    return s;
  };
  // Nodes whose story gate is newly satisfied, for "a new skill is available" nudges.
  Sk.newlyOpen = () => {
    const out = [];
    for (const who of ['larissa', 'serious'])
      for (const b of T[who]) for (const n of b.nodes)
        if (n.gate && n.gate(G.S) && !Sk.has(who, n.id) && !G.S.flags['seen_' + n.id]) { G.S.flags['seen_' + n.id] = true; out.push(n); }
    return out;
  };

  let tab = 'larissa';
  Sk.open = (who) => {
    if (who) tab = who;
    const S = G.S;
    const render = () => {
      const html = `<h3>Skill Trees</h3>
        <p class="sub">Skills earned in the Derby, in minigames, and through the choices you make. Dashed nodes are unlocked by story, relationships, Trust and Safety.</p>
        <div class="tabs">
          <button data-tab="larissa" class="${tab === 'larissa' ? 'on' : ''}">Larissa</button>
          <button data-tab="serious" class="${tab === 'serious' ? 'on' : ''}">Serious</button>
          <span style="flex:1"></span>
          <span class="sp-count">Skill points: ${S.sp[tab]} · XP ${S.xp[tab]}/100</span>
        </div>
        <div class="tree">${T[tab].map((b) => `<div class="branch"><h4 style="color:${b.color}">${b.name}</h4><div class="bdesc">${b.desc}</div>
          ${b.nodes.map((n) => { const st = Sk.status(tab, n); return `<button class="node ${st.k}" data-id="${n.id}">
            <div class="nname">${n.name}${st.k === 'owned' ? ' ✦' : ''}</div><div class="ndesc">${n.desc}</div>
            ${st.why ? `<div class="nreq">${st.k === 'gated' ? '🔒 ' : ''}${st.why}</div>` : st.k === 'available' ? '<div class="nreq" style="color:#8ef0b0">Click to learn · 1 point</div>' : ''}</button>`; }).join('')}
          </div>`).join('')}</div>`;
      const p = G.UI.open(html);
      p.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
      p.querySelectorAll('.node.available').forEach((b) => b.addEventListener('click', () => { if (Sk.buy(tab, b.dataset.id)) render(); }));
    };
    render();
  };
})();
