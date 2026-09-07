import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  // Admin routes are excluded here; their utilities are generated separately
  // into app/(admin)/admin.css (see tailwind.admin.config.ts) so the global
  // stylesheet loaded by marketing pages stays small.
  content: [
    "./app/page.tsx",
    "./app/layout.tsx",
    "./app/MainLayout.tsx",
    "./app/components/*.{tsx,jsx,ts,js}",
    "./app/components/!(Admin)/**/*.{tsx,jsx,ts,js}",
    "./app/lib/**/*.{ts,tsx}",
    "./app/(pages)/**/*.{tsx,jsx,ts,js}",
  ],
  safelist: ['animate-pulse'],
  blocklist: ['dark'],
  theme: {
    screens: {
      sm: "576px",
      md: "768px",
      mid: "827px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1400px",
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      primary: {
        100: "#F7F7FD",
        200: "#ECECFB",
        300: "#D1D1F7",
        400: "#565add",
        500: "#2B1C50",
        600: "#212529"
      },
      secondary: {
        200: "#F2E0C7",
        400: "#f97316",
        500: "#ff641a"
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712',
      },
      // Semantic status colours. This `colors` block REPLACES Tailwind's default
      // palette, so anything not listed here silently generates no CSS — which
      // is why the AI Detector's green/amber/red sentence tints, underlines and
      // legend dots rendered as plain black text. Only the shades actually used
      // are included, to keep the bundle small.
      emerald: {
        50: '#ecfdf5',
        100: '#d1fae5',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      amber: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      blue: {
        50: '#eff6ff',
        900: '#1e3a8a',
      },
    },
    // Strictly limited spacing to only used values (REDUCES CSS DRASTICALLY)
    spacing: {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      96: '24rem',
    },
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          md: "2rem",
          lg: "2rem",
          xl: "2rem",
          "2xl": "2rem",
        },
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        sample: "url('/Image/sampleBg.webp')",
        heroImage: "url('/Image/bgHeroBoyGirl.webp')",
      },
    },
  },
  // NOTE: A `corePlugins` allowlist previously lived here, disabling ~49 utility
  // families to shrink the CSS bundle. It was tuned for the home page only, so
  // every other route (assignment, exams, homework, take-my-class-*, /scan,
  // etc.) lost utilities it relies on and rendered nearly unstyled. Tailwind's
  // JIT engine already emits only the classes actually used in the scanned
  // files, so the manual blocklist gave no real size benefit while breaking
  // pages. Removed entirely to restore default behavior (all utilities enabled)
  // across the whole site.
  plugins: [require("tailwind-scrollbar-hide")],
};
export default config;
