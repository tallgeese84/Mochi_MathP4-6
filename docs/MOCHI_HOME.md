# Mochi’s Home (v7.0.0)

Mochi’s Home is a 3D pet-care game in the spirit of a Tamagotchi, built for Euna. It replaces the earlier 3D room.

## How care works

Mochi has five needs, each shown as a soft bar: **Tummy**, **Energy**, **Fluffiness**, **Playfulness** and **Cuddles**.

| Care | How | Cost |
|---|---|---|
| Feed | Feed button or tap the bowl | Free |
| Brush | Brush button, then stroke his fur | Free |
| Play | Feather wand or yarn (free); box, laser dot, fish plush, cat tree (coins) | Free with starter toys |
| Nap | Nap button or tap his bed | Free |
| Cuddle | Tap or stroke Mochi | Free |
| Treats | Fish snack, milk, tuna, prawn | Coins |
| Wardrobe | Bow tie, specs, party hat, scarf, sunglasses, crown | Coins (same items and prices as before) |

When a need runs a little low, Mochi shows a gentle wish (“Wants to play…”). One wish at a time, never an alarm.

## The no-guilt promise

- Needs drift down only to a comfortable floor. Mochi is at worst “Cosy”, never sad, sick, hungry, lonely or gone.
- Time away is a nap: energy recovers, and he greets Euna when she comes back.
- Bond never decreases. It grows with care, up to a daily cap, so a long absence loses nothing and a long session cannot grind through every trick.
- A cat with no coins is still fully cared for.
- `tests/mochi-home-core.test.cjs` checks every message for guilt words and checks that no amount of time away goes below the floors.

## Bond, tricks and growing up

- **Bond** unlocks seven tricks: sit, high five (6), spin (14), roll over (26), wave (40), chase tail (58) and happy hop (80).
- **Four paw stamps** each day: a meal, a brush, playtime and cuddles. They reset each morning with no penalty.
- **Growing up** still comes from learning, as before. Mochi’s five stages, from tiny kitten to grown cat, follow the existing growth milestones.

## Mochi’s own life

He wanders, grooms, watches the window, naps in his bed (more often at night), sits in his box and climbs his cat tree when Euna has bought them. The room’s lighting follows the real clock: sunny day, golden evening, moonlit night with the lamp on. Up to three unlocked friends from the cat collection visit and can be petted.

## How Mochi moves

Mochi’s legs follow the floor rather than a clock. His gait cycle advances with the distance he actually covers, so a planted paw stays put while his body moves over it. He walks, trots or gallops depending on speed, eases in and out of motion, steps when turning on the spot, and crouches and wiggles before a pounce. `tests/mochi-home-scene.test.cjs` measures paw slide directly.

## Technical notes

- `mochi-home-core.js`: care rules (pure functions, unit-tested).
- `mochi-home-cat.js`: procedural stylised cats, poses and accessories.
- `mochi-home-scene.js`: room, behaviour, toys, particles, input and render loop. Loaded on demand with the release version; cached offline.
- `mochi-home-ui.js` and `mochi-home.css`: controls around the room.
- `mochi-room.js`: the existing loader, now pointed at the new scene. It keeps picture mode, the WebGL fallback and retry, lighter Android graphics and the friend-count check.
- Saved data: a new `S.home` record (needs, bond, toys, routine, counters, sound setting). Family sync carries it with the newest copy, like coins.
- Full quality draws at up to 2× pixel density and steps down automatically if frames are slow. It runs at 60 fps while Euna is interacting and 30 fps when idle, and pauses when the room is hidden.
