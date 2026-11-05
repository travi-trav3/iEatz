# social/motion: Remotion reels

Install: `npm install`
Preview: `npx remotion studio`
Render:  `npx remotion render src/index.ts ReceiptReel out/receipt-reel.mp4 --codec=h264`

In a sandbox without a browser download, set `REMOTION_BROWSER` to a chrome-headless-shell binary
(`/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`) and pass `--chrome-mode=chrome-for-testing`.
Fonts live in `public/fonts` (copied from `../render/fonts`). Photos: copy needed files into `public/photos`
or set `Config.setPublicDir` to `../../assets` in `remotion.config.ts`.
