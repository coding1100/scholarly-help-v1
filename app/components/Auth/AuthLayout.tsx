"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import InfoSection from "./InfoSection";
import Header from "../LandingPage/Header";
import Footer from "../Footer/Footer";
import TrackingParamKeeper from "@/app/components/TrackingParamKeeper";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div>
      <TrackingParamKeeper />
      <Header />
      <main className="min-h-screen w-full bg-[#D1D1F7] flex items-center justify-center overflow-hidden py-16">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
            {/* Left Column */}
            <InfoSection />

            {/* Right Column */}
            <div className="col-span-1 h-full flex  items-center justify-center lg:block">
              <div className="bg-[#9F92EC] -rotate-12 w-fit rounded-3xl h-full ">
                <div className="bg-white rotate-12 h-full px-4 md:px-[40px] py-6 rounded-xl w-[300px] md:w-[432px] relative z-10">
                  {children}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Image */}
          <div
            className="absolute -bottom-24 lg:-right-24 xl:-right-8 z-0 hidden lg:block"
            style={{ width: "283px", height: "auto" }}
          >
            {/* <Image
              src={SignInImage}
              alt="A woman smiling and pointing towards the sign-in form"
              quality={100}
              className="object-cover"
              priority
            /> */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
