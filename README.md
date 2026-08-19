# Mochi Maths

Primary 6 maths practice for the Singapore MOE **SPERS-Sec** Secondary 1 placement test.

Questions, marking, bar models, worked solutions and the handwriting page are all
generated and graded in JavaScript on the device. The model is used for two things
only: talking to Euna, and reading her handwriting back to her. It never marks and
never calculates.

## Versions

Semantic versions from v1.1.0 onward: patch for fixes, minor for new features, major for
anything that resets saved progress. `CHANGELOG.md` records each one.

Open the cog and look under **Build** for the running version, e.g. `site v1.1.0 - 2026-08-19`.
The same string is a comment in the first lines of `index.html`. Bump `SHELL` in `sw.js`
to match on every deploy, or a cached worker may keep serving the old build.

## Coins and Mochi's room

Correct answers earn 2 coins, plus 5 more on every fifth in a row. Revealing the worked
solution first earns nothing, so the reward tracks working it out rather than reading it.

The second tab is the room. She can stroke Mochi, buy cat munch, and buy accessories he
then wears - six of them across head, eyes and neck, drawn over his photo. Coins are
earned in the maths tab only; the room is the reward, not another place to grind.

The purr meter rises when she plays and drifts back to calm by itself. There is no hunger,
no decay, and no way for Mochi to be sad or neglected - deliberately, since a pet that
guilt-trips a child is the wrong thing to attach to exam revision.

Accessory positions are tuned to the shipped picture. If you swap in a different photo
they may need nudging; they live in `ACC_SVG` in `index.html`, drawn on a 0-100 square.

## Which build is this

Open the cog and look under **Build**. It reports the build date and the size of the
question bank, e.g. `site 2026-08-19 - 22 question types - 22 generators across 12 topics`.
Compare that against whatever you last deployed. The same string is also a comment in the
first few lines of `index.html`, so you can check it without opening the app.

Remember to bump `SHELL` in `sw.js` when you deploy, or a cached worker may keep serving
the previous build.

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

## Sound is off by default

Every reply is written out in full in the chat panel under the question, so nothing is
delivered by voice alone. The speaker button in the top bar turns automatic reading on
if she wants it; with it off, each reply still carries a small speaker she can tap to
hear just that one.

## Euna only ever meets Mochi

The engine is invisible to her. No product name, no model id, no "via ChatGPT" appears
anywhere on her side of the screen; the tutor is simply Mochi. The prompt forbids naming
the company or model and forbids calling itself an AI or a chatbot.

It stops short of lying to her. If she asks whether Mochi is real, alive, a person, a
robot, or "are you ChatGPT", she gets a straight answer - *"I am a computer program that
helps you with maths, drawn as a cat"* - and that reply is generated on the device, so no
model can get it wrong and it costs nothing.

The one thing she does see is an `offline` chip when there is no connection, so she knows
why Mochi is only giving short hints.

## How to tell which engine is answering (grown-ups)

Open the cog. Under **This session** it reports what actually answered the last reply,
rather than what is merely configured:

`Answering: ChatGPT (OpenAI) - gpt-5.6-terra. Replies: 4 from ChatGPT (avg 1.4s), 1 local.
12 answered, 75% correct, best streak 5.`

If a call fails mid-session it flips to `built-in hints (no model)` on its own, so a silent
failure cannot be mistaken for a working tutor. Switching provider clears it until the new
one has actually answered. Her score lives here too rather than on screen - a running
accuracy percentage in front of a child is discouraging, and a streak of paw prints is not.

For proof independent of anything this app says, open **platform.openai.com/usage** -
the requests appear there within a minute or two.

## Reading the OpenAI dashboard

The dashboard lists display names; the API wants ids. The app converts them for you, so
typing `GPT-5.6 Terra` stores `gpt-5.6-terra`. Mapping:

| Dashboard card | Type this | Use it for |
|---|---|---|
| GPT-5.6 Sol | `gpt-5.6-sol` | skip - frontier model, slower and dearer for no gain here |
| GPT-5.6 Terra | `gpt-5.6-terra` | talking, and reading handwriting |
| GPT-5.6 Luna | `gpt-5.6-luna` | talking, if Terra feels slow |
| Audio | - | not needed; reading aloud uses the device's own voice, offline and free |
| Image | - | not needed; that card *generates* images. Reading her handwriting is image *input*, which Terra and Luna already do |

