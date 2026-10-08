import { Poppins } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Metadata } from "next";
import OrganizationSchema from "./components/OrganizationSchema";

import ClientScripts from "./components/ClientScripts";

// next/font self-hosts Poppins, so the page makes no Google Fonts requests.
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  preload: true,
  fallback: ["Poppins", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: false,
});

// Italic faces join the same "Poppins" family so <em>/<i>/`italic` text gets
// real italic glyphs. Not preloaded: they only download when italic text renders.
// Its variable is applied on <html> only so the @font-face rules are emitted.
const poppinsItalic = Poppins({
  subsets: ["latin"],
  style: "italic",
  display: "swap",
  variable: "--font-poppins-italic",
  weight: ["400", "600", "700"],
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Scholarly Help - Academic Writing Services For You",
  description: "Professional academic writing services tailored to your needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${poppinsItalic.variable} font-poppins`}>
      <head>
        {/* Force HTTPS for all resources in production only */}
        {process.env.NODE_ENV === "production" &&
          process.env.DISABLE_HTTPS_HEADERS !== "true" && (
          <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        )}
      </head>
      <body className={`${poppins.className} font-poppins`} suppressHydrationWarning>
        <OrganizationSchema />
        <main id="main-content">{children}</main>
        {/* Client-side scripts that need pathname */}
        <ClientScripts />
      </body>
    </html>
  );
}
