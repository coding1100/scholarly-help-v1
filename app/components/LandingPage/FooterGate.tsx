"use client";
import { FC, ReactNode } from "react";
import { usePathname } from "next/navigation";

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

interface FooterGateProps {
  children: ReactNode;
}

const FooterGate: FC<FooterGateProps> = ({ children }) => {
  const pathname = usePathname();

  const normalizedPath = (pathname || "").replace(/\/+$/, "") || "/";
  const isLandingStylePath =
    normalizedPath.startsWith("/landing") ||
    normalizedPath === "/take-my-class" ||
    normalizedPath.startsWith("/take-my-class-");

  const shouldHideHeaderFooter =
    hideHeaderFooterRoutes.includes(pathname || "") || isLandingStylePath;

  if (shouldHideHeaderFooter) return null;

  return <>{children}</>;
};

export default FooterGate;
