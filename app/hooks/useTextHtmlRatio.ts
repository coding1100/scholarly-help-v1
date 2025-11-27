import { useState, useEffect } from "react";

type TextHtmlRatioInfo = {
  textLength: number;
  htmlLength: number;
  ratio: number;
} | null;

export function useTextHtmlRatio(): TextHtmlRatioInfo {
  const [ratioInfo, setRatioInfo] = useState<TextHtmlRatioInfo>(null);

  useEffect(() => {
    const htmlContent = document.documentElement.outerHTML;
    const textContent = document.body.innerText || "";

    const htmlLength = htmlContent.length;
    const textLength = textContent.length;
    const ratio = parseFloat(((textLength / htmlLength) * 100).toFixed(2));

    setRatioInfo({
      textLength,
      htmlLength,
      ratio,
    });
  }, []);

  return ratioInfo;
}
