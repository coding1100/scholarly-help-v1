import type { Config } from "tailwindcss";
import baseConfig from "./tailwind.config";

/**
 * Tool-scoped Tailwind pass, referenced by app/tools.css via @config.
 * Covers everything the global config did before tool markup was dropped from
 * it, so tools.css is a superset of the global utilities. Because it loads
 * after globals.css, every utility a tool page uses resolves in Tailwind's own
 * order, exactly as when one stylesheet held them all.
 * Theme/plugins are inherited from the main config so class output matches.
 */
const config: Config = {
  ...baseConfig,
  content: [
    "./app/page.tsx",
    "./app/layout.tsx",
    "./app/MainLayout.tsx",
    "./app/components/*.{tsx,jsx,ts,js}",
    "./app/components/!(Admin)/**/*.{tsx,jsx,ts,js}",
    "./app/lib/**/*.{ts,tsx}",
    "./app/(pages)/**/*.{tsx,jsx,ts,js}",
  ],
};

export default config;
