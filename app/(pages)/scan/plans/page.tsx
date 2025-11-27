"use client";
import React, { useEffect, useState } from "react";
import Scan from "@/app/layouts/Scan";
import Plans from "./components/Plans";
import PaymentErrDialog from "./components/PaymentErrDialog";
import { useUrl } from "nextjs-current-url";

const page = () => {
  return (
    <Scan>
      <Plans />
    </Scan>
  );
};

export default page;
