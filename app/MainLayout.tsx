<<<<<<< HEAD
"use client";
import { FC, ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
=======
import { FC, ReactNode } from "react";
import dynamic from "next/dynamic";
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8

import AuthProvider from "./context/auth/AuthProvider";
import AppNav from "./components/LandingPage/Header";
import Footer from "./components/Footer/Footer";
<<<<<<< HEAD
=======
import FooterGate from "./components/LandingPage/FooterGate";
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8

const WhatsApp = dynamic(() => import("./components/WhatsApp/WhatsApp"), {
  ssr: false,
});

interface MainLayoutProps {
  children: ReactNode;
}
const MainLayout: FC<MainLayoutProps> = ({ children }) => {
<<<<<<< HEAD
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

=======
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
  return (
    <AuthProvider>
      <AppNav />
      {children}
<<<<<<< HEAD
      {!shouldHideHeaderFooter && <Footer />}
=======
      <FooterGate>
        <Footer />
      </FooterGate>
>>>>>>> 2995a8003cbf53e9f2219f5b63f9a0fbd94c9eb8
      <WhatsApp />
    </AuthProvider>
  );
};

export default MainLayout;
