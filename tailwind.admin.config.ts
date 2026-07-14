import type { Config } from "tailwindcss";
import baseConfig from "./tailwind.config";

/**
 * Admin-scoped Tailwind pass, referenced by app/(admin)/admin.css via @config.
 * Generates only the utilities used in admin markup so they can be dropped
 * from the global stylesheet that every marketing page loads.
 * Theme/plugins are inherited from the main config so class output matches.
 */
const config: Config = {
  ...baseConfig,
  content: [
    "./app/(admin)/**/*.{tsx,jsx,ts,js}",
    "./app/components/Admin/**/*.{tsx,jsx,ts,js}",
    "./app/lib/admin*.{ts,tsx}",
  ],
};

export default config;
