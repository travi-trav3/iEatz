const AD_TWEAKS = /*EDITMODE-BEGIN*/{
  "ctaMode": "both",
  "accent": "#1F8B4C",
  "headlineScale": 1,
  "scrim": 1,
  "brandBadge": true,
  "safeZoneGuides": false
}/*EDITMODE-END*/;

function AdTweaks() {
  const [t, setTweak] = useTweaks(AD_TWEAKS);
  React.useEffect(() => {
    const b = document.body, r = document.documentElement;
    b.dataset.cta = t.ctaMode;
    b.dataset.badge = t.brandBadge ? 'on' : 'off';
    b.dataset.guides = t.safeZoneGuides ? 'on' : 'off';
    r.style.setProperty('--accent', t.accent);
    r.style.setProperty('--hlScale', String(t.headlineScale));
    r.style.setProperty('--scrim', String(t.scrim));
  }, [t]);
  return (
    <TweaksPanel>
      <TweakSection label="Call to action" />
      <TweakRadio label="CTA" value={t.ctaMode} options={['badge', 'both', 'pill']}
                  onChange={(v) => setTweak('ctaMode', v)} />
      <TweakColor label="Accent" value={t.accent}
                  options={['#1F8B4C', '#0E4A2A', '#08311B', '#E4A93C']}
                  onChange={(v) => setTweak('accent', v)} />
      <TweakSection label="Typography" />
      <TweakSlider label="Headline size" value={t.headlineScale} min={0.8} max={1.2} step={0.02}
                   onChange={(v) => setTweak('headlineScale', v)} />
      <TweakSection label="Imagery" />
      <TweakSlider label="Photo scrim" value={t.scrim} min={0.4} max={1} step={0.05}
                   onChange={(v) => setTweak('scrim', v)} />
      <TweakToggle label="Brand badge" value={t.brandBadge}
                   onChange={(v) => setTweak('brandBadge', v)} />
      <TweakSection label="Review" />
      <TweakToggle label="9:16 safe-zone guides" value={t.safeZoneGuides}
                   onChange={(v) => setTweak('safeZoneGuides', v)} />
    </TweaksPanel>
  );
}
ReactDOM.createRoot(document.getElementById('tweaks')).render(<AdTweaks />);
