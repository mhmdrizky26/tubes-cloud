// Mindspark — icons & decorative spark glyphs

const SparkMark = ({ size = 28, color, ember = "var(--ember-500)" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    {/* outer rounded square */}
    <rect x="1.5" y="1.5" width="29" height="29" rx="9" fill={color || "var(--ink-900)"} />
    {/* lightning bolt */}
    <path
      d="M17.5 5.5 L9 17.5 H14.5 L13 26.5 L23 13.5 H17 L17.5 5.5 Z"
      fill={ember}
      stroke="var(--ink-900)"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    {/* tiny sparkle dots */}
    <circle cx="6" cy="7" r="0.9" fill={ember} opacity=".7" />
    <circle cx="26" cy="24" r="0.9" fill={ember} opacity=".7" />
  </svg>
);

const SparkBolt = ({ size = 16, color = "var(--spark-500)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M13 2 L4 14 H10 L8 22 L20 9 H13 L15 2 H13 Z"
      fill={color}
      stroke={color}
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
  </svg>
);

const Sparkle = ({ size = 14, color = "var(--ember-500)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" fill={color} />
  </svg>
);

const Dot = ({ size = 6, color = "var(--spark-500)" }) => (
  <svg width={size} height={size} viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill={color} /></svg>
);

const Icon = {
  home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11 12 3 21 11" /><path d="M5 10v10h14V10" />
    </svg>
  ),
  book: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z" /><path d="M4 17a3 3 0 0 1 3-3h12" />
    </svg>
  ),
  upload: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 4v12" /><path d="m7 9 5-5 5 5" /><path d="M4 20h16" />
    </svg>
  ),
  chat: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 10h8" /><path d="M8 13h5" />
    </svg>
  ),
  quiz: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1.2-1.5 2.4" /><circle cx="12" cy="17.5" r="0.7" fill="currentColor" />
    </svg>
  ),
  cards: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="6" width="14" height="13" rx="2" /><path d="M7 3h12a2 2 0 0 1 2 2v11" />
    </svg>
  ),
  chart: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 20h16" /><path d="M6 16V9" /><path d="M11 16V5" /><path d="M16 16v-7" />
    </svg>
  ),
  bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 2 L4 14 H10 L8 22 L20 9 H13 L15 2 H13 Z" />
    </svg>
  ),
  search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m5 12 5 5 9-11" />
    </svg>
  ),
  cross: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  fire: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3c1 3-2 4-2 7a4 4 0 0 0 8 0c0-2-1-3-1-5 0 2-2 3-3 3 0-3 2-3-2-5Z" />
    </svg>
  ),
  file: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 3H6v18h12V7l-4-4Z" /><path d="M14 3v4h4" />
    </svg>
  ),
  pdf: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 3H6v18h12V7l-4-4Z" /><path d="M14 3v4h4" />
      <text x="12" y="17" fontFamily="JetBrains Mono" fontSize="5.6" fontWeight="700" textAnchor="middle" fill="currentColor" stroke="none">PDF</text>
    </svg>
  ),
  img: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="1.6" /><path d="m4 18 6-5 5 4 5-3" />
    </svg>
  ),
  slide: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="11" rx="2" /><path d="M9 20h6" /><path d="M12 16v4" />
    </svg>
  ),
  brain: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5 3 3 0 0 0 1 5v1a3 3 0 0 0 3 3" />
      <path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5 3 3 0 0 1-1 5v1a3 3 0 0 1-3 3" />
      <path d="M12 5v14" />
    </svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m12 3 2.6 5.6 6.4.6-4.8 4.3 1.4 6.5L12 17l-5.6 3 1.4-6.5L3 9.2l6.4-.6L12 3Z" />
    </svg>
  ),
  send: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 11 21 3 14 21l-3-8-8-2Z" />
    </svg>
  ),
  more: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
  ),
  paperclip: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 12 12 20a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7" />
    </svg>
  ),
  back: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  ),
  refresh: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path d="M3 21v-5h5" />
    </svg>
  ),
  shuffle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M16 4h4v4" /><path d="M4 4l5 5" /><path d="m20 4-9 9-2 2-5 5" /><path d="M16 20h4v-4" /><path d="m15 15 5 5" />
    </svg>
  ),
  google: (p) => (
    <svg viewBox="0 0 24 24" {...p}>
      <path fill="#EA4335" d="M12 10.6v3.4h4.8c-.2 1.2-1.6 3.6-4.8 3.6-2.9 0-5.2-2.4-5.2-5.3s2.3-5.3 5.2-5.3c1.6 0 2.7.7 3.3 1.3l2.3-2.2C16 4.7 14.2 4 12 4 7.6 4 4 7.6 4 12s3.6 8 8 8c4.6 0 7.6-3.2 7.6-7.7 0-.5 0-.9-.1-1.4H12Z"/>
    </svg>
  ),
};

// Decorative spark splash for hero panels (no copyrighted icons!)
const SparkSplash = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <circle cx="100" cy="100" r="62" fill="var(--spark-500)" opacity=".18" />
    <circle cx="100" cy="100" r="40" fill="var(--ember-500)" opacity=".35" />
    <path d="M108 50 L74 110 H96 L88 158 L132 92 H108 L116 50 Z" fill="var(--ink-900)" />
    <path d="M108 50 L74 110 H96 L88 158 L132 92 H108 L116 50 Z" fill="url(#sg)" />
    <defs>
      <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="var(--spark-500)" />
        <stop offset="1" stopColor="var(--ember-500)" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="40" r="4" fill="var(--ember-500)" />
    <circle cx="170" cy="70" r="3" fill="var(--spark-500)" />
    <circle cx="160" cy="160" r="5" fill="var(--ember-500)" />
    <circle cx="30" cy="150" r="3" fill="var(--spark-500)" />
  </svg>
);

export { SparkMark, SparkBolt, Sparkle, Dot, Icon, SparkSplash };
