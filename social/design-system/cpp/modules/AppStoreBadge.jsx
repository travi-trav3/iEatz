// AppStoreBadge.jsx — official-style "Download on the App Store" badge.
// Black pill, Apple logo + wordmark. Standard linking badge.
function AppStoreBadge({ height = 96, style }) {
  // native badge aspect ratio ≈ 120 x 40 (3:1)
  const w = height * 3;
  return (
    <svg
      viewBox="0 0 120 40"
      width={w}
      height={height}
      style={{ display:"block", ...style }}
      role="img"
      aria-label="Download on the App Store"
    >
      <rect x="0.5" y="0.5" width="119" height="39" rx="8.5" fill="#000" stroke="#A6A6A6" strokeWidth="0" />
      {/* Apple logo */}
      <g fill="#fff" transform="translate(11.5, 8.2) scale(0.95)">
        <path d="M13.62 12.6c-.02-2.18 1.78-3.23 1.86-3.28-1.02-1.49-2.6-1.69-3.15-1.71-1.34-.14-2.62.79-3.3.79-.68 0-1.73-.77-2.85-.75-1.46.02-2.81.85-3.56 2.16-1.52 2.63-.39 6.53 1.09 8.67.72 1.05 1.58 2.22 2.71 2.18 1.09-.04 1.5-.7 2.81-.7 1.31 0 1.68.7 2.83.68 1.17-.02 1.91-1.07 2.62-2.12.83-1.21 1.17-2.39 1.19-2.45-.03-.01-2.28-.87-2.3-3.46Z"/>
        <path d="M11.44 6.19c.6-.73 1.01-1.74.9-2.75-.87.04-1.92.58-2.54 1.3-.56.64-1.05 1.67-.92 2.65.97.07 1.96-.49 2.56-1.2Z"/>
      </g>
      {/* "Download on the" */}
      <text x="32" y="14" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="5.5" letterSpacing="0.3">Download on the</text>
      {/* "App Store" */}
      <text x="31.5" y="29" fill="#fff" fontFamily="Helvetica, Arial, sans-serif" fontSize="15" fontWeight="500" letterSpacing="-0.2">App Store</text>
    </svg>
  );
}

Object.assign(window, { AppStoreBadge });
