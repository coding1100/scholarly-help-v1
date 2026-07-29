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
  display: "optional",
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: true,
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
    <html lang="en" className={poppins.variable}>
      <head>
        {/* Resource Hints for better performance */}


        {/* Force HTTPS for all resources in production only */}
        {process.env.NODE_ENV === "production" &&
          process.env.DISABLE_HTTPS_HEADERS !== "true" && (
          <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        )}
      </head>
      <body suppressHydrationWarning>
        <OrganizationSchema />
        <main id="main-content">{children}</main>

        {/* GTM - Loaded only after the page is fully loaded to protect LCP */}
        <Script
          id="gtm-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var gtmLoaded = false;
                
                function addDNSPrefetch() {
                  // Add DNS prefetch dynamically only when needed
                  var link = document.createElement('link');
                  link.rel = 'dns-prefetch';
                  link.href = 'https://www.googletagmanager.com';
                  document.head.appendChild(link);
                }
                
                function initGTM() {
                  if (gtmLoaded) return;
                  gtmLoaded = true;
                  
                  // Add DNS prefetch right before loading GTM
                  addDNSPrefetch();
                  
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-5ZHV46X');
                }
                
                // Wait for page to be fully loaded
                function waitForLoad() {
                  if (document.readyState === 'complete') {
                    loadGTM();
                  } else {
                    window.addEventListener('load', loadGTM, { once: true });
                  }
                }
                
                function loadGTM() {
                  // Use requestIdleCallback for maximum web vitals protection
                  if ('requestIdleCallback' in window) {
                    requestIdleCallback(function() {
                      setTimeout(initGTM, 5000); // 5 second delay after idle
                    }, { timeout: 8000 }); // Fallback after 8 seconds max
                  } else {
                    // Fallback for browsers without requestIdleCallback
                    setTimeout(initGTM, 8000);
                  }
                }
                
                // Also load on first user interaction as backup
                var interactionEvents = ['scroll', 'mousedown', 'touchstart', 'keydown'];
                var interactionHandler = function() {
                  if (!gtmLoaded) {
                    setTimeout(initGTM, 3000);
                    interactionEvents.forEach(function(event) {
                      window.removeEventListener(event, interactionHandler);
                    });
                  }
                };
                
                interactionEvents.forEach(function(event) {
                  window.addEventListener(event, interactionHandler, { once: true, passive: true });
                });
                
                waitForLoad();
              })();
            `,
          }}
        />

        {/* Client-side scripts that need pathname */}
        <ClientScripts />
      </body>
    </html>
  );
}
