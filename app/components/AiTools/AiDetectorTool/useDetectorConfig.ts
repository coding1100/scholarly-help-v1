"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { type DetectorPublicConfig, FALLBACK_DETECTOR_CONFIG } from "./types";

let cachedConfig: DetectorPublicConfig | null = null;
let configRequest: Promise<DetectorPublicConfig> | null = null;

function isDetectorConfig(value: unknown): value is DetectorPublicConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<DetectorPublicConfig>;
  return (
    Number.isFinite(config.minimum_words) &&
    Number.isFinite(config.low_confidence_words) &&
    Number.isFinite(config.maximum_words) &&
    typeof config.metric_version === "string"
  );
}

async function loadDetectorConfig(): Promise<DetectorPublicConfig> {
  if (cachedConfig) return cachedConfig;
  if (!configRequest) {
    configRequest = axios
      .get(`${process.env.NEXT_PUBLIC_NGROX_URL}/tools/ai-detect/config`)
      .then((response) => {
        const candidate = response.data?.data ?? response.data;
        cachedConfig = isDetectorConfig(candidate)
          ? candidate
          : FALLBACK_DETECTOR_CONFIG;
        return cachedConfig;
      })
      .catch(() => FALLBACK_DETECTOR_CONFIG)
      .finally(() => {
        configRequest = null;
      });
  }
  return configRequest;
}

/**
 * The API is the canonical source for detector limits. The matching fallback
 * keeps the form usable during a rolling deployment or a transient config error.
 */
export function useDetectorConfig(): DetectorPublicConfig {
  const [config, setConfig] = useState<DetectorPublicConfig>(
    cachedConfig ?? FALLBACK_DETECTOR_CONFIG,
  );

  useEffect(() => {
    let active = true;
    void loadDetectorConfig().then((nextConfig) => {
      if (active) setConfig(nextConfig);
    });
    return () => {
      active = false;
    };
  }, []);

  return config;
}
