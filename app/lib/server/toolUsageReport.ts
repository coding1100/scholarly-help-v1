import { getMongoDatabase } from "@/app/lib/mongodb";

export type ToolUsageReportFilters = {
  from?: Date;
  to?: Date;
  toolName?: string;
  user?: string;
};

export type ToolUsageReportRow = {
  toolName: string;
  userKey: string;
  userType: "registered" | "guest" | "unknown";
  userId?: string;
  userEmail?: string;
  userName?: string;
  anonymousId?: string;
  country?: string;
  region?: string;
  city?: string;
  usageCount: number;
  firstUsedAt: Date;
  lastUsedAt: Date;
};

export type ToolUsageSummary = {
  totalUsers: number;
  totalTools: number;
  totalUsage: number;
  mostUsedTool: string | null;
  mostActiveUser: string | null;
  registeredUsers: number;
  guestUsers: number;
};

export const TOOL_USAGE_TOOL_OPTIONS = [
  "AI Detector Tool",
  "AI Thesis Statement Generator",
  "CGPA Calculator",
  "Citation Tool",
  "Essay Outline Tool",
  "Essay Generator",
  "Essay Grader",
  "Essay Title Generator",
  "Exam Prep",
  "Grammar Checker",
  "Humanizer Tool",
  "Language Practice",
  "Main Tool",
  "Math Solver (Local)",
  "Micro Learning",
  "Paragraph Generator",
  "Paraphraser Tool",
  "Plagiarism Checker",
  "Research Chat",
  "Research Review",
  "Research Question Generator",
  "Rewrite Action",
  "STEM Solver",
  "Summarizer Tool",
  "Tutor Tool",
] as const;

const BACKEND_SERVICE_LABELS: Record<string, string> = {
  "ai-detector": "AI Detector Tool",
  "citation-generator": "Citation Tool",
  "essay-generator": "Essay Generator",
  "essay-grader": "Essay Grader",
  "essay-outline": "Essay Outline Tool",
  "essay-title-generator": "Essay Title Generator",
  "grammar-check": "Grammar Checker",
  "humanizer": "Humanizer Tool",
  "paragraph-generator": "Paragraph Generator",
  "paraphrase": "Paraphraser Tool",
  "plagiarism-checker": "Plagiarism Checker",
  "research-chat": "Research Chat",
  "research-question-generator": "Research Question Generator",
  "research-review": "Research Review",
  "rewrite-action": "Rewrite Action",
  "stem-solver": "STEM Solver",
  "summarizer": "Summarizer Tool",
  "thesis-statement": "AI Thesis Statement Generator",
};

const backendServiceLabelSwitch = {
  $switch: {
    branches: Object.entries(BACKEND_SERVICE_LABELS).map(([service, label]) => ({
      case: { $eq: ["$service_used", service] },
      then: label,
    })),
    default: "$service_used",
  },
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseToolUsageFilters(searchParams: URLSearchParams) {
  const fromRaw = searchParams.get("from");
  const toRaw = searchParams.get("to");
  const defaultTo = new Date();
  defaultTo.setUTCHours(23, 59, 59, 999);
  const defaultFrom = new Date(defaultTo);
  defaultFrom.setUTCMonth(defaultFrom.getUTCMonth() - 3);
  defaultFrom.setUTCHours(0, 0, 0, 0);

  const from = fromRaw ? new Date(fromRaw) : defaultFrom;
  const to = toRaw ? new Date(toRaw) : defaultTo;
  if (from && /^\d{4}-\d{2}-\d{2}$/.test(fromRaw || "")) {
    from.setUTCHours(0, 0, 0, 0);
  }
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(toRaw || "")) {
    to.setUTCHours(23, 59, 59, 999);
  }

  return {
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    toolName: searchParams.get("tool")?.trim() || undefined,
    user: searchParams.get("user")?.trim() || undefined,
  } satisfies ToolUsageReportFilters;
}

export function buildToolUsageMatch(filters: ToolUsageReportFilters) {
  const match: Record<string, unknown> = {};
  if (filters.from || filters.to) {
    match.usedAt = {
      ...(filters.from ? { $gte: filters.from } : {}),
      ...(filters.to ? { $lte: filters.to } : {}),
    };
  }
  if (filters.toolName) {
    match.toolName = filters.toolName;
  }
  if (filters.user) {
    const pattern = new RegExp(escapeRegex(filters.user), "i");
    match.$or = [
      { userName: pattern },
      { userEmail: pattern },
      { userId: pattern },
      { anonymousId: pattern },
      { userKey: pattern },
    ];
  }
  return match;
}

