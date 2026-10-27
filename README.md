# Boston Aesthetics — Product GUI Demos

Internal demo hub for interactive device-interface simulations.

**BA internal use only — do not distribute.**

## Contents

| Path | Product | Notes |
|------|---------|-------|
| `index.html` | Front page | Passcode-gated hub (light theme, BA green `#3aae36`) |
| `zentite/` | ZenTite | Multi-page static prototype, deployed as-is |
| `cofrax/` | Cofrax | Single self-contained HTML file |
| `sonexa/` | Sonexa | Single self-contained HTML file (100% untouched) |

The only edits made to the engineers' files were browser tab `<title>` tags
(Cofrax, ZenTite) and the `lang` attribute on Cofrax. No UI or functionality
was modified.

## Deploy to GitHub Pages (free)

```bash
cd ba-gui-demo
git init
git add .
git commit -m "BA product GUI demos"
git branch -M main
git remote add origin https://github.com/liao56608/ba-gui-demo.git
git push -u origin main
```

Then on GitHub:

1. Open the repo → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** = `Deploy from a branch`
3. Branch = `main`, folder = `/ (root)` → **Save**

Your site goes live at: `https://liao56608.github.io/ba-gui-demo/`

(First deploy takes 1–2 minutes. If a demo 404s, wait and refresh.)

## Changing the passcode

Open `index.html` and edit this line near the bottom:

```js
var PASSCODE = "Ba123123";
```

Note: this is a client-side deterrent, not real security — the code is visible
in the page source, and the three demo URLs work if typed directly. Do not
publish this repo publicly if that is a concern (GitHub Pages free tier
requires the repo to be public).

## Repo settings

- Keep the repo **public** (required for free GitHub Pages)
- `index.html` already sends `noindex, nofollow` so search engines skip it
- Optionally add topics/private-notes in the repo About section
