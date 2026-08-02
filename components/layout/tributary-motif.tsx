export function TributaryMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 500"
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="hsl(var(--primary))" strokeOpacity="0.18" strokeWidth="1.5">
        <path d="M0 420 C 200 400, 260 460, 420 430 S 640 380, 760 400 S 1000 460, 1200 410" />
        <path d="M100 460 C 260 440, 320 480, 480 450 S 700 410, 820 430 S 1050 470, 1200 440" />
        <path d="M0 380 C 180 340, 300 400, 460 360 S 660 300, 820 330 S 1060 380, 1200 340" />
      </g>
      <g stroke="hsl(var(--secondary))" strokeOpacity="0.22" strokeWidth="1">
        <path d="M0 300 C 160 260, 260 320, 400 280 S 600 220, 780 260 S 1000 310, 1200 270" />
      </g>
      <g fill="hsl(var(--primary))">
        <circle cx="420" cy="430" r="3.5" opacity="0.6" />
        <circle cx="760" cy="400" r="3" opacity="0.5" />
        <circle cx="480" cy="450" r="2.5" opacity="0.4" />
        <circle cx="820" cy="330" r="3" opacity="0.5" />
        <circle cx="400" cy="280" r="2.5" opacity="0.4" />
      </g>
    </svg>
  );
}
