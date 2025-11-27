"use client";

import Scan from "@/app/layouts/Scan";
import Excercise from "./components/Excercise";

const page = () => {
  return (
    <Scan hideFooter hideHeader>
      <Excercise />
    </Scan>
  );
};

export default page;
