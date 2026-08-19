# Mochi Maths

Primary 6 maths practice for the Singapore MOE **SPERS-Sec** Secondary 1 placement test.

Questions, marking, bar models, worked solutions and the handwriting page are all
generated and graded in JavaScript on the device. The model is used for two things
only: talking to Euna, and reading her handwriting back to her. It never marks and
never calculates.

## Deploy to GitHub Pages

1. Put these files in a repo (or a folder inside `tallgeese84.github.io`):

   ```
   index.html
   sw.js
   manifest.webmanifest
   icon-192.png
   icon-512.png
   icon-maskable-512.png
   ```

2. Settings → Pages → Deploy from branch → `main` / root.
3. Open the URL, tap the cog, answer the multiplication gate, paste an Anthropic API key.
4. On the iPad: Share → **Add to Home Screen**. It installs as a standalone app.

## The API key

The key is stored in `localStorage` on that one device and is sent only to
`api.anthropic.com`. Because GitHub Pages is static hosting there is no server to
hide it behind, so treat it as a key that lives on a family tablet: set a **monthly
spend cap** in the Anthropic Console, and rotate it if the tablet leaves the house.

If you would rather the key never touched the device, put a Cloudflare Worker or a
Vercel function in front of the API and point the two `fetch` calls in `index.html`
at it instead. Nothing else has to change.

**Without a key the app still works.** Questions, marking, bar models, worked
solutions and the working page all run. Mochi falls back to built-in hints and
cannot read handwriting.

## Redeploying

Always ship `sw.js` next to `index.html`, and bump `SHELL` in `sw.js` when you
deploy. The page itself is fetched network-first so a new build is never hidden
behind a stale cache; fonts sit in their own bucket so code deploys do not evict them.

## Grown-ups panel

Triple the cog is not needed — one tap, then answer the two-digit multiplication.
Inside: cat name, cat photo, API key, per-topic accuracy, and reset.

## What is in the question bank

Fractions (of the remainder), ratio (units and parts), percentage (both directions),
rate and speed, algebra by substitution, circles (semicircle and quadrant, pi = 22/7),
volume in litres, angles on a straight line, average, gap-and-difference, order of
operations, and decimal money. Every question is generated fresh from parameters,
so the pool does not run out.
