"use client";

import { FC, useState } from "react";

interface CopyRightProps {}
const CopyRight: FC<CopyRightProps> = ({}) => {
  return (
    <div className="bg-primary-500 py-6">
      <div className="container mx-auto px-10 text-white text-center text-sm flex flex-col gap-3">
        <p>
          Copyrights © {new Date().getFullYear()} All Rights Reserved by
          Scholarly Help
        </p>
        <p>Website owned and operated by Eliya Enterprises.</p>
      </div>
    </div>
  );
};

export default CopyRight;
