"use client";
import { FC, ReactNode, useState, useCallback, useEffect } from "react"; // Added useEffect
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import AuthProvider from "./context/auth/AuthProvider";
import AppNav from "./components/LandingPage/Header";
import Footer from "./components/Footer/Footer";

const ExitPopUp = dynamic(() => import("./components/PopUpModal/ExitPopup"), {
  ssr: false,
});

const CookieBanner = dynamic(() => import("./components/CookieConsent"), {
  ssr: false,
});

const WhatsApp = dynamic(() => import("./components/WhatsApp/WhatsApp"), {
  ssr: false,
});

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Routes where header and footer should be hidden
  const hideHeaderFooterRoutes = [
    "/take-my-class",
    "/take-my-class/",
    "/take-my-class-1",
    "/take-my-class-1/",
    "/take-my-class-2",
    "/take-my-class-2/",
    "/take-my-class-3",
    "/take-my-class-3/",
    "/take-my-class-professor-does-not-care",
    "/take-my-class-professor-does-not-care/",
    "/take-my-class-still-doing",
    "/take-my-class-still-doing/",
    "/take-my-class-protect-gpa",
    "/take-my-class-protect-gpa/",
    "/take-my-class-always-working-harder",
    "/take-my-class-always-working-harder/",
    "/take-my-class-saving-your-future",
    "/take-my-class-saving-your-future/",
    "/take-my-exam",
    "/take-my-exam/",
  ];

  const shouldHideHeaderFooter = hideHeaderFooterRoutes.includes(
    pathname || "",
  );

  // Routes where the header should be deferred until interaction to optimize LCP
  const deferHeaderRoutes = [
    "/take-my-class",
    "/take-my-class/",
    "/take-my-class-1",
    "/take-my-class-1/",
    "/take-my-class-2",
    "/take-my-class-2/",
    "/take-my-class-3",
    "/take-my-class-3/",
    "/take-my-class-professor-does-not-care",
    "/take-my-class-professor-does-not-care/",
    "/take-my-class-still-doing",
    "/take-my-class-still-doing/",
    "/take-my-class-protect-gpa",
    "/take-my-class-protect-gpa/",
    "/take-my-class-always-working-harder",
    "/take-my-class-always-working-harder/",
    "/take-my-class-saving-your-future",
    "/take-my-class-saving-your-future/",
    "/take-my-exam",
    "/take-my-exam/",
  ];

  const shouldDeferHeader = deferHeaderRoutes.includes(pathname || "");
  const [headerVisible, setHeaderVisible] = useState(!shouldDeferHeader);

  // Defer cookie consent until after interaction so LCP is not affected
  const [cookieBannerReady, setCookieBannerReady] = useState(false);

  // Detect user interaction to load deferred header
  useEffect(() => {
    if (!shouldDeferHeader || headerVisible) return;

    const handleInteraction = () => {
      setHeaderVisible(true);
      removeEventListeners();
    };

    const removeEventListeners = () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };

    window.addEventListener("scroll", handleInteraction, { passive: true });
    window.addEventListener("mousemove", handleInteraction, { passive: true });
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("keydown", handleInteraction, { passive: true });

    // Fallback: Show header after 2.5 seconds if no interaction occurs
    const timer = setTimeout(() => {
      setHeaderVisible(true);
      removeEventListeners();
    }, 2500);

    return () => {
      removeEventListeners();
      clearTimeout(timer);
    };
  }, [shouldDeferHeader, headerVisible]);

  // Load cookie consent only after first interaction (scroll, click, touch, key) to protect LCP / CLS in lab tests
  useEffect(() => {
    if (cookieBannerReady) return;

    const showBanner = () => {
      setCookieBannerReady(true);
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener("scroll", showBanner);
      window.removeEventListener("mousedown", showBanner);
      window.removeEventListener("touchstart", showBanner);
      window.removeEventListener("keydown", showBanner);
    };

    window.addEventListener("scroll", showBanner, { passive: true });
    window.addEventListener("mousedown", showBanner);
    window.addEventListener("touchstart", showBanner);
    window.addEventListener("keydown", showBanner);

    return () => {
      removeListeners();
    };
  }, [cookieBannerReady]);

  return (
    <AuthProvider>
      {headerVisible ? <AppNav /> : <div style={{ minHeight: "64px" }} />}
      {children}
      {!shouldHideHeaderFooter && <Footer />}
      <WhatsApp />
      {/* {cookieBannerReady && <CookieBanner />} */}
      {/* <ExitPopUp
          open={openExitPopup}
          handleClose={() => setOpenExitPopup(false)}
        />
      </div> */}
    </AuthProvider>
  );
};

export default MainLayout;
