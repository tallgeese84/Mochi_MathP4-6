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

## Turning on the ChatGPT tutor

1. Get an **API key** at platform.openai.com -> API keys. This is separate from a
   ChatGPT Plus subscription; Plus does not include API credit. Add a little billing
   under Settings -> Billing, and set a monthly limit while you are there.
2. Open the app on your Pages URL, tap the cog, answer the multiplication.
3. Under **Tutor**, choose `ChatGPT (OpenAI)`, paste the key, leave the model box empty
   for the default (`gpt-5.6`) or type another name.
4. Tap **Test**. It makes one tiny call and tells you exactly what happened - working,
   key rejected, no such model, or out of credit.
5. Tap **Save**. The `offline hints` badge next to *Ask Mochi* disappears once it is live.

Switching back to Claude is the same panel; both keys are remembered separately.

## How to tell which engine is answering

Next to **Ask Mochi** there is a badge, and it reports what actually answered the last
reply rather than what is merely configured:

| badge | meaning |
|---|---|
| `ChatGPT ready` (green) | a key is saved and it is online, but nothing has answered yet |
| `via ChatGPT - gpt-5.6` (green) | that reply came from OpenAI, using that model |
| `via Claude - claude-sonnet-4-6` (green) | that reply came from Anthropic |
| `offline hints` (orange) | the built-in hint ladder answered, not a model |

If a call fails mid-session the badge drops back to `offline hints` on its own, so a
silent failure cannot be mistaken for a working tutor. Switching provider clears the
badge back to `... ready` until the new one has actually answered.

The grown-ups panel also shows a running count, e.g.
`This session: 1 from Claude, 2 from ChatGPT, 1 local. Last model used: gpt-5.6.`

For proof independent of anything this app says, open **platform.openai.com/usage** -
the requests appear there within a minute or two.

## Choosing the tutor

Under the cog you can pick **Claude (Anthropic)** or **ChatGPT (OpenAI)**, paste a key for
whichever you choose, and optionally type a model name to override the default
(`claude-sonnet-4-6` / `gpt-5.6`). Keys and model names are stored per provider, so you can
keep both and flip between them to compare.

The request shapes differ and the app handles that for you: Anthropic takes `system` as a
top-level parameter, OpenAI takes it as the first message; images use `source` for Anthropic
and `image_url` for OpenAI. For OpenAI it sends `max_completion_tokens` and retries with
`max_tokens` if the model is an older one that wants the old name.

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

## Does it need the internet?

For the tutor and for reading handwriting, yes — both go to a hosted model. Everything
else is generated and graded on the device and keeps working with no connection at all:

- questions, marking, streaks and progress
- bar models and full worked solutions
- the working page: tap **Type a line** and every line you enter is still checked
- an offline hint ladder — asking for help repeatedly walks you through the worked
  solution one step at a time, so she is never left with nothing

An **offline hints** badge appears next to *Ask Mochi* when it is running that way.
The service worker caches the whole app, so it opens and runs on a plane.

## Keeping her on the question

Before any request is sent, the message is checked on the device against the current
question. Anything unrelated is answered locally and never reaches the model, so it
cannot become a general chatbot and off-topic chat costs nothing. The conversation also
resets between questions, so nothing carries over. If a message suggests real distress
it is not treated as off-topic: she gets a short reply pointing her to a trusted adult,
and it is never sent to a model.

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
