# iEatz Healthy — Landing Page

Marketing landing page for **iEatz Healthy** ("Dinner, decided.") — an iOS app
that turns whatever's in your kitchen into healthy meals in three taps.

## Run it

It's a static site. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html                       # the landing page — all CSS (design tokens + page) inline
assets/
  app-store-badge.png            # App Store download badge
  avatar.png                     # testimonial avatar
  photos/
    couple-cooking.jpg           # hero
    fridge-real-mess.jpg         # "the tension" — a full but planless fridge
    fridge-organized.jpg         # transformation photo band
    pesto-pasta-bowl.jpg         # "dream meal" photo band
    spices-spoons.jpg buddha-bowl.jpg cutting-board-veg.jpg
    salmon.jpg tacos.jpg meal-prep-spread.jpg
    app-home.jpg                 # in-app screenshots used in the product gallery
    app-recipe.jpg
    app-instacart.jpg
```

Typography (Instrument Serif, Inter Tight, Plus Jakarta Sans, JetBrains Mono)
loads from Google Fonts via a `<link>` in the page `<head>`.

## Design

Editorial-wellness direction: warm paper backgrounds, Instrument Serif display
type, brand green used sparingly. Design tokens live in the `:root` block at the
top of the inline stylesheet and are referenced throughout via CSS variables
(e.g. `var(--paper)`, `var(--brand-green)`, `var(--font-serif)`).
