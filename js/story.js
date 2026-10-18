// Story content and scene wiring: Diagon Row market → the arrest → the Obsidian Spire → the Harriers' hangar ⇄ Derby.
(() => {
  'use strict';
  const A = G.Art;
  const St = (G.Story = {});

  // Toast any skill nodes whose story gate just opened.
  St.nudge = () => {
    for (const n of G.Skills.newlyOpen()) G.toast(`New skill unlocked by your choices: ${n.name} (press K)`, 'sp');
  };

  // ================= MARKET =================
  const INTRO = {
    start: { text: 'Twelve years ago, the Dark Lord Moldevort won the War of the Wands. The banners went up. The curfews went in. And slowly, people stopped noticing.', next: 'n2' },
    n2: { text: 'Diagon Row Market. Saturday. The Mark hangs in the sky, as it always does.', next: 's1' },
    s1: {
      who: 'serious', text: "Right, Lissa. Eggs, bread, and whatever the Death Enforcers haven't 'taxed' this week.",
      choices: [
        { t: 'Keep your voice down, Uncle.', tag: 'Cautious', fx: { safety: 3 }, next: 's_c' },
        { t: "Maybe they'll tax the eggs' feelings next.", tag: 'Witty', fx: { rel: { serious: 5 } }, next: 's_w' },
        { t: 'One day someone will say that to their faces.', tag: 'Defiant', fx: { trust: 3, safety: -3 }, next: 's_d' },
      ],
    },
    s_c: { who: 'serious', mood: 'neutral', text: "If I whisper about eggs, Lissa, they've already won.", next: 'tut' },
    s_w: { who: 'serious', text: "Ha! That's my girl. Don't let them hear you being funny — it's practically treason.", next: 'tut' },
    s_d: { who: 'serious', mood: 'sad', text: '...That someone had better not be you, kiddo. Promise me.', next: 'tut' },
    tut: { text: 'Move with WASD or the arrow keys. Press E to talk. K opens the skill trees, J your journal.', fx: { flags: { introDone: true } } },
  };

  const MAGS = {
    start: {
      who: 'vendor', text: "Larissa, love! And Serious, still upright. Bread's two sickles. The Ministry's 'loyalty surcharge' is another one.",
      choices: [
        { t: "Here's three. The surcharge is the Ministry's, I suppose.", tag: 'Cautious', next: 'pay' },
        { t: "Here's five. Give the extra loaf to the Hendersons — I heard their dad was taken.", tag: 'Kind', if: (S) => !S.flags.generous, fx: { trust: 5, flags: { generous: true } }, next: 'kind' },
        { t: 'Seen any trouble today?', tag: 'Curious', if: (S) => !S.flags.warned, next: 'info' },
        { t: 'Bye, Mags.', next: 'end' },
      ],
    },
    pay: { who: 'vendor', text: 'Bless you. Mind how you go.' },
    kind: { who: 'vendor', mood: 'sad', text: "...You're your mother's daughter. I'll see they get it. Quietly." },
    info: { who: 'vendor', mood: 'neutral', text: "Enforcers have been rough down by the fountain. Some old fellow wouldn't bow to the banner. Keep your uncle away from there, eh? You know how he gets.", fx: { flags: { warned: true } } },
  };

  const TIB = {
    start: { branch: (S) => (S.flags.tornPoster ? 'after' : 'ask') },
    after: { who: 'kid', text: "That was the best day of my whole life, miss. Don't tell my mum." },
    ask: {
      who: 'kid', text: "Miss! Miss! I'm meant to put these up. 'OBEY. IT'S EASIER.' They pay me a sickle a stack!",
      choices: [
        { t: 'Want to know a secret? Posters tear really easily.', tag: 'Defiant', fx: { safety: -8, trust: 6, flags: { tornPoster: true } }, next: 'tear' },
        { t: 'Be careful who you work for, Tib.', tag: 'Kind', fx: { trust: 2 }, next: 'care' },
        { t: "A sickle's a sickle. Off you go.", next: 'ignore' },
      ],
    },
    tear: { who: 'kid', text: '*riiiip* ...Ha! HA! It does tear easy!', next: 'tear2' },
    tear2: { who: 'serious', mood: 'smirk', text: "I didn't see a thing. Terrible eyesight. Can't even find my glasses — oh, they're in my hand." },
    care: { who: 'kid', mood: 'neutral', text: "Everyone works for them, miss. That's just how it works." },
    ignore: { who: 'kid', text: 'Thanks, miss!' },
  };

  const DECREE = {
    start: { text: 'A gilded decree, freshly pasted: THE ANNUAL FLYING DERBY. "By Gracious Decree of Lord Moldevort, Prisoners of the Realm may fly for Clemency. Three victories, and Mercy is granted."', next: 'n2' },
    n2: { who: 'serious', mood: 'neutral', text: "Ha. 'Mercy.' Nobody's ever won three. The Serpent Squad sees to that.", next: 'n3' },
    n3: {
      who: 'larissa', mood: 'neutral', text: '...',
      choices: [
        { t: 'Has anyone ever tried?', tag: 'Curious', if: (S) => !S.flags.parentsHint, next: 'n4' },
        { t: "Let's keep moving.", next: 'end' },
      ],
    },
    n4: { who: 'serious', mood: 'sad', text: 'Your mum and dad flew in the old Derbies. Before he won. Before it was... this.', fx: { flags: { parentsHint: true }, rel: { serious: 2 } } },
  };

  let outcome = null;
  const ARREST = {
    start: { text: 'By the fountain, two Death Enforcers have an old man pinned against the statue of the Dark Lord.', next: 'a2' },
    a2: { who: 'enforcer', text: "You didn't bow to the banner, grandad. That's a fine. You can't pay the fine. That's a crime.", next: 'a3' },
    a3: { who: 'fennick', mood: 'neutral', text: "I've bowed to that banner for twelve years, lad. My knees have retired, even if I haven't.", next: 'a4' },
    a4: { who: 'enforcer', text: "Then we'll help you down.", next: 'a5' },
    a5: { text: "The Enforcer raises his wand. Beside you, Serious's jaw sets in a way you know far too well.", next: 'a6' },
    a6: { who: 'serious', mood: 'angry', text: "Oi! He's twice your age and half your size. Leave him be.", next: 'a7' },
    a7: { who: 'enforcer', text: "Walk on, citizen. Unless you'd like to join him.", next: 'choice' },
    choice: {
      who: 'larissa', mood: 'shock', text: '(Your heart is hammering. What do you do?)',
      choices: [
        { t: "Uncle, don't. They'll take you.", tag: 'Cautious', fx: { safety: 5, rel: { serious: -3 } }, run: () => (outcome = 'cautious'), next: 'c_caut' },
        { t: "Do it, Uncle. I've got your back.", tag: 'Loyal', fx: { rel: { serious: 8, fennick: 5 }, trust: 4, flags: { stoodWith: true } }, run: () => (outcome = 'loyal'), next: 'c_loyal' },
        { t: 'Hey! Tin cans! Over here!', tag: 'Fight', fx: { safety: -10, rel: { fennick: 10 }, flags: { foughtEnforcers: true } }, run: () => (outcome = 'fight'), next: 'c_fight' },
        {
          t: "(While they're focused on Serious, quietly help the old man slip away.)", tag: 'Clever',
          lock: (S) => (S.trust >= 55 || S.flags.warned ? null : 'needs Trust 55, or a warning from Mags'),
          fx: { rel: { fennick: 15 }, flags: { helpedEscape: true } }, run: () => (outcome = 'clever'), next: 'c_clever',
        },
      ],
    },
    c_caut: { who: 'serious', mood: 'sad', text: "Then they take me, Lissa. I won't walk past this. I can't.", next: 'take' },
    c_loyal: { who: 'serious', text: "That's my girl. Stay behind me, though. Your back, my front.", next: 'take' },
    c_fight: { who: 'enforcer', text: 'Oh, the little one bites. Get her!' },
    c_clever: { text: 'Serious steps forward, loud and furious. Every eye goes to him. You take the old man by the elbow and guide him behind the fountain, into the crowd.', next: 'c_clever2' },
    c_clever2: { who: 'fennick', text: "Clever girl. Your uncle is buying you time with his own skin. Don't waste it.", next: 'take' },
    // shared ending (also entered from the combat aftermath)
    take: { text: 'More Enforcers pour from the alleys — six, eight, ten. Serious raises his hands, slowly.', next: 'take2' },
    take2: { who: 'serious', mood: 'neutral', text: "Alright. Alright! Me. I'm the troublemaker. The girl has nothing to do with it.", next: 'take3' },
    take3: { who: 'enforcer', text: 'Serious Bloop. Disturbing the Peace of the Realm. You are going to love Ashkaban.', next: 'farewell' },
    farewell: {
      who: 'serious', mood: 'sad', text: "Lissa. Look at me. Go home. Lock the door. Don't do anything brave.",
      choices: [
        { t: "I'll get you out. I swear it.", tag: 'Promise', fx: { rel: { serious: 5 }, flags: { promise: true } }, next: 'f_prom' },
        { t: "Why couldn't you just walk past?!", tag: 'Hurt', fx: { rel: { serious: -5 } }, next: 'f_hurt' },
        { t: "(Say nothing. Memorise the Enforcers' badge numbers.)", tag: 'Clever', fx: { flags: { badges: true }, xpL: 20 }, next: 'f_badge' },
      ],
    },
    f_prom: { who: 'serious', text: '...You always did take after your mother. Stubborn as a mule in a raincoat.' },
    f_hurt: { who: 'serious', mood: 'sad', text: "Because then I'd be someone you shouldn't look up to." },
    f_badge: { text: 'D-114. D-207. D-031. You carve the numbers into your memory. Serious catches your eye and almost — almost — smiles.' },
    // combat aftermath
    won: { text: 'Two Enforcers groan on the cobbles. For a heartbeat, the whole street is silent. Then someone, somewhere, claps.', fx: { trust: 6, xpL: 30 }, next: 'won2' },
    won2: { who: 'serious', mood: 'shock', text: 'Lissa... where on earth did you learn that?', next: 'won3' },
    won3: { text: 'Whistles. Boots. Ten more Enforcers round the corner at a run.', next: 'take2' },
    lost: { text: 'A red hex catches you square in the chest. The cobbles come up to meet you.', next: 'lost2' },
    lost2: { who: 'serious', mood: 'angry', text: 'GET AWAY FROM HER!', next: 'lost3' },
    lost3: { text: 'Serious throws himself between you and the wands. More Enforcers pour in from the alleys.', fx: { rel: { serious: 4 } }, next: 'take2' },
  };

  const TOKEN = {
    start: { branch: (S) => (S.rel.fennick >= 10 ? 'tok1' : 'notok') },
    tok1: { text: 'As the crowd scatters, a gnarled hand presses something cold into your palm.', next: 'tok2' },
    tok2: { who: 'fennick', text: 'A brass feather. The Old Guard remembers who stood up today. Fly true, girl.', fx: { flags: { fennickToken: true } }, next: 'tok3' },
    tok3: { text: 'Old Fennick vanishes into the crowd. The feather is warm now, humming faintly.' },
    notok: { text: 'The crowd scatters. The banner on the wall stares down at you, unblinking. The old man is gone.' },
  };

  St.market = () => {
    outcome = null;
    let sc;
    const fennick = { key: 'fennick', x: 2560, y: 560, face: -1, fixedFace: true, mood: 'sad' };
    const enf1 = { key: 'enforcer', x: 2460, y: 545, face: 1, fixedFace: true };
    const enf2 = { key: 'enforcer', x: 2670, y: 600, face: -1, fixedFace: true };
    const talk = (script) => () => G.Dialogue.play(script, 'start', St.nudge);

    function march() {
      G.apply({ flags: { arrested: true } });
      const F = sc.follower;
      const guards = [enf1, enf2].map((e) => Object.assign(e, { hidden: false, fixedFace: false }));
      sc.enemies = [];
      guards[0].x = F.x - 70; guards[0].y = F.y;
      guards[1].x = F.x + 70; guards[1].y = F.y + 10;
      sc.camFocus = F.x + 200;
      F.mood = 'sad';
      F.goal = { x: 3100, y: F.y, speed: 90 };
      guards[0].goal = { x: 3030, y: F.y, speed: 90 };
      guards[1].goal = { x: 3170, y: F.y + 10, speed: 90 };
      if (outcome === 'clever') fennick.hidden = true;
      setTimeout(() => {
        sc.camFocus = sc.player.x;
        if (outcome === 'clever') { fennick.hidden = false; fennick.x = sc.player.x + 90; fennick.y = sc.player.y; fennick.mood = null; }
        G.Dialogue.play(TOKEN, 'start', () => { St.nudge(); G.go(St.throne); });
      }, 3200);
    }

    function arrestEnding() {
      sc.cut = true;
      sc.combat = false;
      sc.follower.held = true;
      if (outcome !== 'fight') return march();
      sc.player.hp = Math.max(sc.player.hp, 1);
      sc.player.downT = null;
      G.Dialogue.play(ARREST, sc.player.wonFight ? 'won' : 'lost', march);
    }

    sc = G.Explore({
      id: 'market', chapter: 'Chapter I · Diagon Row', width: 3000, yMin: 500, yMax: 680, start: { x: 220, y: 600 }, follower: 'serious',
      drawBack: (ctx, camX, t) => A.marketBack(ctx, camX, t),
      drawFront: (ctx, camX) => A.marketFront(ctx, camX),
      npcs: [
        { id: 'mags', key: 'vendor', x: 700, y: 520, face: -1, label: 'Talk to Mags', talk: talk(MAGS) },
        { id: 'tib', key: 'kid', x: 1180, y: 560, face: -1, label: 'Talk to Tib', talk: talk(TIB), markerH: 140 },
        { id: 'decree', x: 1460, y: 505, label: 'Read the Derby decree', talk: talk(DECREE), draw: () => {}, markerH: 160 },
        fennick, enf1, enf2,
      ],
      enter: (s) => {
        if (!G.S.flags.introDone) setTimeout(() => G.Dialogue.play(INTRO, 'start'), 700);
      },
      triggers: [{
        x: 2080,
        run: (s) => {
          s.cut = true;
          s.camFocus = 2450;
          s.player.goal = { x: 2200, y: 600, speed: 160, face: 1 };
          s.follower.goal = { x: 2290, y: 575, speed: 160, face: 1 };
          s.follower.held = true;
          setTimeout(() => G.Dialogue.play(ARREST, 'start', () => {
            if (outcome === 'fight') {
              s.cut = false;
              enf1.hidden = enf2.hidden = true;
              s.startCombat([{ x: enf1.x, y: enf1.y }, { x: enf2.x, y: enf2.y }, ...(G.S.safety < 50 ? [{ x: 2800, y: 640 }] : [])]);
            } else arrestEnding();
          }), 1300);
        },
      }],
      onCombat: (s, won) => {
        s.player.wonFight = won;
        setTimeout(arrestEnding, won ? 700 : 1300);
      },
    });
    return sc;
  };

  // ================= THRONE ROOM =================
  const THRONE = {
    start: { text: 'Three days later. The Obsidian Spire. Petitioners wait for weeks. You were summoned.', next: 't2' },
    t2: { who: 'darklord', mood: 'smirk', text: 'Larissa Potter. Ward of Serious Bloop. Your parents made the same mistake your uncle did — caring, loudly.', next: 't3' },
    t3: { who: 'darklord', mood: 'neutral', text: 'You came to beg. Go on. I do so enjoy the genre.', next: 't4' },
    t4: {
      who: 'larissa', mood: 'neutral', text: '(The hall is very quiet. Everyone is watching you.)',
      choices: [
        { t: "Please. He's all I have. He's an old fool, not a rebel.", tag: 'Humble', fx: { safety: 12, trust: -3, flags: { humble: true } }, next: 'hum' },
        { t: "He did what anyone decent would. You're the one who belongs in a cell.", tag: 'Defiant', fx: { safety: -18, trust: 8, flags: { defiant: true } }, next: 'def' },
        { t: 'You love a spectacle. Give me one. Let me earn his freedom.', tag: 'Clever', fx: { safety: 3, flags: { clever: true } }, next: 'cle' },
      ],
    },
    hum: { who: 'darklord', mood: 'smirk', text: 'Better. Humility suits the defeated.', next: 'derby' },
    def: { who: 'darklord', mood: 'neutral', text: '...Oh, I like you. That is rarely good news for anyone.', next: 'def2' },
    def2: { text: 'Somewhere in the hall, a guard forgets to breathe.', next: 'derby' },
    cle: { who: 'darklord', mood: 'smirk', text: "Clever girl. You've anticipated me. How tiresome — and how useful.", next: 'derby' },
    derby: { who: 'darklord', mood: 'neutral', text: 'Each year, the Flying Derby. My Serpent Squad flies, the realm watches, and everyone remembers who wins.', next: 'd2' },
    d2: { who: 'darklord', mood: 'neutral', text: 'By ancient and very inconvenient custom, prisoners may fly for clemency. Win three races — and your uncle walks free.', next: 'd3' },
    d3: { who: 'darklord', mood: 'smirk', text: "He will fly in chains, under guard. And you, child — the rules permit a prisoner's kin to ride in his stead. Choose your rider each race.", next: 'd4' },
    d4: {
      who: 'larissa', text: '...',
      choices: [
        { t: "We'll win.", tag: 'Confident', fx: { trust: 3 }, next: 'win' },
        { t: "And if we win three, you'll keep your word?", tag: 'Curious', fx: { flags: { askedWord: true } }, next: 'word' },
      ],
    },
    win: { who: 'darklord', mood: 'smirk', text: "Everyone says that. It's almost the point.", next: 'd5' },
    word: { who: 'darklord', mood: 'neutral', text: 'I always keep my word. That is what makes it so frightening.', next: 'd5' },
    d5: { who: 'darklord', mood: 'smirk', text: "The Hollow Hill Harriers have room for charity cases. Report to their hangar. And do try to survive the first race — it's bad for ratings when the children don't." },
  };

  function drawThrone(ctx, t) {
    const W = G.W, H = G.H;
    const bg = ctx.createLinearGradient(0, 0, 0, 470);
    bg.addColorStop(0, '#050409'); bg.addColorStop(1, '#16121f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, 470);
    // gothic windows + light shafts
    for (const wx of [250, 640, 1030]) {
      const w = wx === 640 ? 150 : 110, top = wx === 640 ? 40 : 80;
      const g = ctx.createLinearGradient(0, top, 0, 380);
      g.addColorStop(0, '#2c7a52'); g.addColorStop(1, '#0d2a1d');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(wx - w / 2, 380); ctx.lineTo(wx - w / 2, top + w * 0.6); ctx.quadraticCurveTo(wx - w / 2, top, wx, top - 20); ctx.quadraticCurveTo(wx + w / 2, top, wx + w / 2, top + w * 0.6); ctx.lineTo(wx + w / 2, 380); ctx.fill();
      ctx.strokeStyle = '#0a0810'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(wx, top - 10); ctx.lineTo(wx, 380); ctx.moveTo(wx - w / 2, 250); ctx.lineTo(wx + w / 2, 250); ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.06 + 0.02 * Math.sin(t + wx);
      ctx.fillStyle = '#6effb0';
      ctx.beginPath(); ctx.moveTo(wx - w / 2, top + 40); ctx.lineTo(wx + w / 2, top + 40); ctx.lineTo(wx + w * 1.6, H); ctx.lineTo(wx - w * 0.2, H); ctx.fill();
      ctx.restore();
    }
    A.sigil(ctx, 640, 150, 50, 'rgba(110,255,170,.35)');
    // floor
    const fg = ctx.createLinearGradient(0, 470, 0, H);
    fg.addColorStop(0, '#1a1626'); fg.addColorStop(1, '#07060b');
    ctx.fillStyle = fg; ctx.fillRect(0, 470, W, H - 470);
    for (let i = 0; i < 12; i++) { ctx.strokeStyle = 'rgba(255,255,255,.035)'; ctx.beginPath(); ctx.moveTo(640 + (i - 6) * 40, 470); ctx.lineTo(640 + (i - 6) * 220, H); ctx.stroke(); }
    ctx.fillStyle = '#5a0d18';
    ctx.beginPath(); ctx.moveTo(600, 470); ctx.lineTo(680, 470); ctx.lineTo(860, H); ctx.lineTo(420, H); ctx.fill();
    ctx.fillStyle = 'rgba(232,196,106,.3)';
    ctx.fillRect(0, 0, 0, 0);
    // dais + throne
    ctx.fillStyle = '#221d2e'; ctx.fillRect(480, 440, 320, 32);
    ctx.fillStyle = '#2c2638'; ctx.fillRect(520, 420, 240, 22);
    ctx.fillStyle = '#0c0a12';
    ctx.beginPath(); ctx.moveTo(580, 422); ctx.lineTo(570, 230); ctx.lineTo(600, 260); ctx.lineTo(615, 190); ctx.lineTo(640, 230); ctx.lineTo(665, 190); ctx.lineTo(680, 260); ctx.lineTo(710, 230); ctx.lineTo(700, 422); ctx.fill();
    A.sigil(ctx, 640, 300, 28, 'rgba(110,255,170,.6)');
    // pillars
    for (const [px, w] of [[60, 90], [230, 60], [1050, 60], [1190, 90]]) {
      const g = ctx.createLinearGradient(px - w / 2, 0, px + w / 2, 0);
      g.addColorStop(0, '#0a0810'); g.addColorStop(0.5, '#2a2436'); g.addColorStop(1, '#0a0810');
      ctx.fillStyle = g; ctx.fillRect(px - w / 2, 0, w, H);
    }
    // braziers with green fire
    for (const bx of [440, 840]) {
      ctx.fillStyle = '#1a1622'; ctx.fillRect(bx - 6, 400, 12, 70);
      ctx.beginPath(); ctx.ellipse(bx, 400, 30, 10, 0, 0, Math.PI); ctx.fill();
      for (let i = 0; i < 6; i++) {
        const fh = 40 + Math.sin(t * 9 + i * 1.7) * 12, fx = bx + Math.sin(t * 5 + i) * 6 + (i - 2.5) * 6;
        ctx.fillStyle = i % 2 ? 'rgba(80,255,150,.55)' : 'rgba(190,255,210,.5)';
        ctx.beginPath(); ctx.moveTo(fx - 9, 400); ctx.quadraticCurveTo(fx, 400 - fh, fx + 9, 400); ctx.fill();
      }
      A.glow(ctx, bx, 375, 160, 'rgba(80,255,150,.45)', 0.9 + 0.1 * Math.sin(t * 7));
    }
    A.figure(ctx, 'enforcer', 170, 492, 1.3, { face: 1, t });
    A.figure(ctx, 'enforcer', 1110, 492, 1.3, { face: -1, t: t + 1 });
    A.figure(ctx, 'darklord', 640, 440, 1.12, { face: -1, t, mood: 'smirk' });
    A.figure(ctx, 'larissa', 400, 494, 1.25, { face: 1, t, mood: 'neutral' });
    A.vignette(ctx, 0.7);
  }

  St.throne = () => G.Cinematic({
    id: 'throne', chapter: 'Chapter II · The Obsidian Spire', script: THRONE, draw: (ctx, t) => drawThrone(ctx, t),
    onDone: () => { St.nudge(); G.go(St.hangar); },
  });

  // ================= HANGAR =================
  const HERMIA = {
    start: { branch: (S) => (!S.flags.metHermia ? 'intro' : S.rel.hermia >= 30 && !S.flags.hermiaBond ? 'bond' : 'menu') },
    intro: {
      who: 'hermia', text: "You're the Potter girl. Hermia Grange — team strategist. I've read everything ever written about the Derby. Including the parts they burned.",
      fx: { flags: { metHermia: true } },
      choices: [
        { t: 'Then you know how to beat the Serpent Squad?', tag: 'Earnest', fx: { rel: { hermia: 8 } }, next: 'i1' },
        { t: "Strategy doesn't win races. Flying does.", tag: 'Brash', fx: { rel: { hermia: -5 } }, next: 'i2' },
        { t: "Why fly for a prisoner team? It's dangerous for you.", tag: 'Concerned', fx: { rel: { hermia: 6 }, trust: 2 }, next: 'i3' },
      ],
    },
    i1: { who: 'hermia', text: "I know how they cheat. That's a start. Fly through the rings — they feed your boost. And shoot the hex orbs before they reach you." },
    i2: { who: 'hermia', mood: 'neutral', text: "Flying doesn't win races that are rigged. Thinking does. Come back when you're ready to think." },
    i3: { who: 'hermia', mood: 'sad', text: "My father's in Ashkaban too. Let's just say I have reasons. ...Fly through the rings. They feed your boost." },
    bond: {
      who: 'hermia', text: "I've been working on something. A ward I could weave into your broom — it'd catch one hex for you, every so often. Study group, you and me?",
      fx: { flags: { hermiaBond: true }, rel: { hermia: 3 } }, next: 'bond2',
    },
    bond2: { text: "New skill available to Larissa: Study Group (Heart). Press K to learn it." },
    menu: {
      who: 'hermia', text: (S) => (S.rel.hermia >= 30 ? 'Ready for the next one? I made you flashcards.' : 'Need something?'),
      choices: [
        { t: 'Any tactics for the next race?', tag: 'Practical', next: 'tip' },
        { t: 'Tell me about your father.', tag: 'Concerned', if: (S) => !S.flags.hermiaFather, fx: { rel: { hermia: 7 }, flags: { hermiaFather: true } }, next: 'father' },
        { t: 'Want to fly the practice laps with me?', tag: 'Earnest', if: (S) => S.flags[`hPractice${S.races}`] !== true, fx: { rel: { hermia: 5 }, xpL: 10 }, run: (S) => (S.flags[`hPractice${S.races}`] = true), next: 'practice' },
        { t: 'Later.', next: 'end' },
      ],
    },
    tip: { who: 'hermia', text: (S) => G.U.pick([
      'Brutus Grime shoots more when the Enforcers are watching you. Keep your Safety up and he gets lazy.',
      'Tap Q right before a hex lands. Larissa can roll through it; Serious can shoulder through it.',
      "Don't hug the bottom — the spires are worse than the cages. The cages at least have warning lights.",
      'If Trust is high, the crowd surges at halfway. People will cheer for you if they believe you.',
      'Storm clouds flicker purple before they strike. Count to two and go.',
    ]) },
    father: { who: 'hermia', mood: 'sad', text: "He printed a pamphlet. One. Two hundred copies. They took him for 'sedition' and the printing press for 'evidence'. If you win this, Larissa — people will start believing it can be won." },
    practice: { who: 'hermia', text: "Good. Lean into the turns. No — your other left. ...Better. Much better, actually." },
  };

  const RONAN = {
    start: { branch: (S) => (!S.flags.metRonan ? 'intro' : 'menu') },
    intro: {
      who: 'ronan', text: 'Ronan Weasel. Mechanic, chief morale officer, and the only person alive who can stop a Cleansweep Seven from exploding. Mostly.',
      fx: { flags: { metRonan: true } },
      choices: [
        { t: 'Mostly?', tag: 'Witty', fx: { rel: { ronan: 8 } }, next: 'i1' },
        { t: 'Can you make my broom faster?', tag: 'Practical', fx: { rel: { ronan: 3 } }, next: 'i2' },
        { t: 'Is anyone here actually qualified?', tag: 'Blunt', fx: { rel: { ronan: -6 } }, next: 'i3' },
      ],
    },
    i1: { who: 'ronan', text: "Ninety percent of the time it doesn't explode at all! The other ten it's more of a... vigorous fizz. You'll be fine." },
    i2: { who: 'ronan', text: "That's what the workbench is for. Go tune it — I'll supervise. By which I mean eat." },
    i3: { who: 'ronan', mood: 'neutral', text: "Qualified got arrested, mate. We're what's left." },
    menu: {
      who: 'ronan', text: (S) => (S.rel.ronan >= 40 ? "I've given your brooms a proper going-over. You'll start each race with extra boost." : "Alright? Broom's not on fire? Good, good."),
      choices: [
        { t: "What are you actually afraid of, Ronan?", tag: 'Concerned', if: (S) => !S.flags.ronanFear, fx: { rel: { ronan: 8 }, trust: 2, flags: { ronanFear: true } }, next: 'fear' },
        { t: 'Tell me a joke. I need one.', tag: 'Witty', if: (S) => S.flags[`rJoke${S.races}`] !== true, fx: { rel: { ronan: 4 } }, run: (S) => (S.flags[`rJoke${S.races}`] = true), next: 'joke' },
        { t: 'Later, Ronan.', next: 'end' },
      ],
    },
    fear: { who: 'ronan', mood: 'sad', text: "...Spiders. And that one day nobody fights back any more, and we all just... forget we ever did. Mostly spiders, though." },
    joke: { who: 'ronan', text: (S) => G.U.pick([
      "Why did the Death Enforcer cross the road? Nobody knows. Nobody asks. That's sort of the problem.",
      "What's the Dark Lord's favourite broom? The Cleansweep. Because he swept the election. ...Too soon?",
      "How many Ministry clerks does it take to change a lantern? None. The darkness is now official policy.",
    ]) },
  };

  const SERIOUS = {
    start: { branch: (S) => (S.flags[`sTalk${S.races}`] ? 'again' : 'talk') },
    again: { who: 'serious', text: (S) => (S.rel.serious >= 70 ? "Go on, Lissa. I'm proud of you. Now go and be terrifying." : 'Go on. Pell only gives us five minutes.') },
    talk: {
      who: 'serious',
      text: (S) => (S.races === 0 ? (S.flags.promise ? "You meant it, didn't you? About getting me out. Of course you did." : "They've given me a broom with a chain on it. Very fashionable.") : S.wins > 0 ? 'Did you hear the crowd? They were cheering for us. Out loud!' : "We'll get the next one. I've lost worse races. Usually to the bus."),
      run: (S) => (S.flags[`sTalk${S.races}`] = true),
      choices: [
        { t: "We'll fly together. Both of us. Every race.", tag: 'Together', fx: { rel: { serious: 6 }, trust: 2 }, next: 'tog' },
        { t: 'Let me do the flying. You rest.', tag: 'Protective', fx: { rel: { serious: -2 } }, next: 'prot' },
        { t: 'Tell me about Mum and Dad.', tag: 'Curious', if: (S) => !S.flags.parentsTalk, fx: { rel: { serious: 5 }, flags: { parentsTalk: true } }, next: 'par' },
        { t: 'Tell me about the old Derbies.', tag: 'Curious', if: (S) => S.flags.parentsTalk && !S.flags.oldDerby, fx: { rel: { serious: 3 }, xpS: 25, flags: { oldDerby: true } }, next: 'old' },
      ],
    },
    tog: { who: 'serious', text: "Together. Like the shopping. Except with more hexes and fewer eggs." },
    prot: { who: 'serious', mood: 'neutral', text: "I'm old, Lissa, not ornamental. Let me be useful. It's all they've left me." },
    par: { who: 'serious', mood: 'sad', text: "Your mum flew like she was arguing with the wind and winning. Your dad flew like he was apologising to it. They both laughed the whole way round. That's what he took from us — not the war. The laughing." },
    old: { who: 'serious', text: "Before the Serpent Squad, the Derby was a festival. Ribbons, pies, terrible singing. I came fourth once. Fourth! Crashed into the pie tent. Best day of my life." },
  };

  const PELL = {
    start: { branch: (S) => (S.flags.guardName ? 'known' : 'ask') },
    known: { who: 'pell', text: "Five minutes, Potter. ...Make it ten. Nobody's counting." },
    ask: {
      who: 'pell', text: 'Keep it short, citizen. Prisoner contact is monitored.',
      choices: [
        { t: "What's your name?", tag: 'Kind', fx: { safety: 5, flags: { guardName: true } }, next: 'name' },
        { t: '(Slip him some coins for a longer visit.)', tag: 'Clever', fx: { safety: -4, rel: { serious: 4 } }, next: 'bribe' },
        { t: 'Sorry. Never mind.', next: 'end' },
      ],
    },
    name: { who: 'pell', text: "...Pell. Nobody's asked that in a while. Don't — don't tell anyone I told you." },
    bribe: { who: 'pell', text: '*the coins vanish* I see nothing. I hear nothing. I am a wall.' },
  };

  const BOARD = {
    start: { text: (S) => `HARRIERS RACE BOARD — Derby record: ${S.wins} win${S.wins === 1 ? '' : 's'} of 3. Broom tuning: ${S.tuning ? '+' + S.tuning + '%' : 'not tuned'}. Owl post: ${S.daily.cipher ? 'sent' : 'available'}.`, next: 'b2' },
    b2: { text: 'Rider tips: W/S to climb and dive. D to accelerate, A to brake. Shift to boost. Space or click to cast. Q and E for your rider\'s abilities. Golden rings refill boost. Shoot hex orbs before they reach you.' },
  };

  const POST = {
    start: { branch: (S) => (St.lastPlace === 1 ? (S.wins >= 3 ? 'final' : S.wins === 1 ? 'w1' : 'w2') : 'loss') },
    w1: { who: 'serious', text: "One down, Lissa! Did you see Malfoyle's face? Like a lemon that's just been told bad news.", fx: { rel: { serious: 3 } }, next: 'w1b' },
    w1b: { who: 'hermia', mood: 'neutral', text: "They'll cheat harder next time. I'll start reading.", next: 'w1c' },
    w1c: { text: 'END OF THE FIRST PASS — Round 1 won. Rounds 2 and 3 are playable with tougher rivals; more story is on the way. Tune your broom, send a cipher, spend your skill points, and fly again.' },
    w2: { who: 'ronan', text: "TWO! Two wins! Somebody pinch me. Not hard. I bruise like a peach.", next: 'w2b' },
    w2b: { who: 'serious', text: 'One more, Lissa. One more and we go home and I make the worst pancakes you have ever eaten.' },
    final: { text: 'Three victories. The stadium falls silent as Lord Moldevort rises from his box, smiling as if he had planned it all along...', next: 'final2' },
    final2: { who: 'darklord', mood: 'smirk', text: 'A promise is a promise. Serious Bloop is free. Of course, freedom is such a... relative term.', next: 'final3' },
    final3: { text: 'TO BE CONTINUED. Thank you for playing the first pass of Larissa Potter and the Flying Derby.' },
    loss: { who: 'hermia', mood: 'neutral', text: 'We regroup. Tune the broom, check your skills, try a different rider. They can be beaten — I have notes.' },
  };

  let hangar = null;
  St.hangar = () => {
    if (hangar) return hangar;
    const talk = (script) => () => G.Dialogue.play(script, 'start', St.nudge);
    hangar = G.Explore({
      id: 'hangar', chapter: 'Chapter III · The Harriers’ Hangar', width: 1900, yMin: 500, yMax: 680, start: { x: 180, y: 600 },
      drawBack: (ctx, camX, t) => {
        A.hangarBack(ctx, camX, t);
        A.noticeBoard(ctx, 320 - camX, 486, '#c9e0d8', 'RACES');
        A.workbench(ctx, 540 - camX, t);
        A.owlPerch(ctx, 1000 - camX, t);
        A.gate(ctx, 1760 - camX, t);
      },
      drawFront: (ctx) => A.vignette(ctx, 0.5),
      npcs: [
        { id: 'board', x: 320, y: 510, draw: () => {}, label: 'Read the race board', talk: talk(BOARD), markerH: 170 },
        {
          id: 'bench', x: 540, y: 515, draw: () => {}, label: 'Tune your broom (minigame)', markerH: 130,
          talk: () => (G.S.daily.tune ? G.toast('Already tuned for the next race', '') : G.go(() => G.Tuning(St.hangar))),
        },
        { id: 'hermia', key: 'hermia', x: 760, y: 560, face: -1, label: 'Talk to Hermia', talk: talk(HERMIA) },
        {
          id: 'owl', x: 1000, y: 515, draw: () => {}, label: 'Send a cipher to the Old Guard (minigame)', markerH: 200,
          talk: () => (G.S.daily.cipher ? G.toast('The owl is still out on its last delivery', '') : G.go(() => G.Cipher(St.hangar))),
        },
        { id: 'serious', key: 'serious', x: 1230, y: 545, face: -1, label: 'Talk to Serious', talk: talk(SERIOUS) },
        { id: 'pell', key: 'pell', x: 1320, y: 575, face: -1, label: 'Talk to the guard', talk: talk(PELL) },
        { id: 'ronan', key: 'ronan', x: 1500, y: 610, face: -1, label: 'Talk to Ronan', talk: talk(RONAN) },
        {
          id: 'gate', x: 1760, y: 520, draw: () => {}, label: 'Enter the Flying Derby', markerH: 330, r: 120,
          talk: () => G.UI.racerSelect((who) => G.go(() => G.Derby(who, (place) => { St.lastPlace = place; St.pendingPost = true; G.go(St.hangar); }))),
        },
      ],
      enter: (s) => {
        if (St.pendingPost) {
          St.pendingPost = false;
          setTimeout(() => G.Dialogue.play(POST, 'start', St.nudge), 600);
        } else if (!G.S.flags.hangarIntro) {
          G.S.flags.hangarIntro = true;
          setTimeout(() => G.Dialogue.play({
            start: { text: "The Hollow Hill Harriers' hangar. It smells of broom-wax and bad decisions. Somewhere behind the racks, a chain rattles — Serious is here, under guard.", next: 'n2' },
            n2: { text: 'Talk to your new team, tune your broom at the workbench, and enter the Derby through the great doors at the far end.' },
          }, 'start'), 600);
        }
      },
    });
    return hangar;
  };

  St.byId = (id) => (id === 'throne' ? St.throne : id === 'hangar' ? St.hangar : St.market);
  St.reset = () => { hangar = null; St.pendingPost = false; };
})();
