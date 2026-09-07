"use client";
import React, { useRef } from "react";

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onChange }) => {
  const inputs = Array.from({ length });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const digits = e.target.value.replace(/\D/g, "");
    // A multi-digit value here means a paste landed in a single box (some
    // browsers don't clamp pasted text to maxLength before firing onChange);
    // distribute it starting at this box instead of dropping it.
    if (digits.length > 1) {
      distributeDigits(digits, idx);
      return;
    }
    const val = digits;
    e.target.value = val;
    onChange(inputRefs.current.map((input) => input?.value || "").join(""));
    if (val && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const distributeDigits = (digits: string, startIdx: number) => {
    const chars = digits.split("");
    let lastFilledIdx = startIdx;
    for (let i = startIdx; i < length && chars.length > 0; i++) {
      const char = chars.shift();
      const input = inputRefs.current[i];
      if (input && char) {
        input.value = char;
        lastFilledIdx = i;
      }
    }
    onChange(inputRefs.current.map((input) => input?.value || "").join(""));
    const nextIdx = Math.min(lastFilledIdx + 1, length - 1);
    inputRefs.current[nextIdx]?.focus();
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    distributeDigits(pasted, idx);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === "Backspace" && !inputRefs.current[idx]?.value && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-4 justify-center">
      {inputs.map((_, idx) => (
        <input
          key={idx}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-16 border-2 border-gray-300 rounded-lg text-center text-2xl focus:outline-none focus:border-[#2b7fff] transition-all"
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={(e) => handlePaste(e, idx)}
        />
      ))}
    </div>
  );
};

export default OTPInput;
