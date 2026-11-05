"use client";

import dynamic from "next/dynamic";
import React, { FC } from "react";

const GetQuoteInternal = dynamic(() => import("./GetQoute"), {
  ssr: false,
});

const GetQouteClient: FC<any> = (props) => {
  return <GetQuoteInternal {...props} />;
};

export default GetQouteClient;
