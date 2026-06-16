"use client";
import React, { FC } from "react";
// import Header from "../(pages)/solver/components/header";
// import Footer from "../(pages)/solver/components/footer";
import Header from "../(pages)/scan/components/header";
import Footer from "../(pages)/scan/components/footer";

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
    </>
  );
};

export default Scan;
