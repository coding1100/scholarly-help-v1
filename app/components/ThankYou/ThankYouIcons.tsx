import React from "react";

export const GraduationCapIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Cap Top */}
    <path
      d="M32 10L6 22L32 34L58 22L32 10Z"
      fill="#282D42"
      stroke="#1E2336"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Under edge yellow highlight */}
    <path
      d="M10 24L32 34.5L54 24"
      stroke="#FBBF24"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Skull cap base */}
    <path
      d="M16 27V39C16 44.5 23.16 49 32 49C40.84 49 48 44.5 48 39V27"
      fill="#1E2336"
      stroke="#1E2336"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Skull cap rim */}
    <path
      d="M17 40C20 44 25.5 46.5 32 46.5C38.5 46.5 44 44 47 40"
      stroke="#374151"
      strokeWidth="2"
    />
    {/* Tassel cord */}
    <path
      d="M48 24C49.5 26 51 29 51 35V45"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Tassel fringe */}
    <path
      d="M49 45H53L52 53H50L49 45Z"
      fill="#F59E0B"
    />
    {/* Center button */}
    <ellipse cx="32" cy="22" rx="2.5" ry="1.5" fill="#FBBF24" />
  </svg>
);

export const RatingBadgeIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Shield/Document background */}
    <rect x="15" y="10" width="34" height="42" rx="17" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2.5" />
    <path d="M22 24H32" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 30H30" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22 36H28" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
    {/* Star ribbon rosette on the top right */}
    <circle cx="43" cy="21" r="11" fill="#FF5A00" />
    <circle cx="43" cy="21" r="8" fill="#FF7A29" />
    {/* Rosette ribbon tails */}
    <path d="M38 29L36 43L43 39L50 43L48 29" fill="#FF5A00" />
    {/* White star */}
    <path
      d="M43 16L44.5 19.5H48.2L45.2 21.7L46.3 25.2L43 23L39.7 25.2L40.8 21.7L37.8 19.5H41.5L43 16Z"
      fill="white"
    />
  </svg>
);

export const HandshakeIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sparkle lines */}
    <path d="M32 7V12" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M23 11L26 15" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M41 11L38 15" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
    {/* Left cuff */}
    <path d="M11 41L18 34L23 39L16 46L11 41Z" fill="#6366F1" stroke="#4F46E5" strokeWidth="1.5" />
    {/* Right cuff */}
    <path d="M53 41L46 34L41 39L48 46L53 41Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
    {/* Hands shaking */}
    <path
      d="M18 34L28 24C29.5 22.5 32 22.5 33.5 24L38 28.5L34 32.5L31 29.5L25 35.5L32 42.5C33.5 44 36 44 37.5 42.5L44 36L46 38L39 45C36 48 31 48 28 45L18 35"
      fill="#FCD34D"
      stroke="#D97706"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M46 34L36 24C34.5 22.5 32 22.5 30.5 24L26 28.5L30 32.5L33 29.5L39 35.5L32 42.5"
      fill="#FBBF24"
      stroke="#D97706"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const BooksIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Bottom Book (Orange/Gold) */}
    <path d="M12 47H48C50.2 47 52 48.8 52 51C52 53.2 50.2 55 48 55H12V47Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
    <path d="M12 47V55H16V47H12Z" fill="#B45309" />
    <path d="M16 49H48C49.1 49 50 49.9 50 51C50 52.1 49.1 53 48 53H16V49Z" fill="#FEF3C7" />

    {/* Middle Book (Green/Teal) */}
    <path d="M14 37H50C52.2 37 54 38.8 54 41C54 43.2 52.2 45 50 45H14V37Z" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
    <path d="M14 37V45H18V37H14Z" fill="#047857" />
    <path d="M18 39H50C51.1 39 52 39.9 52 41C52 42.1 51.1 43 50 43H18V39Z" fill="#D1FAE5" />

    {/* Top Book (Blue) */}
    <path d="M16 27H48C50.2 27 52 28.8 52 31C52 33.2 50.2 35 48 35H16V27Z" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
    <path d="M16 27V35H20V27H16Z" fill="#1D4ED8" />
    <path d="M20 29H48C49.1 29 50 29.9 50 31C50 32.1 49.1 33 48 33H20V29Z" fill="#DBEAFE" />

    {/* Red bookmark ribbon */}
    <path d="M44 35V52L47 49L50 52V35H44Z" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
  </svg>
);

export const CheckmarkIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="10" cy="10" r="9.5" fill="#5B4BD8" stroke="#5B4BD8" />
    <path
      d="M6 10.2L8.6 12.8L14 7.4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);export const AiChipIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer chip body */}
    <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.5" />
    {/* Pins */}
    <path d="M7 1V3.5M12 1V3.5M17 1V3.5" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 20.5V23M12 20.5V23M17 20.5V23" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1 7H3.5M1 12H3.5M1 17H3.5" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M20.5 7H23M20.5 12H23M20.5 17H23" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
    {/* Inner AI text */}
    <text
      x="12"
      y="15"
      fontSize="8.5"
      fontWeight="800"
      fontFamily="system-ui, sans-serif"
      fill="#4F46E5"
      textAnchor="middle"
    >
      AI
    </text>
  </svg>
);

export const OrangeUnderlineFlourish = ({ className = "w-full" }: { className?: string }) => (
  <svg
    viewBox="0 0 240 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="none"
  >
    <path
      d="M2 11C40 6 90 14 135 13C175 12 210 5 238 4C215 9 175 16 135 16C85 16 35 14 2 11Z"
      fill="#FF5A00"
    />
    <path
      d="M8 12.5C55 8.5 110 14.5 155 13.5C195 12.5 228 6.5 236 4.5"
      stroke="#FF5A00"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

