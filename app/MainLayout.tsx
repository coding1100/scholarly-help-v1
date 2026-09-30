import { FC, ReactNode } from "react";
import dynamic from "next/dynamic";

import AuthProvider from "./context/auth/AuthProvider";
import AppNav from "./components/LandingPage/Header";
import Footer from "./components/Footer/Footer";
import FooterGate from "./components/LandingPage/FooterGate";

const WhatsApp = dynamic(() => import("./components/WhatsApp/WhatsApp"), {
  ssr: false,
});

interface MainLayoutProps {
  children: ReactNode;
}
const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AppNav />
      {children}
      <FooterGate>
        <Footer />
      </FooterGate>
      <WhatsApp />
    </AuthProvider>
  );
};

export default MainLayout;
