import { Poppins } from "next/font/google";
import Script from "next/script";
import dynamic from "next/dynamic";
import "./globals.css";
import { Metadata } from "next";
import OrganizationSchema from "./components/OrganizationSchema";

const ClientScripts = dynamic(() => import("./components/ClientScripts"), {
  ssr: false,
});

// Optimize font loading - next/font self-hosts fonts (NO CDN calls)
// display "optional": if Poppins isn't ready within the block period the
// metric-matched fallback stays for this page view (no late swap repaint).
// The swap repaint was registering as LCP (~3.5s) on slow connections.
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  preload: true,
  fallback: ["Poppins", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
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
    <html lang="en" className={`${poppins.variable} font-poppins`}>
      <head>
        {/* Resource Hints for better performance and sharp font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Force HTTPS for all resources in production only */}
        {process.env.NODE_ENV === "production" &&
          process.env.DISABLE_HTTPS_HEADERS !== "true" && (
          <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        )}
      </head>
      <body className={`${poppins.className} font-poppins`} suppressHydrationWarning>
        <OrganizationSchema />
        <main id="main-content">{children}</main>

        {/* Load analytics after hydration without waiting for page load or idle. */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-5ZHV46X');
            `,
          }}
        />

        {/* Client-side scripts that need pathname */}
        <ClientScripts />
      </body>
    </html>
  );
}
