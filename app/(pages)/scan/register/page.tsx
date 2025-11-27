"use client";

import React from "react";
import Register from "./components/Register";
import Scan from "@/app/layouts/Scan";

const page = () => {
  return (
    <Scan hideFooter>
      <Register />
    </Scan>
  );
};

export default page;
