# iEatz Healthy — Landing Page

Marketing landing page for **iEatz Healthy** ("Dinner, decided.") — an iOS app
that turns whatever's in your kitchen into healthy recipes in seconds.

## Run it

It's a static site. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html                     # the landing page (all page CSS inline in <style>)
assets/
  colors_and_type.css          # design-system tokens (:root custom properties)
  app-store-badge.png          # App Store download badge
  photos/                      # editorial food / kitchen photography
```

Typography (Instrument Serif, Inter Tight, Plus Jakarta Sans, JetBrains Mono)
loads from Google Fonts via a `<link>` in the page `<head>`.

## Design

Editorial-wellness direction: warm paper backgrounds, Instrument Serif display
type, brand green used sparingly. Design tokens live in
`assets/colors_and_type.css` and are referenced throughout via CSS variables
(e.g. `var(--paper)`, `var(--brand-green)`, `var(--font-serif)`).
