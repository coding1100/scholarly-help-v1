"use client";

let scanAccessToken = "";

export const getScanAccessToken = () => scanAccessToken;
export const setScanAccessToken = (token: string) => {
  scanAccessToken = token || "";
  if (typeof window !== "undefined") window.localStorage.removeItem("authToken");
};
export const clearScanAccessToken = () => {
  scanAccessToken = "";
  if (typeof window !== "undefined") window.localStorage.removeItem("authToken");
};
