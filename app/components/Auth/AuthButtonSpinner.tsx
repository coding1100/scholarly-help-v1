"use client";

import { ColorRing } from "react-loader-spinner";

type RingColors = [string, string, string, string, string];

type AuthButtonSpinnerProps = {
  /** Pixel size of the spinner (square). Defaults to 24 to match auth buttons. */
  size?: number;
  /** Ring colors. Defaults to solid white for use inside filled buttons. */
  colors?: RingColors;
};

const WHITE_RING: RingColors = ["white", "white", "white", "white", "white"];

/**
 * The single in-button loading spinner used across the auth flows (Sign In,
 * Sign Up, social auth, logout). Previously the same ColorRing config was
 * copy-pasted in every auth surface; this centralizes it so size/colour stay
 * consistent and there is one place to change it.
 */
export default function AuthButtonSpinner({
  size = 24,
  colors = WHITE_RING,
}: AuthButtonSpinnerProps) {
  return (
    <ColorRing
      height={String(size)}
      width={String(size)}
      ariaLabel="Loading"
      colors={colors}
      wrapperStyle={{}}
      wrapperClass=""
    />
  );
}
