export type MatchTier = "high" | "medium" | "low";

export interface SimilarityMatch {
  id: string;
  text: string;
  start: number;
  end: number;
  token_count: number;
  percent_similar: number;
  tier: MatchTier;
  tier_label: string;
  source: { id: string; url: string } | null;
}

export interface SimilaritySource {
  id: string;
  url: string;
  domain: string;
  percent: number;
  match_count: number;
  title?: string;
}

export interface SimilarityResult {
  score: number;
  word_count: number;
  sentence_count: number;
  matches: SimilarityMatch[];
  sources: SimilaritySource[];
  breakdown: { copied: number; paraphrased: number; common: number };
  provider: "copyleaks";
}

export interface PlagiarismScan {
  status: "queued" | "processing" | "completed" | "failed";
  scan_id: string;
  title: string;
  word_count: number;
  progress: number;
  options: ScanSettings;
  revision: {
    scan_id: string;
    title: string;
    similarity_percent: number;
    scanned_at: string;
  } | null;
  result?: SimilarityResult;
  error?: string;
  provider: "copyleaks";
  provider_pending?: boolean;
  provider_message?: string;
  retry_after_seconds?: number;
}

export interface ScanSettings {
  exclude_bibliography: boolean;
  exclude_quotes: boolean;
  compare_past_scans: boolean;
  contribute_to_database: boolean;
}
