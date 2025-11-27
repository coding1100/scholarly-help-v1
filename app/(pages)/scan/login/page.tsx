"use client";

import React from "react";
import Login from "./components/Login";
import Scan from "@/app/layouts/Scan";

const page = () => {
  return (
    <Scan hideFooter>
      <Login />
    </Scan>
  );
};

export default page;
