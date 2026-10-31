# iOS App UI Kit

Click-through recreation of the iEatz Healthy iOS app, based on the high-fidelity Figma file.

## Files
- `index.html` — kit preview with a live click-through phone + seven static screens
- `app.css` — iOS-specific CSS, sits on top of `colors_and_type.css`
- `Icons.jsx` — Lucide-style outline icons + the iEatz fridge logo
- `Chrome.jsx` — status bar, home indicator, tab bar, FAB
- `Screens.jsx` — `ScreenSplash`, `ScreenSignUp`, `ScreenHome`, `ScreenRecipes`, `ScreenProfile`, `ScreenChooseIngredients`, `ScreenPaywall`

## Visual rules (matches Figma)
- Default background: `#F1FCF3` (app-mint-bg) — almost-white green
- Primary CTA: deep green `#193A19` filled, white text, weight 700
- Bright `#3BBF4F` for FAB, active chips, action circle buttons
- Plus Jakarta Sans throughout (NOT Instrument Serif — that's marketing only)
- 14px radius on fields and tiles; 20–24px on cards; pill = 999
- Bottom nav: Home · Favorites · ➕ FAB · Inventory · Profile
- Custom `Fridge` icon for the Inventory tab — matches the fridge mark in the logo

## Interactivity
- Bottom nav swaps between Home, Recipes (used for Inventory placeholder), Profile
- Filter pills toggle their active state
- Buttons hover/active states wired in CSS
