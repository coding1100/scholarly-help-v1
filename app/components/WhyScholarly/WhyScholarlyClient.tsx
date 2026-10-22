"use client";

import dynamic from "next/dynamic";
import React, { FC, ComponentProps } from "react";
import WhyScholarly from "./WhyScholarly";

const WhyScholarlyInternal = dynamic(() => import("./WhyScholarly"), {
  ssr: false,
});

const WhyScholarlyClient: FC<ComponentProps<typeof WhyScholarly>> = (props) => {
  return <WhyScholarlyInternal {...props} />;
};

export default WhyScholarlyClient;
