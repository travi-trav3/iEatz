# iEatz IG — "Send this to" (4 posts)

Standalone HTML, one post per file. Each renders a single 1080×1350 frame (`main.post`) — screenshot that element at 1× for a 1080×1350 PNG, or 2× for retina.

Source of truth: `templates/ig-send-this/IgSendThis.dc.html` in the iEatz Healthy design system.

## Files
- `01-full-fridge.html` — cream · approved
- `02-sunday-to-tuesday.html` — green · copy pending approval
- `03-trader-joes.html` — cream · copy pending approval
- `04-fridge-stare.html` — green · copy pending approval

## Spec
- Fonts: Instrument Serif 400 + italic (hook, payoff), Inter Tight 500/700 (wordmark, tagline) — Google Fonts. Wait for `document.fonts.ready` before capture.
- Hook 124px / 0.94 / -0.028em · payoff italic 54px / 1.1 · wordmark 46px bold · tagline 20px uppercase 0.18em
- Cream: bg #F5F2EA, hook #0E4A2A, payoff #5C625E · Green: bg #0E4A2A, hook #F5F2EA, payoff #BBE3C8
- Safe zone 80px all sides; bottom 15% kept clear of copy (caption band)
- Lowercase copy except proper nouns; no photos, emoji, or buttons

## Example capture (Playwright)
```js
await page.setViewportSize({ width: 1080, height: 1350 });
await page.goto('file://' + path);
await page.evaluate(() => document.fonts.ready);
await page.locator('main.post').screenshot({ path: out });
```
