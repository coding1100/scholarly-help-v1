"use client";

import React, { useState } from "react";

function ExpandingBox() {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`bg-gray-200 px-4 py-4 rounded-lg cursor-pointer hover:bg-gray-300 transition-all duration-500 ${
        isExpanded ? "h-[500px]" : "h-[100px]"
      }`}
      onClick={handleClick}
    >
      Click to expand
    </div>
  );
}

export default ExpandingBox;