export async function getToolUsageReport(filters: ToolUsageReportFilters = {}) {
  const db = await getMongoDatabase(process.env.TOOL_USAGE_DATABASE_NAME || "scholarly_help");
  if (!db) throw new Error("Database not configured");

  const match = buildToolUsageMatch(filters);
  const normalizedEventsPipeline = [
    {
      $project: {
        toolName: "$toolName",
        usedAt: "$usedAt",
        userKey: "$userKey",
        userType: {
          $switch: {
            branches: [
              { case: { $ne: [{ $ifNull: ["$userId", null] }, null] }, then: "registered" },
              { case: { $ne: [{ $ifNull: ["$userEmail", null] }, null] }, then: "registered" },
              { case: { $ne: [{ $ifNull: ["$anonymousId", null] }, null] }, then: "guest" },
            ],
            default: "unknown",
          },
        },
        userId: "$userId",
        userEmail: "$userEmail",
        userName: "$userName",
        anonymousId: "$anonymousId",
        country: "$country",
        region: "$region",
        city: "$city",
      },
    },
    {
      $unionWith: {
        coll: "usagehistories",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              toolName: backendServiceLabelSwitch,
              usedAt: "$createdAt",
              userKey: {
                $concat: [
                  "user:",
                  {
                    $toString: {
                      $ifNull: ["$user.user_id", "$user_id"],
                    },
                  },
                ],
              },
              userType: "registered",
              userId: "$user.user_id",
              userEmail: "$user.email",
              userName: "$user.name",
              anonymousId: null,
              country: null,
              region: null,
              city: null,
            },
          },
        ],
      },
    },
    { $match: match },
  ];

  const collection = db.collection("tool_usage_events");

  const [rows, toolTotals, userTotals, usageCountResult] = await Promise.all([
    collection
      .aggregate<ToolUsageReportRow>([
        ...normalizedEventsPipeline,
        { $sort: { usedAt: 1 } },
        {
          $group: {
            _id: { toolName: "$toolName", userKey: "$userKey" },
            toolName: { $first: "$toolName" },
            userKey: { $first: "$userKey" },
            userType: { $last: "$userType" },
            userId: { $last: "$userId" },
            userEmail: { $last: "$userEmail" },
            userName: { $last: "$userName" },
            anonymousId: { $last: "$anonymousId" },
            country: { $last: "$country" },
            region: { $last: "$region" },
            city: { $last: "$city" },
            usageCount: { $sum: 1 },
            firstUsedAt: { $min: "$usedAt" },
            lastUsedAt: { $max: "$usedAt" },
          },
        },
        { $sort: { toolName: 1, usageCount: -1, lastUsedAt: -1 } },
        { $limit: 10000 },
        { $project: { _id: 0 } },
      ])
      .toArray(),
    collection
      .aggregate<{ toolName: string; usageCount: number }>([
        ...normalizedEventsPipeline,
        { $group: { _id: "$toolName", usageCount: { $sum: 1 } } },
        { $project: { _id: 0, toolName: "$_id", usageCount: 1 } },
        { $sort: { usageCount: -1, toolName: 1 } },
      ])
      .toArray(),
    collection
      .aggregate<{ userKey: string; label: string; usageCount: number }>([
        ...normalizedEventsPipeline,
        {
          $group: {
            _id: "$userKey",
            label: {
              $last: {
                $ifNull: [
                  "$userEmail",
                  { $ifNull: ["$userName", { $ifNull: ["$userId", "$anonymousId"] }] },
                ],
              },
            },
            usageCount: { $sum: 1 },
          },
        },
        { $project: { _id: 0, userKey: "$_id", label: 1, usageCount: 1 } },
        { $sort: { usageCount: -1 } },
        { $limit: 10 },
      ])
      .toArray(),
    collection
      .aggregate<{ totalUsage: number }>([
        ...normalizedEventsPipeline,
        { $count: "totalUsage" },
      ])
      .toArray(),
  ]);
  const totalUsage = usageCountResult[0]?.totalUsage || 0;

  const summary: ToolUsageSummary = {
    totalUsers: new Set(rows.map((row) => row.userKey)).size,
    totalTools: toolTotals.length,
    totalUsage,
    mostUsedTool: toolTotals[0]?.toolName || null,
    mostActiveUser: userTotals[0]?.label || null,
    registeredUsers: new Set(
      rows.filter((row) => row.userType === "registered").map((row) => row.userKey),
    ).size,
    guestUsers: new Set(
      rows.filter((row) => row.userType === "guest").map((row) => row.userKey),
    ).size,
  };

  return { summary, rows, toolTotals, userTotals };
}
