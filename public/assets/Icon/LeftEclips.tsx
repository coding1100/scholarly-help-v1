import React, { FC } from "react";

type IconProps = {
  className?: string;
};

const LeftEclips: FC<IconProps> = ({ className }) => {
  return (
    <svg
      width="104"
      height="267"
      viewBox="0 0 104 267"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="-29.5"
        cy="133.5"
        r="117.5"
        stroke="black"
        strokeOpacity="0.04"
        strokeWidth="32"
      />
    </svg>
  );
};

export default LeftEclips;
