"use client";

import Image, { StaticImageData } from "next/image";
import React from "react";

type HeroWhySliderCardProps = {
  icon: StaticImageData | string;
  text: string;
  alt?: string;
  className?: string;
};

export default function HeroWhySliderCard({
  icon,
  text,
  alt = "",
  className = "",
}: HeroWhySliderCardProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-black/5 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex h-[75px] w-[75px] items-center justify-center">
        <Image
          src={icon}
          alt={alt || text}
          width={75}
          height={75}
          className="h-[75px] w-[75px] object-contain"
          priority
        />
      </div>
      <p className="sm:text-[23px] text-lg font-medium leading-snug text-neutral-900">
        {text}
      </p>
    </div>
  );
}