## How the tutor gives help

It will not give Euna the answer to the question she is on, no matter how often she
asks. Each time she asks it goes one step further:

1. what is the question asking, and what are you told
2. what has to happen first, phrased as a question
3. name the tool - bar model, units and parts, working backwards
4. which step she is stuck on and what kind of operation it needs
5. try the same idea with small easy numbers first
6. work through a **similar** question, then ask her to do hers the same way

That similar question is generated by the same generator that produced hers, so it
is the same shape and its working is correct by construction. It is rejected if it
shares her answer or reuses her numbers. This runs offline too.

The withholding lifts the moment she submits an answer - then the tutor explains her
question fully. She also has her own **Show the working** button at any time, so she is
never stuck with no way out; taking it simply earns no coins.

## Which model to pick

This app never asks a model to do the maths. Questions, answers, working and marking are
all generated and checked in JavaScript. So raw mathematical ability is not the thing to
select on; what matters is following the tutoring rules, replying fast enough that an
11-year-old does not drift off, and reading handwriting.

There are two model boxes for that reason:

- **model for talking** - runs many times a session. Pick for speed.
  `gpt-5.6-terra` or `claude-sonnet-5` to start. If it feels slow, drop to
  `gpt-5.6-luna` or `claude-haiku-4-5-20251001`.
- **model for reading handwriting** - runs rarely and is genuinely hard vision work.
  Leave it on the stronger model. Blank means "same as the talking model".

Skip the flagship tiers (`gpt-5.6-sol`, `claude-opus-5`) and any high reasoning effort.
The app already sets `reasoning_effort: low` on OpenAI, because a model that has been
handed the answer and the worked steps has nothing to deliberate about, and deliberating
is just waiting.

Cost is not the deciding factor at this scale. A tutoring reply is roughly 1,200 input
and 200 output tokens - well under a dollar a month on Terra at daily practice, and
pennies on Luna. Choose on how well it explains and how quickly it answers.

The grown-ups panel shows the average reply time per provider, and the **Test** button
reports how long a single call took, so you can compare rather than guess.

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

42 generators across 16 topics, every question built fresh from parameters so the pool
never runs out:

- **Fractions** - fraction of the remainder, dividing by a fraction, working backwards
- **Ratio** - units and parts, change in ratio after a transfer
- **Percentage** - discount, finding the whole, percentage increase and decrease
- **Speed** - find speed / distance / time, average speed over two legs
- **Rate** - filling at a constant rate
- **Algebra** - substitution
- **Circles** - semicircle and quadrant, area and perimeter, pi = 22/7
- **Volume** - volume of water in litres, finding the depth from the volume
- **Angles** - angles on a straight line, angles in a parallelogram
- **Average** - finding a missing value from the total
- **Whole numbers** - gap and difference, order of operations
- **Decimals** - money and change, fraction to decimal
- **Measurement** - converting between kg/g, km/m, l/ml, m/cm
- **Time** - duration between two 24-hour times
- **Data** - pie charts, bar graphs and line graphs
- **Money** - two coin denominations

### On exam papers

Real papers are used for calibration only - topic spread, difficulty, mark weighting and
the English register a P6 paper actually uses. No question is copied from any paper.
Schools' prelim papers are their copyrighted work, and reproducing them, even reworded,
is not something this project does. Use the PDFs directly for timed paper practice; this
app is for daily drilling and instant marking.

The bank is calibrated against the standard PSLE shape both papers follow:
Paper 1 Booklet A (Q1-10 one mark, Q11-15 two marks), Booklet B (Q16-20 one mark,
Q21-30 two marks), Paper 2 (Q1-5 two marks, Q6-17 three to five marks and multi-part).
Star ratings map to that: one to two stars for one-mark recall, three for two-mark
working, four to five for Paper 2 multi-step problems.

Still not covered, and the honest next gap: nets and solid views, symmetry, grid
geometry and drawing, and multi-part questions where part (b) depends on part (a).

Every answer is verified by a script that re-derives it by parsing the question text,
independently of the code that generated it, and the marker is mutation-tested against
wrong answers and against every way a child might type a unit.
