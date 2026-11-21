import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing, staticFile } from "remotion";
const serif = '"Instrument Serif", Georgia, serif', sans = '"Inter Tight", system-ui, sans-serif', mono = '"JetBrains Mono", monospace';
const F=(n:string)=>staticFile("fonts/"+n);
const fonts = `@font-face{font-family:"Instrument Serif";src:url(${F("InstrumentSerif-normal-400-1.woff2")}) format("woff2")}
@font-face{font-family:"Instrument Serif";font-style:italic;src:url(${F("InstrumentSerif-italic-400-0.woff2")}) format("woff2")}
@font-face{font-family:"Inter Tight";font-weight:600;src:url(${F("InterTight-normal-600-6.woff2")}) format("woff2")}
@font-face{font-family:"Inter Tight";font-weight:700;src:url(${F("InterTight-normal-700-7.woff2")}) format("woff2")}`;
type P = { store: string; lines: string[][]; total: string; dishes: string[][]; head: string };
export const ReceiptReel = ({ store, lines, total, dishes, head }: P) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  // handheld drift + slow push on the whole scene: the "not a slide deck" layer
  const drift = Math.sin(f / 17) * 2 + Math.cos(f / 29) * 1.5;
  const push = interpolate(f, [0, 195], [1, 1.04]);
  const tapeIn = spring({ frame: f, fps, config: { damping: 14, stiffness: 90 } });
  const stickerIn = spring({ frame: f - 120, fps, config: { damping: 9, stiffness: 160 } });
  const headIn = spring({ frame: f - 140, fps, config: { damping: 18 } });
  const line = (i: number) => interpolate(f, [8 + i * 6, 14 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const dish = (i: number) => spring({ frame: f - (70 + i * 9), fps, config: { damping: 16, stiffness: 120 } });
  return (
    <AbsoluteFill style={{ background: "#08311B", fontFamily: sans, transform: `scale(${push}) translate(${drift}px, ${-drift}px)` }}>
      <style>{fonts}</style>
      <div style={{ position: "absolute", left: 240, top: 220 + (1 - tapeIn) * 60, width: 600, background: "#FBF9F2", padding: "44px 44px 48px", transform: `rotate(-2deg)`, opacity: tapeIn, boxShadow: "0 40px 90px rgba(0,0,0,.45)", fontFamily: mono, color: "#0A0F0C" }}>
        <div style={{ textAlign: "center", fontSize: 24, letterSpacing: ".12em" }}>{store.toUpperCase()}</div>
        <div style={{ borderTop: "2px dashed #C8CDCA", margin: "22px 0" }} />
        {lines.map(([a, b], i) => <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: 24, lineHeight: 1.75, opacity: line(i), transform: `translateY(${(1 - line(i)) * 8}px)` }}><span>{a}</span><span style={{ color: "#5C625E" }}>{b}</span></div>)}
        <div style={{ borderTop: "2px dashed #C8CDCA", margin: "22px 0", opacity: line(lines.length) }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 500, opacity: line(lines.length + 1) }}><span>TOTAL</span><span>{total}</span></div>
        <div style={{ marginTop: 24, fontSize: 26, letterSpacing: ".1em", color: "#5C625E", opacity: line(lines.length + 3) }}>IEATZ READ THIS AS</div>
        {dishes.map(([n, w], i) => <div key={n} style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontWeight: 600, fontSize: 26, lineHeight: 1.8, opacity: dish(i), transform: `translateX(${(1 - dish(i)) * -24}px)` }}><span>{n}</span><span style={{ fontFamily: mono, fontWeight: 400, color: "#5C625E", fontSize: 24 }}>{w}</span></div>)}
      </div>
      <div style={{ position: "absolute", right: 150, top: 300, background: "#E4A93C", color: "#0A0F0C", fontWeight: 700, fontSize: 30, padding: "18px 28px", borderRadius: 999, transform: `rotate(8deg) scale(${stickerIn})`, boxShadow: "0 12px 30px rgba(0,0,0,.35)" }}>Tuesday, sorted</div>
      <Sequence from={130}>
        <div style={{ position: "absolute", left: 90, right: 90, bottom: 260, fontFamily: serif, fontSize: 104, lineHeight: .95, color: "#F5F2EA", opacity: headIn, transform: `translateY(${(1 - headIn) * 30}px)` }}>{head.split(". ")[0]}. <em style={{ color: "#9FE4B3" }}>{head.split(". ")[1]}</em></div>
      </Sequence>
    </AbsoluteFill>
  );
};
