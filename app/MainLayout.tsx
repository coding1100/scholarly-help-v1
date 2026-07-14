"use client";
import { FC, ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import AuthProvider from "./context/auth/AuthProvider";
import AppNav from "./components/LandingPage/Header";
import Footer from "./components/Footer/Footer";

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

  const normalizedPath = (pathname || "").replace(/\/+$/, "") || "/";
  const isLandingStylePath =
    normalizedPath.startsWith("/landing") ||
    normalizedPath === "/take-my-class" ||
    normalizedPath.startsWith("/take-my-class-");

  const shouldHideHeaderFooter =
    hideHeaderFooterRoutes.includes(pathname || "") || isLandingStylePath;

  return (
    <AuthProvider>
      <AppNav />
      {children}
      {!shouldHideHeaderFooter && <Footer />}
      <WhatsApp />
    </AuthProvider>
  );
};

export default MainLayout;
