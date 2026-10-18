# Larissa Potter and the Flying Derby — first pass

Browser action-adventure with a choices-matter story. The Dark Lord won the war years ago. When Larissa's uncle, Serious Bloop, is arrested for defending an old man, Larissa has to win the Flying Derby to free him.

## Run
Open `index.html` in a browser. There's no build step and no dependencies. Fonts load from Google Fonts. You can also serve the folder (`python3 -m http.server`) and open http://localhost:8000.

## What's in this pass
- **Story flow:** Diagon Row market (explore, talk, choose) → arrest cutscene (with an optional street fight) → Dark Lord audience → Harriers' hangar hub ⇄ Flying Derby races (3 wins to free Serious).
- **Character control and combat:** WASD/arrows to walk, E to interact. Street combat: Space/click to cast, Shift to dodge.
- **Flying Derby (core loop):** side-scrolling broom race. Rings refill boost. Spires, cages and storm clouds are hazards, hostile rivals throw hexes, and Enforcer hex orbs can be shot down. Q/E are rider abilities. Choose **Larissa** (fast, agile) or **Serious** (tanky, hard-hitting) for each race.
- **Skill trees (K):** 3 branches per rider. Story-gated nodes unlock from choices, relationships, Trust and Safety: Fennick's token, defying the Dark Lord, Hermia's bond, and so on.
- **Relationships and meters (J):** Serious, Old Fennick, Hermia, Ronan. **Trust** = how much people stand with you; high Trust rallies the crowd mid-race. **Safety** = distance from the regime's eye; low Safety brings extra Enforcer hazards.
- **Minigames:** Broom Tuning (timing, gives a speed bonus for the next race) and the Old Guard Cipher (memory, builds Fennick/Trust, and getting intercepted costs Safety).
- Autosaves to localStorage. Use Continue on the title screen.

## Layout
```
js/core.js        engine: stage scaling (HiDPI), input, state, effects, scene/fade loop
js/art.js         procedural characters (from assets/reference photos), riders, portraits, environments
js/ui.js          HUD meters, toasts, panels, journal, rider select
js/dialogue.js    branching dialogue (choices, tags, locked options, effects)
js/skills.js      skill trees + derived Derby stats
js/story.js       all story scripts and scene wiring
js/scenes/        explore (walk/talk/combat), cinematic, derby, minigames, title
```
