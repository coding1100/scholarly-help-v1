import type { ReactNode } from "react";
import { Inter, Merriweather, Merriweather_Sans, Roboto } from "next/font/google";
import MainLayout from "@/app/MainLayout";
import "./blog.css";

// Fonts used by the former WordPress blog template; loaded only on /blog pages.
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-merriweather",
});
const merriweatherSans = Merriweather_Sans({
  subsets: ["latin"],
  weight: ["300", "700"],
  display: "swap",
  variable: "--font-merriweather-sans",
});
const inter = Inter({ subsets: ["latin"], weight: ["400", "700", "800"], display: "swap", variable: "--font-inter" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-roboto" });

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <div
        className={`blog-root ${merriweather.variable} ${merriweatherSans.variable} ${inter.variable} ${roboto.variable}`}
      >
        {children}
      </div>
    </MainLayout>
  );
}
