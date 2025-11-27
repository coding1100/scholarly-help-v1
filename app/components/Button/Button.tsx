"use client";
import clsx from "clsx";
import { FC } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  type?: "button" | "submit";
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  className?: string;
}
const Button: FC<ButtonProps> = ({
  type = "button",
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "lg",
  className,
}) => {
  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={twMerge(
        clsx(
          `rounded-md w-fit px-3 border-2 border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-primary-400 hover:border-primary-400 hover:border`,
          variant === "primary" && "bg-primary-400 text-white border",
          size === "sm" && "h-[32px]",
          size === "md" && "h-[36px]",
          size === "lg" && "h-[54px]",
          disabled && "bg-gray-300 cursor-not-allowed hover:bg-gray-300"
        ),
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default Button;
