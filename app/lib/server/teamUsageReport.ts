import { getMongoDatabase } from "@/app/lib/mongodb";

/**
 * Usage of the internal team account (backend User.unlimited_usage). Its runs
 * skip the credit ledger, so the backend logs each one to
 * internal_usage_events instead; this reads that collection directly, the same
 * way the Tool Usage report reads usagehistories.
 */

export const TEAM_USAGE_TOOLS: Record<string, string> = {
  humanizer: "Humanizer",
  "ai-detector": "AI Detector",
  "plagiarism-checker": "Plagiarism Checker",
};

const ACTION_LABELS: Record<string, string> = {
  rewrite: "Rewrite",
  scan: "Scan",
  "image-ocr": "Image text extraction",
  "pdf-report": "PDF report",
};

export const toolLabel = (tool: string) => TEAM_USAGE_TOOLS[tool] ?? tool;
export const actionLabel = (action: string) => ACTION_LABELS[action] ?? action;

export type TeamUsageFilters = { from: Date; to: Date; tool?: string };

export type TeamUsageEvent = {
  tool: string;
  action: string;
  email?: string;
  words: number;
  status: "success" | "error";
  status_code?: number;
  error_message?: string;
  duration_ms: number;
  createdAt: Date;
};

const DEFAULT_RANGE_DAYS = 30;

export function parseTeamUsageFilters(searchParams: URLSearchParams): TeamUsageFilters {
  const parse = (value: string | null, endOfDay: boolean) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return null;
    if (endOfDay) date.setUTCHours(23, 59, 59, 999);
    return date;
  };
  const to = parse(searchParams.get("to"), true) ?? new Date(new Date().setUTCHours(23, 59, 59, 999));
  const from =
    parse(searchParams.get("from"), false) ??
    new Date(new Date(to.getTime() - (DEFAULT_RANGE_DAYS - 1) * 86_400_000).setUTCHours(0, 0, 0, 0));
  const tool = searchParams.get("tool");
  return { from, to, tool: tool && tool in TEAM_USAGE_TOOLS ? tool : undefined };
}

export async function getTeamUsageReport(filters: TeamUsageFilters) {
  const db = await getMongoDatabase(process.env.TOOL_USAGE_DATABASE_NAME || "scholarly_help");
  if (!db) throw new Error("Database not configured");

  const match: Record<string, unknown> = { createdAt: { $gte: filters.from, $lte: filters.to } };
  if (filters.tool) match.tool = filters.tool;
  const events = db.collection<TeamUsageEvent>("internal_usage_events");
  const errorFlag = { $cond: [{ $eq: ["$status", "error"] }, 1, 0] };
  const successWords = { $cond: [{ $eq: ["$status", "success"] }, "$words", 0] };

  const [byAction, byDay, recent] = await Promise.all([
    events
      .aggregate<{ tool: string; action: string; runs: number; errors: number; words: number; lastUsedAt: Date }>([
        { $match: match },
        {
          $group: {
            _id: { tool: "$tool", action: "$action" },
            runs: { $sum: 1 },
            errors: { $sum: errorFlag },
            words: { $sum: successWords },
            lastUsedAt: { $max: "$createdAt" },
          },
        },
        { $project: { _id: 0, tool: "$_id.tool", action: "$_id.action", runs: 1, errors: 1, words: 1, lastUsedAt: 1 } },
        { $sort: { runs: -1 } },
      ])
      .toArray(),
    events
      .aggregate<{ day: string; tool: string; runs: number }>([
        { $match: match },
        {
          $group: {
            _id: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, tool: "$tool" },
            runs: { $sum: 1 },
          },
        },
        { $project: { _id: 0, day: "$_id.day", tool: "$_id.tool", runs: 1 } },
        { $sort: { day: -1 } },
      ])
      .toArray(),
    events.find(match, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(100).toArray(),
  ]);

  const totals = byAction.reduce(
    (sum, row) => ({ runs: sum.runs + row.runs, errors: sum.errors + row.errors, words: sum.words + row.words }),
    { runs: 0, errors: 0, words: 0 },
  );

  const days = new Map<string, Record<string, number>>();
  for (const row of byDay) {
    const counts = days.get(row.day) ?? {};
    counts[row.tool] = row.runs;
    days.set(row.day, counts);
  }

  return {
    totals,
    byAction,
    byDay: [...days.entries()].map(([day, counts]) => ({ day, counts })),
    recent,
  };
}
