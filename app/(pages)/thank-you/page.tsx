"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import AppNav from "@/app/components/NavBar/AppNav";
import ThankYou from "@/app/components/ThankYou/ThankYou";
import MainLayout from "@/app/MainLayout";

const page = () => {
  return (
    <MainLayout>
      <ThankYou />
    </MainLayout>
  );
};

export default page;
