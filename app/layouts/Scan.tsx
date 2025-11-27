"use client";
import React, { FC } from "react";
// import Header from "../(pages)/solver/components/header";
// import Footer from "../(pages)/solver/components/footer";
import Header from "../(pages)/scan/components/header";
import Footer from "../(pages)/scan/components/footer";
import { Toaster } from "react-hot-toast";

type ScanProps = {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
};

const Scan: FC<ScanProps> = ({ children, hideFooter, hideHeader }) => {
  return (
    <>
      {!hideHeader && <Header />}
      {children}
      {!hideFooter && <Footer />}
      <Toaster />
    </>
  );
};

export default Scan;
